import { storage, generateId } from './storage';
import { areFriends } from './friendHelpers';

// Always sort both user IDs alphabetically so A→B and B→A
// produce the SAME conversation ID regardless of who opens the chat
export function getConversationId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

// Get all messages for a specific conversation, sorted oldest first
export function getMessages(userId1, userId2) {
  const conversationId = getConversationId(userId1, userId2);
  return storage
    .getMessages()
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
}

// Send a new message (text, image, or video)
export function sendMessage({ senderId, receiverId, type, content, aiGenerated = false }) {
  const newMessage = {
    id: generateId('msg'),
    conversationId: getConversationId(senderId, receiverId),
    senderId,
    receiverId,
    type,
    content,
    timestamp: new Date().toISOString(),
    read: false,
    aiGenerated,
  };

  const updated = [...storage.getMessages(), newMessage];
  storage.setMessages(updated);
  return newMessage;
}

// Mark all messages in a conversation as read (called when the user opens it)
export function markConversationAsRead(currentUserId, friendId) {
  const conversationId = getConversationId(currentUserId, friendId);
  const allMessages = storage.getMessages();

  const hasUnread = allMessages.some(
    (m) => m.conversationId === conversationId && m.receiverId === currentUserId && !m.read
  );

  if (!hasUnread) return; // nothing to change, avoid an unnecessary write

  const updated = allMessages.map((m) =>
    m.conversationId === conversationId && m.receiverId === currentUserId
      ? { ...m, read: true }
      : m
  );
  storage.setMessages(updated);
}

// Get the list of conversations for a user — one entry per friend who has message history,
// sorted by most recent message first. Only friends are included.
export function getConversations(userId) {
  const allMessages = storage.getMessages();
  const users = storage.getUsers();

  // Find every unique other-user this person has exchanged messages with
  const partnerIds = new Set();
  allMessages.forEach((m) => {
    if (m.senderId === userId) partnerIds.add(m.receiverId);
    if (m.receiverId === userId) partnerIds.add(m.senderId);
  });

  const conversations = [...partnerIds]
    .filter((partnerId) => areFriends(userId, partnerId)) // only show friends
    .map((partnerId) => {
      const friend = users.find((u) => u.id === partnerId);
      if (!friend) return null;

      const conversationId = getConversationId(userId, partnerId);
      const messages = allMessages
        .filter((m) => m.conversationId === conversationId)
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const lastMessage = messages[0];
      const unreadCount = messages.filter((m) => m.receiverId === userId && !m.read).length;

      return { friend, lastMessage, unreadCount };
    })
    .filter(Boolean)
    .sort((a, b) => new Date(b.lastMessage.timestamp) - new Date(a.lastMessage.timestamp));

  return conversations;
}

// Total unread messages across all conversations (for navbar badge)
export function getTotalUnreadCount(userId) {
  return storage.getMessages().filter((m) => m.receiverId === userId && !m.read).length;
}
// AI chat settings (per-user, persisted)
export function getUserAISettings(userId) {
  const all = storage.getAISettings();
  return all[userId] || { aiChatEnabled: false, aiPersonality: 'friendly' };
}

export function setUserAIChatEnabled(userId, enabled) {
  const all = storage.getAISettings();
  all[userId] = { ...(all[userId] || { aiPersonality: 'friendly' }), aiChatEnabled: enabled };
  storage.setAISettings(all);
}