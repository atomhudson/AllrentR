import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useChat } from '@/hooks/useChat';
import { supabase } from '@/integrations/supabase/client';

export const useUnreadCount = () => {
  const { user } = useAuth();
  const { conversations, messages } = useChat();
  const [totalUnread, setTotalUnread] = useState(0);

  useEffect(() => {
    if (!user || !conversations.length) {
      setTotalUnread(0);
      return;
    }

    const calculateUnread = () => {
      let count = 0;
      
      conversations.forEach((conv) => {
        const convMessages = messages[conv.id] || [];
        const unread = convMessages.filter(
          (m: any) => m.sender_id !== user.id && !m.read_at
        ).length;
        count += unread;
      });
      
      setTotalUnread(count);
    };

    calculateUnread();
  }, [conversations, messages, user]);

  return totalUnread;
};

