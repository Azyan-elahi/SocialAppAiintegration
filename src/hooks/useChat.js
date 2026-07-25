import { useState, useCallback, useEffect } from 'react';
import { storage } from '../utils/storage';
import {
  getMessages,
  sendMessage as sendMessageHelper,
  markConversationAsRead,
  getConversations,
  getTotalUnreadCount,
} from '../utils/chatHelpers';

export function useChat(currentUserId) {
  const [messages, setMessages] = useState(() => storage.getMessages());

  // Re-read from localStorage whenever another tab writes to it (real-time sync)
  useEffect(() => {
    function handleStorage(event) {
      if (event.key === 'messages') {
        setMessages(storage.getMessages());
      }
    }

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const refresh = useCallback(() => {
    setMessages(storage.getMessages());
  }, []);

  function send({ receiverId, type, content, aiGenerated = false }) {
    sendMessageHelper({ senderId: currentUserId, receiverId, type, content, aiGenerated });
    refresh();
  }

  function markAsRead(friendId) {
    markConversationAsRead(currentUserId, friendId);
    refresh();
  }

  function getConversationMessages(friendId) {
    return getMessages(currentUserId, friendId);
  }

  function getAllConversations() {
    return getConversations(currentUserId);
  }

  function getUnreadCount() {
    return getTotalUnreadCount(currentUserId);
  }

  return {
    messages,
    refresh,
    send,
    markAsRead,
    getConversationMessages,
    getAllConversations,
    getUnreadCount,
  };
}