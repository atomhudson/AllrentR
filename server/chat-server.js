require('dotenv').config();
const WebSocket = require('ws');
const http = require('http');
const { createClient } = require('@supabase/supabase-js');
const { Redis } = require('@upstash/redis');

// Initialize Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Initialize Upstash Redis (REST API)
let redis = null;
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  try {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
    console.log('Upstash Redis initialized');
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
  }
} else {
  console.warn('Redis credentials not provided, running without Redis');
}

// Health check endpoint
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'ok', 
      service: 'chat-server',
      timestamp: new Date().toISOString(),
      redis: redis ? 'connected' : 'not configured'
    }));
  } else {
    res.writeHead(404);
    res.end('Not Found');
  }
});

const wss = new WebSocket.Server({ server });

// Store active connections: userId -> WebSocket
const connections = new Map();
// Store user rooms: userId -> Set of conversationIds
const userRooms = new Map();

// Helper to verify JWT token
async function verifyToken(token) {
  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

// Helper to get conversation participants
async function getConversationParticipants(conversationId) {
  const { data, error } = await supabase
    .from('conversations')
    .select('owner_id, leaser_id')
    .eq('id', conversationId)
    .single();
  
  if (error || !data) return null;
  return { ownerId: data.owner_id, leaserId: data.leaser_id };
}

wss.on('connection', async (ws, req) => {
  console.log('New WebSocket connection attempt');
  
  // Extract token from query string or headers
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    ws.close(1008, 'Authentication required');
    return;
  }

  // Verify token
  const user = await verifyToken(token);
  if (!user) {
    ws.close(1008, 'Invalid token');
    return;
  }

  console.log(`User ${user.id} connected`);
  connections.set(user.id, ws);
  if (!userRooms.has(user.id)) {
    userRooms.set(user.id, new Set());
  }

  // Send connection confirmation
  ws.send(JSON.stringify({
    type: 'connection',
    status: 'connected',
    userId: user.id
  }));

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message.toString());
      
      switch (data.type) {
        case 'join_conversation':
          await handleJoinConversation(ws, user.id, data.conversationId);
          break;
        
        case 'leave_conversation':
          await handleLeaveConversation(user.id, data.conversationId);
          break;
        
        case 'send_message':
          await handleSendMessage(user.id, data);
          break;
        
        case 'typing':
          await handleTyping(user.id, data);
          break;
        
        case 'stop_typing':
          await handleStopTyping(user.id, data);
          break;
        
        case 'mark_read':
          await handleMarkRead(user.id, data);
          break;
        
        case 'delete_message':
          await handleDeleteMessage(user.id, data);
          break;
        
        case 'user_online':
          await handleUserOnline(user.id);
          break;
        
        default:
          ws.send(JSON.stringify({
            type: 'error',
            message: 'Unknown message type'
          }));
      }
    } catch (error) {
      console.error('Error handling message:', error);
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Error processing message'
      }));
    }
  });

  ws.on('close', async () => {
    console.log(`User ${user.id} disconnected`);
    
    // Update online status
    try {
      await supabase
        .from('online_status')
        .upsert({
          user_id: user.id,
          is_online: false,
          last_seen: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error updating online status:', error);
    }

    // Notify users in conversations
    const { data: conversations } = await supabase
      .from('conversations')
      .select('owner_id, leaser_id')
      .or(`owner_id.eq.${user.id},leaser_id.eq.${user.id}`);

    if (conversations) {
      const userIds = new Set();
      conversations.forEach(conv => {
        if (conv.owner_id !== user.id) userIds.add(conv.owner_id);
        if (conv.leaser_id !== user.id) userIds.add(conv.leaser_id);
      });

      userIds.forEach(otherUserId => {
        const ws = connections.get(otherUserId);
        if (ws) {
          ws.send(JSON.stringify({
            type: 'user_offline',
            userId: user.id
          }));
        }
      });
    }

    connections.delete(user.id);
    userRooms.delete(user.id);
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error for user ${user.id}:`, error);
  });
});

async function handleJoinConversation(ws, userId, conversationId) {
  // Verify user is part of conversation
  const participants = await getConversationParticipants(conversationId);
  if (!participants || (participants.ownerId !== userId && participants.leaserId !== userId)) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Not authorized to join this conversation'
    }));
    return;
  }

  userRooms.get(userId)?.add(conversationId);
  
  // Check for pending messages in Redis (offline messages)
  if (redis) {
    try {
      const pendingMessages = await redis.lrange(`messages:${userId}:${conversationId}`, 0, -1);
      if (pendingMessages && pendingMessages.length > 0) {
        // Send all pending messages
        for (const msgStr of pendingMessages.reverse()) {
          try {
            const msgData = JSON.parse(msgStr);
            ws.send(JSON.stringify(msgData));
          } catch (error) {
            console.error('Error parsing pending message:', error);
          }
        }
        // Clear the queue
        await redis.del(`messages:${userId}:${conversationId}`);
        console.log(`Delivered ${pendingMessages.length} pending messages to user ${userId}`);
      }
    } catch (error) {
      console.error('Error checking pending messages:', error);
    }
  }
  
  ws.send(JSON.stringify({
    type: 'joined_conversation',
    conversationId
  }));
}

async function handleLeaveConversation(userId, conversationId) {
  userRooms.get(userId)?.delete(conversationId);
}

async function handleSendMessage(userId, data) {
  const { conversationId, content, messageType = 'text' } = data;

  // Verify user is part of conversation
  const participants = await getConversationParticipants(conversationId);
  if (!participants || (participants.ownerId !== userId && participants.leaserId !== userId)) {
    return;
  }

  // Check if this is a new conversation (first message)
  const { data: existingMessages } = await supabase
    .from('messages')
    .select('id')
    .eq('conversation_id', conversationId)
    .limit(1);

  const isNewConversation = !existingMessages || existingMessages.length === 0;

  // Save message to database
  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: userId,
      content,
      message_type: messageType
    })
    .select()
    .single();

  if (error) {
    console.error('Error saving message:', error);
    return;
  }

  // If this is a new conversation and the sender is the leaser, send email to owner
  if (isNewConversation && participants.leaserId === userId) {
    await sendNewRequestEmail(participants.ownerId, conversationId, content);
  }

  // Broadcast to both participants
  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;
  
  const messageData = {
    type: 'new_message',
    message: {
      ...message,
      sender_id: userId
    },
    conversationId,
    timestamp: new Date().toISOString()
  };

  // Store message in Redis for persistence and offline delivery
  if (redis) {
    try {
      // Store message in a queue for the recipient (for offline delivery)
      await redis.lpush(`messages:${recipientId}:${conversationId}`, JSON.stringify(messageData));
      // Set expiration (7 days)
      await redis.expire(`messages:${recipientId}:${conversationId}`, 7 * 24 * 60 * 60);
      // Store conversation activity timestamp
      await redis.set(`conversation:${conversationId}:activity`, new Date().toISOString());
    } catch (error) {
      console.error('Error storing message in Redis:', error);
    }
  }

  // Send to sender immediately
  const senderWs = connections.get(userId);
  if (senderWs) {
    senderWs.send(JSON.stringify({
      type: 'message_sent',
      message: {
        ...message,
        sender_id: userId
      }
    }));
  }

  // Send to recipient if online
  const recipientWs = connections.get(recipientId);
  if (recipientWs) {
    // User is online - send immediately
    recipientWs.send(JSON.stringify(messageData));
    
    // Clear Redis queue for this conversation since user is online
    if (redis && userRooms.get(recipientId)?.has(conversationId)) {
      try {
        await redis.del(`messages:${recipientId}:${conversationId}`);
      } catch (error) {
        console.error('Error clearing Redis queue:', error);
      }
    }
  }
  // If recipient is offline, message is stored in Redis and will be delivered when they reconnect
}

// Email service function
async function sendNewRequestEmail(ownerId, conversationId, messageContent) {
  try {
    // Get owner's email and name
    const { data: ownerData, error: ownerError } = await supabase.auth.admin.getUserById(ownerId);
    if (ownerError || !ownerData) {
      console.error('Error fetching owner data:', ownerError);
      return;
    }

    // Get listing and leaser info
    const { data: conversationData } = await supabase
      .from('conversations')
      .select(`
        listing:listings(id, product_name, images),
        leaser:profiles!conversations_leaser_id_fkey(id, name)
      `)
      .eq('id', conversationId)
      .single();

    if (!conversationData) return;

    const listing = conversationData.listing;
    const leaser = conversationData.leaser;

    // Use Supabase Edge Function or external email service
    // For now, we'll use Supabase's built-in email functionality via a database function
    // You can also use services like Resend, SendGrid, etc.
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #E5383B 0%, #BA181B 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; padding: 12px 30px; background: #E5383B; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .message-box { background: white; padding: 20px; border-left: 4px solid #E5383B; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Rental Request</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p><strong>${leaser?.name || 'A user'}</strong> has sent you a new request for your listing: <strong>${listing?.product_name || 'Product'}</strong></p>
            
            <div class="message-box">
              <p><strong>Message:</strong></p>
              <p>${messageContent.substring(0, 200)}${messageContent.length > 200 ? '...' : ''}</p>
            </div>
            
            <p>Please log in to your account to view and respond to this request.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://allrent-r.vercel.app'}/inbox" class="button">View Request</a>
            
            <p style="margin-top: 30px; font-size: 12px; color: #666;">
              This is an automated email from AllRentR. Please do not reply to this email.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email using Supabase Auth (if configured) or external service
    // Note: You'll need to set up an email service. For Supabase, you can use:
    // 1. Supabase Edge Functions with Resend/SendGrid
    // 2. Database triggers with pg_net
    // 3. External API calls
    
    // For now, we'll log it. You should implement actual email sending
    console.log('Email would be sent to:', ownerData.user.email);
    console.log('Subject: New Rental Request for ' + listing?.product_name);
    
    // Send email via Supabase Edge Function
    try {
      const { data, error: emailError } = await supabase.functions.invoke('send-email', {
        body: {
          to: ownerData.user.email,
          subject: `New Rental Request for ${listing?.product_name || 'Your Listing'}`,
          html: emailHtml,
          from: 'AllRentR <noreply@allrentr.com>'
        }
      });

      if (emailError) {
        console.error('Error invoking email function:', emailError);
      } else {
        console.log('Email sent successfully:', data);
      }
    } catch (emailErr) {
      console.error('Error calling email function:', emailErr);
    }
    
  } catch (error) {
    console.error('Error sending email:', error);
  }
}

async function handleTyping(userId, data) {
  const { conversationId } = data;
  const participants = await getConversationParticipants(conversationId);
  if (!participants) return;

  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;
  const recipientWs = connections.get(recipientId);
  
  if (recipientWs && userRooms.get(recipientId)?.has(conversationId)) {
    recipientWs.send(JSON.stringify({
      type: 'user_typing',
      conversationId,
      userId
    }));
  }
}

async function handleStopTyping(userId, data) {
  const { conversationId } = data;
  const participants = await getConversationParticipants(conversationId);
  if (!participants) return;

  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;
  const recipientWs = connections.get(recipientId);
  
  if (recipientWs && userRooms.get(recipientId)?.has(conversationId)) {
    recipientWs.send(JSON.stringify({
      type: 'user_stopped_typing',
      conversationId,
      userId
    }));
  }
}

async function handleMarkRead(userId, data) {
  const { messageId } = data;
  
  // Update message read_at
  await supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .eq('conversation_id', data.conversationId);

  // Notify sender if online
  const { data: message } = await supabase
    .from('messages')
    .select('sender_id, conversation_id')
    .eq('id', messageId)
    .single();

  if (message && message.sender_id !== userId) {
    const senderWs = connections.get(message.sender_id);
    if (senderWs) {
      senderWs.send(JSON.stringify({
        type: 'message_read',
        messageId,
        conversationId: message.conversation_id
      }));
    }
  }
}

async function handleDeleteMessage(userId, data) {
  const { messageId, conversationId } = data;

  // Verify user owns the message
  const { data: message, error: fetchError } = await supabase
    .from('messages')
    .select('sender_id')
    .eq('id', messageId)
    .single();

  if (fetchError || !message || message.sender_id !== userId) {
    return; // Not authorized
  }

  // Soft delete - update deleted_at
  const { error } = await supabase
    .from('messages')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', messageId);

  if (error) {
    console.error('Error deleting message:', error);
    return;
  }

  // Get conversation participants
  const participants = await getConversationParticipants(conversationId);
  if (!participants) return;

  // Notify both participants
  const recipientId = participants.ownerId === userId ? participants.leaserId : participants.ownerId;
  
  // Notify sender
  const senderWs = connections.get(userId);
  if (senderWs) {
    senderWs.send(JSON.stringify({
      type: 'message_deleted',
      conversationId,
      messageId
    }));
  }

  // Notify recipient if online
  const recipientWs = connections.get(recipientId);
  if (recipientWs && userRooms.get(recipientId)?.has(conversationId)) {
    recipientWs.send(JSON.stringify({
      type: 'message_deleted',
      conversationId,
      messageId
    }));
  }
}

async function handleUserOnline(userId) {
  // Update online status in database
  try {
    await supabase
      .from('online_status')
      .upsert({
        user_id: userId,
        is_online: true,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
  } catch (error) {
    console.error('Error updating online status:', error);
  }

  // Get all users this user has conversations with
  const { data: conversations } = await supabase
    .from('conversations')
    .select('owner_id, leaser_id')
    .or(`owner_id.eq.${userId},leaser_id.eq.${userId}`);

  if (!conversations) return;

  // Get unique user IDs
  const userIds = new Set();
  conversations.forEach(conv => {
    if (conv.owner_id !== userId) userIds.add(conv.owner_id);
    if (conv.leaser_id !== userId) userIds.add(conv.leaser_id);
  });

  // Notify all connected users in conversations
  userIds.forEach(otherUserId => {
    const ws = connections.get(otherUserId);
    if (ws) {
      ws.send(JSON.stringify({
        type: 'user_online',
        userId
      }));
    }
  });
}

const PORT = process.env.PORT || process.env.WS_PORT || 8080;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Redis: ${redis ? 'Connected (Upstash)' : 'Not configured'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'Not set'}`);
});

