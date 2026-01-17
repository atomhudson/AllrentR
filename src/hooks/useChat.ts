import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

// Helper to bypass TypeScript for tables not in generated types
const db = supabase as any;

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: 'text' | 'contact' | 'system';
  read_at: string | null;
  deleted_at: string | null;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  owner_id: string;
  leaser_id: string;
  contact_request_status: 'pending' | 'approved' | 'rejected';
  contact_shared: boolean;
  created_at: string;
  updated_at: string;
  listing?: {
    product_name: string;
    images: string[] | null;
  };
  other_user?: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

// Get WebSocket URL from environment, default to 8080
const getWsUrl = () => {
  const envUrl = import.meta.env.VITE_WS_URL;
  if (!envUrl) {
    return 'ws://localhost:8080';
  }
  
  let url = envUrl.trim();
  
  // If it already has ws:// or wss://, use it as is
  if (url.startsWith('ws://') || url.startsWith('wss://')) {
    return url;
  }
  
  // Remove http:// or https:// if present
  url = url.replace(/^https?:\/\//i, '');
  
  // Remove any leading slashes
  url = url.replace(/^\/+/, '');
  
  // Add ws:// prefix (use wss:// only for non-localhost)
  if (url.includes('localhost') || url.includes('127.0.0.1') || url.startsWith('192.168.') || url.startsWith('10.') || url.startsWith('172.')) {
    return `ws://${url}`;
  }
  
  return `wss://${url}`;
};

const WS_URL = getWsUrl();

export const useChat = () => {
  const { user, session } = useAuth();
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [typingUsers, setTypingUsers] = useState<Record<string, Set<string>>>({});
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const typingTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({});
  const notificationSoundRef = useRef<HTMLAudioElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const currentConversationRef = useRef<string | null>(null);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!user || !session) return;

    const token = session.access_token;
    // Build URL without logging the token - never log the full URL
    const wsUrl = `${WS_URL}?token=${encodeURIComponent(token)}`;
    
    // Create WebSocket without exposing URL in any logs
    const websocket = new WebSocket(wsUrl);
    wsRef.current = websocket;

    websocket.onopen = () => {
      // Silent connection - no logging to avoid exposing tokens
      setIsConnected(true);
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };

    websocket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        handleWebSocketMessage(data);
      } catch (error) {
        // Only log error type, not the message content
        if (import.meta.env.DEV) {
          console.error('Error parsing WebSocket message');
        }
      }
    };

    websocket.onerror = () => {
      // Silent error handling - don't log anything that might expose tokens
      // The error event itself doesn't contain useful info anyway
      setIsConnected(false);
    };

    websocket.onclose = () => {
      // Silent disconnection - no logging
      setIsConnected(false);
      // Reconnect after 3 seconds
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    };

    setWs(websocket);
  }, [user, session]);

  // Initialize notification sound
  useEffect(() => {
    // Try to load custom notification sound from public folder
    // You can add your custom sound file at: public/notification-sound.mp3
    const customSoundPath = '/notification-sound.mp3';
    const audio = new Audio(customSoundPath);
    
    // Handle audio load errors (fallback to Web Audio API)
    audio.onerror = () => {
      console.log('Custom notification sound not found, using default beep');
      // Initialize Web Audio API as fallback
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = audioContext;
        notificationSoundRef.current = { 
          play: async () => {
            try {
              // Resume audio context if suspended (browser autoplay policy)
              if (audioContext.state === 'suspended') {
                await audioContext.resume();
              }
              
              // Create a simple beep sound
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              
              oscillator.frequency.value = 800;
              oscillator.type = 'sine';
              
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
              
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.2);
            } catch (error) {
              console.warn('Could not play notification sound:', error);
            }
          }
        } as any;
      } catch (error) {
        console.warn('Could not initialize notification sound:', error);
      }
    };
    
    // If custom sound loads successfully, use it
    audio.oncanplaythrough = () => {
      notificationSoundRef.current = {
        play: async () => {
          try {
            audio.currentTime = 0; // Reset to start
            await audio.play();
          } catch (error) {
            console.warn('Could not play notification sound:', error);
            // Fallback to Web Audio API if custom sound fails
            if (audioContextRef.current) {
              const audioContext = audioContextRef.current;
              if (audioContext.state === 'suspended') {
                await audioContext.resume();
              }
              const oscillator = audioContext.createOscillator();
              const gainNode = audioContext.createGain();
              oscillator.connect(gainNode);
              gainNode.connect(audioContext.destination);
              oscillator.frequency.value = 800;
              oscillator.type = 'sine';
              gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
              gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
              oscillator.start(audioContext.currentTime);
              oscillator.stop(audioContext.currentTime + 0.2);
            }
          }
        }
      } as any;
    };
    
    // Try to load the custom sound
    audio.load();
  }, []);

  // Handle WebSocket messages
  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'connection':
        if (data.status === 'connected') {
          setIsConnected(true);
          // Notify server that user is online
          if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
              type: 'user_online',
              userId: user?.id
            }));
          }
        }
        break;
      
      case 'new_message':
      case 'message_sent':
        if (data.message) {
          setMessages(prev => {
            const convId = data.message.conversation_id;
            const existing = prev[convId] || [];
            // Check if message already exists
            if (existing.some(m => m.id === data.message.id)) {
              return prev;
            }
            const newMessages = {
              ...prev,
              [convId]: [...existing, data.message].sort((a, b) => 
                new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
              )
            };
            
            // Play notification sound if message is from another user and not in current conversation
            if (data.type === 'new_message' && 
                data.message.sender_id !== user?.id && 
                currentConversationRef.current !== convId) {
              // Play notification sound
              if (notificationSoundRef.current) {
                notificationSoundRef.current.play().catch((error: any) => {
                  console.warn('Could not play notification sound:', error);
                });
              }
              
              // Also try browser notification if permission granted
              if ('Notification' in window && Notification.permission === 'granted') {
                try {
                  new Notification('New message', {
                    body: data.message.content.substring(0, 50),
                    icon: '/favicon.ico',
                    badge: '/favicon.ico',
                    tag: `message-${data.message.id}` // Prevent duplicate notifications
                  });
                } catch (error) {
                  console.warn('Could not show browser notification:', error);
                }
              }
            }
            
            return newMessages;
          });
        }
        break;
      
      case 'user_typing':
        setTypingUsers(prev => {
          const convId = data.conversationId;
          const current = prev[convId] || new Set();
          return {
            ...prev,
            [convId]: new Set([...current, data.userId])
          };
        });
        break;
      
      case 'user_stopped_typing':
        setTypingUsers(prev => {
          const convId = data.conversationId;
          const current = prev[convId] || new Set();
          current.delete(data.userId);
          return {
            ...prev,
            [convId]: new Set(current)
          };
        });
        break;
      
      case 'message_read':
        setMessages(prev => {
          const convId = data.conversationId;
          const convMessages = prev[convId] || [];
          return {
            ...prev,
            [convId]: convMessages.map(msg => 
              msg.id === data.messageId 
                ? { ...msg, read_at: new Date().toISOString() }
                : msg
            )
          };
        });
        break;
      
      case 'message_deleted':
        setMessages(prev => {
          const convId = data.conversationId;
          const convMessages = prev[convId] || [];
          return {
            ...prev,
            [convId]: convMessages.map(msg => 
              msg.id === data.messageId 
                ? { ...msg, deleted_at: new Date().toISOString() }
                : msg
            )
          };
        });
        break;
      
      case 'user_online':
        if (data.userId && data.userId !== user?.id) {
          setOnlineUsers(prev => new Set([...prev, data.userId]));
        }
        break;
      
      case 'user_offline':
        if (data.userId && data.userId !== user?.id) {
          setOnlineUsers(prev => {
            const newSet = new Set(prev);
            newSet.delete(data.userId);
            return newSet;
          });
        }
        break;
      
      case 'online_users':
        if (data.userIds && Array.isArray(data.userIds)) {
          setOnlineUsers(new Set(data.userIds.filter((id: string) => id !== user?.id)));
        }
        break;
    }
  };

  // Load conversations
  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      // First, get conversations
      const { data: conversationsData, error: convError } = await db
        .from('conversations')
        .select(`
          *,
          listing:listings(product_name, images)
        `)
        .or(`owner_id.eq.${user.id},leaser_id.eq.${user.id}`)
        .order('updated_at', { ascending: false });

      if (convError) throw convError;

      if (!conversationsData || conversationsData.length === 0) {
        setConversations([]);
        return;
      }

      // Get unique user IDs (owner and leaser)
      const userIds = new Set<string>();
      conversationsData.forEach((conv: any) => {
        userIds.add(conv.owner_id);
        userIds.add(conv.leaser_id);
      });

      // Fetch profiles for all users
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, avatar_url')
        .in('id', Array.from(userIds));

      if (profilesError) {
        console.error('Error loading profiles:', profilesError);
        // Continue without profiles
      }

      // Create a map of user ID to profile
      const profilesMap = new Map();
      (profilesData || []).forEach((profile: any) => {
        profilesMap.set(profile.id, profile);
      });

      // Format conversations with profile data
      const formatted = conversationsData.map((conv: any) => {
        const ownerProfile = profilesMap.get(conv.owner_id) || { id: conv.owner_id, name: 'Owner', avatar_url: null };
        const leaserProfile = profilesMap.get(conv.leaser_id) || { id: conv.leaser_id, name: 'Leaser', avatar_url: null };
        
        return {
          ...conv,
          owner: ownerProfile,
          leaser: leaserProfile,
          other_user: conv.owner_id === user.id 
            ? leaserProfile 
            : ownerProfile,
          listing: conv.listing
        };
      });

      setConversations(formatted);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load conversations',
        variant: 'destructive'
      });
    }
  }, [user]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { data, error } = await db
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .is('deleted_at', null)
        .order('created_at', { ascending: true });

      if (error) throw error;

      setMessages(prev => ({
        ...prev,
        [conversationId]: (data || []) as Message[]
      }));

      // Mark messages as read
      const loadedMessages = (data || []) as Message[];
      const unreadIds = loadedMessages
        .filter(m => m.sender_id !== user.id && !m.read_at && !m.deleted_at)
        .map(m => m.id);

      if (unreadIds.length > 0) {
        await db
          .from('messages')
          .update({ read_at: new Date().toISOString() })
          .in('id', unreadIds);
        
        // Notify sender via WebSocket
        if (ws && isConnected) {
          unreadIds.forEach(messageId => {
            ws.send(JSON.stringify({
              type: 'mark_read',
              conversationId,
              messageId
            }));
          });
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [user, ws, isConnected]);


  // Create or get conversation
  const getOrCreateConversation = useCallback(async (listingId: string, ownerId: string) => {
    if (!user) return null;

    try {
      // Check if conversation exists
      const { data: existing } = await db
        .from('conversations')
        .select('*')
        .eq('listing_id', listingId)
        .eq('leaser_id', user.id)
        .maybeSingle();

      if (existing) {
        return existing;
      }

      // Create new conversation
      const { data, error } = await db
        .from('conversations')
        .insert({
          listing_id: listingId,
          owner_id: ownerId,
          leaser_id: user.id,
          contact_request_status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      await loadConversations();
      return data;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to start conversation',
        variant: 'destructive'
      });
      return null;
    }
  }, [user, loadConversations]);

  // Send message
  const sendMessage = useCallback((conversationId: string, content: string, messageType: 'text' | 'contact' | 'system' = 'text') => {
    if (!ws || !isConnected) {
      toast({
        title: 'Not connected',
        description: 'Please wait for connection to establish',
        variant: 'destructive'
      });
      return;
    }

    ws.send(JSON.stringify({
      type: 'send_message',
      conversationId,
      content,
      messageType
    }));
  }, [ws, isConnected]);

  // Join conversation room
  const joinConversation = useCallback((conversationId: string) => {
    if (!ws || !isConnected) return;

    currentConversationRef.current = conversationId;
    ws.send(JSON.stringify({
      type: 'join_conversation',
      conversationId
    }));

    loadMessages(conversationId);
  }, [ws, isConnected, loadMessages]);

  // Leave conversation room
  const leaveConversation = useCallback((conversationId: string) => {
    if (!ws || !isConnected) return;

    if (currentConversationRef.current === conversationId) {
      currentConversationRef.current = null;
    }
    
    ws.send(JSON.stringify({
      type: 'leave_conversation',
      conversationId
    }));
  }, [ws, isConnected]);

  // Delete message
  const deleteMessage = useCallback(async (messageId: string, conversationId: string) => {
    if (!user) return;

    try {
      // Soft delete - update deleted_at using RPC or direct query
      const { error } = await (supabase as any)
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Only allow deleting own messages

      if (error) throw error;

      // Update local state
      setMessages(prev => {
        const convMessages = prev[conversationId] || [];
        return {
          ...prev,
          [conversationId]: convMessages.map(msg => 
            msg.id === messageId 
              ? { ...msg, deleted_at: new Date().toISOString() }
              : msg
          )
        };
      });

      // Notify via WebSocket
      if (ws && isConnected) {
        ws.send(JSON.stringify({
          type: 'delete_message',
          conversationId,
          messageId
        }));
      }

      toast({
        title: 'Message deleted',
        description: 'The message has been deleted'
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete message',
        variant: 'destructive'
      });
    }
  }, [user, ws, isConnected]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      // Delete all messages in the conversation first
      const { error: messagesError } = await (supabase as any)
        .from('messages')
        .update({ deleted_at: new Date().toISOString() })
        .eq('conversation_id', conversationId);

      if (messagesError) throw messagesError;

      // Delete the conversation
      const { error: convError } = await (supabase as any)
        .from('conversations')
        .delete()
        .eq('id', conversationId)
        .or(`owner_id.eq.${user.id},leaser_id.eq.${user.id}`);

      if (convError) throw convError;

      // Update local state
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[conversationId];
        return newMessages;
      });

      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been deleted'
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete conversation',
        variant: 'destructive'
      });
    }
  }, [user]);

  // Send typing indicator
  const sendTyping = useCallback((conversationId: string) => {
    if (!ws || !isConnected) return;

    ws.send(JSON.stringify({
      type: 'typing',
      conversationId
    }));

    // Auto stop typing after 3 seconds
    if (typingTimeoutRef.current[conversationId]) {
      clearTimeout(typingTimeoutRef.current[conversationId]);
    }
    typingTimeoutRef.current[conversationId] = setTimeout(() => {
      sendStopTyping(conversationId);
    }, 3000);
  }, [ws, isConnected]);

  // Stop typing indicator
  const sendStopTyping = useCallback((conversationId: string) => {
    if (!ws || !isConnected) return;

    ws.send(JSON.stringify({
      type: 'stop_typing',
      conversationId
    }));
  }, [ws, isConnected]);

  // Approve contact request
  const approveContactRequest = useCallback(async (conversationId: string, ownerPhone: string) => {
    if (!user) return;

    try {
      // Update conversation status
      const { error: convError } = await db
        .from('conversations')
        .update({
          contact_request_status: 'approved',
          contact_shared: true
        })
        .eq('id', conversationId)
        .eq('owner_id', user.id);

      if (convError) throw convError;

      // Send contact as message
      sendMessage(conversationId, ownerPhone, 'contact');

      await loadConversations();
      toast({
        title: 'Contact shared',
        description: 'The contact number has been shared with the leaser'
      });
    } catch (error) {
      console.error('Error approving contact request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve contact request',
        variant: 'destructive'
      });
    }
  }, [user, sendMessage, loadConversations]);

  // Reject contact request
  const rejectContactRequest = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await db
        .from('conversations')
        .update({ contact_request_status: 'rejected' })
        .eq('id', conversationId)
        .eq('owner_id', user.id);

      if (error) throw error;

      await loadConversations();
      toast({
        title: 'Request rejected',
        description: 'Contact request has been rejected'
      });
    } catch (error) {
      console.error('Error rejecting contact request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject contact request',
        variant: 'destructive'
      });
    }
  }, [user, loadConversations]);

  // Initialize
  useEffect(() => {
    if (user && session) {
      connect();
      loadConversations();
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      Object.values(typingTimeoutRef.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, [user, session, connect, loadConversations]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Update online status on mount/unmount
  useEffect(() => {
    if (!user) return;

    const updateOnlineStatus = async () => {
      try {
        await db
          .from('online_status')
          .upsert({
            user_id: user.id,
            is_online: true,
            last_seen: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error updating online status:', error);
      }
    };

    updateOnlineStatus();
    const interval = setInterval(updateOnlineStatus, 30000); // Update every 30 seconds

    return () => {
      clearInterval(interval);
      (async () => {
        try {
          await db
            .from('online_status')
            .upsert({
              user_id: user.id,
              is_online: false,
              last_seen: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });
        } catch (error) {
          console.error('Error updating online status on unmount:', error);
        }
      })();
    };
  }, [user]);

  return {
    isConnected,
    conversations,
    messages,
    typingUsers,
    onlineUsers,
    getOrCreateConversation,
    joinConversation,
    leaveConversation,
    sendMessage,
    sendTyping,
    sendStopTyping,
    approveContactRequest,
    rejectContactRequest,
    loadConversations,
    loadMessages,
    deleteMessage,
    deleteConversation
  };
};

