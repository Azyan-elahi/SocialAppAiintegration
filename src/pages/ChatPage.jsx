import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../hooks/useChat';
import { useAI } from '../hooks/useAI';
import { storage } from '../utils/storage';
import { areFriends } from '../utils/friendHelpers';
import { getUserAISettings, setUserAIChatEnabled } from '../utils/chatHelpers';
import ConversationList from '../components/chat/ConversationList';
import MessageBubble from '../components/chat/MessageBubble';
import MessageInput from '../components/chat/MessageInput';
import AISuggestionChips from '../components/chat/AISuggestionChips';
import AIChatBanner from '../components/chat/AIChatBanner';
import TypingIndicator from '../components/chat/TypingIndicator';
import Avatar from '../components/ui/Avatar';

export default function ChatPage() {
  const { userId: friendId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const chat = useChat(currentUser.id);
  const { callAI } = useAI();
  const messagesEndRef = useRef(null);
  const autoReplyTimeoutRef = useRef(null);
  const lastAutoRepliedId = useRef(null);

  const [aiMenuOpen, setAiMenuOpen] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [inputPrefill, setInputPrefill] = useState('');

  const conversations = chat.getAllConversations();
  const friend = friendId ? storage.getUsers().find((u) => u.id === friendId) : null;
  const conversationMessages = friendId ? chat.getConversationMessages(friendId) : [];

  // If trying to open a chat with someone who isn't a friend, bounce them out
  useEffect(() => {
    if (friendId && friend && !areFriends(currentUser.id, friendId)) {
      navigate('/friends');
    }
  }, [friendId, friend, currentUser.id, navigate]);

  // Load this user's AI auto-reply preference whenever the chat changes
  useEffect(() => {
    if (currentUser) {
      setAiEnabled(getUserAISettings(currentUser.id).aiChatEnabled);
    }
  }, [currentUser, friendId]);

  // Mark conversation as read
  useEffect(() => {
    if (friendId) {
      chat.markAsRead(friendId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friendId, conversationMessages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [friendId, conversationMessages.length, isAiTyping]);

  // Mode 2 — AI auto-reply when the friend sends a new message and AI mode is on
  useEffect(() => {
    if (!aiEnabled || !friendId || !friend) return;

    const lastMsg = conversationMessages[conversationMessages.length - 1];
    if (!lastMsg || lastMsg.senderId !== friend.id) return;
    if (lastAutoRepliedId.current === lastMsg.id) return;

    lastAutoRepliedId.current = lastMsg.id;

    autoReplyTimeoutRef.current = setTimeout(async () => {
      setIsAiTyping(true);

      const recent = conversationMessages
        .slice(-5)
        .map((m) => `${m.senderId === currentUser.id ? currentUser.name : friend.name}: ${m.type === 'text' ? m.content : `[${m.type}]`}`)
        .join('\n');

      const systemPrompt = `You are replying to ${friend.name} on behalf of ${currentUser.name}. Recent conversation: ${recent}. Reply naturally as ${currentUser.name} would. Keep it short (1-3 sentences max). Do not reveal you are an AI unless directly asked.`;

      const result = await callAI(systemPrompt, 'Generate a reply.', false);

      setIsAiTyping(false);

      if (result) {
        chat.send({ receiverId: friendId, type: 'text', content: result.trim(), aiGenerated: true });
      }
      // If it fails, we silently skip — a toast could be added here later
    }, 1500);

    return () => clearTimeout(autoReplyTimeoutRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationMessages.length, aiEnabled, friendId]);

  function handleSend({ type, content }) {
    if (!friendId) return;
    chat.send({ receiverId: friendId, type, content });
    setInputPrefill('');
  }

  function handleToggleAI(enabled) {
    setUserAIChatEnabled(currentUser.id, enabled);
    setAiEnabled(enabled);
    setAiMenuOpen(false);
  }

  return (
    <div className="max-w-5xl mx-auto h-[calc(100vh-73px)] flex border-x border-gray-100">
      {/* Sidebar */}
      <div
        className={`w-full sm:w-80 flex-shrink-0 border-r border-gray-100 overflow-y-auto ${
          friendId ? 'hidden sm:block' : 'block'
        }`}
      >
        <div className="px-4 py-4 border-b border-gray-100">
          <h1 className="font-serif text-xl font-medium text-ink">Chats</h1>
        </div>
        <ConversationList
          conversations={conversations}
          activeChatId={friendId}
          onSelectConversation={(id) => navigate(`/chat/${id}`)}
        />
      </div>

      {/* Right panel */}
      <div className={`flex-1 flex flex-col min-w-0 ${friendId ? 'flex' : 'hidden sm:flex'}`}>
        {!friend ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Select a conversation to start chatting
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="relative">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <button onClick={() => navigate('/chat')} className="sm:hidden text-gray-500 mr-1">
                  ←
                </button>
                <Link to={`/profile/${friend.id}`}>
                  <Avatar src={friend.avatar} name={friend.name} size="sm" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/profile/${friend.id}`} className="font-medium text-ink hover:text-violet-600 transition-colors">
                    {friend.name}
                  </Link>
                </div>

                <button
                  onClick={() => setAiMenuOpen((v) => !v)}
                  className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-colors ${
                    aiEnabled
                      ? 'bg-violet-500 text-white border-violet-500'
                      : 'text-violet-600 border-violet-200 hover:bg-violet-50'
                  }`}
                >
                  ✨ AI
                </button>
              </div>

              {aiMenuOpen && (
                <div className="absolute right-4 top-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg py-1 z-10 w-56">
                  <button
                    onClick={() => setAiMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Suggest replies only
                  </button>
                  <button
                    onClick={() => handleToggleAI(true)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Let AI reply for me
                  </button>
                  <button
                    onClick={() => handleToggleAI(false)}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    Turn off AI
                  </button>
                </div>
              )}

              {aiEnabled && <AIChatBanner onDisable={() => handleToggleAI(false)} />}
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              {conversationMessages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm mt-10">
                  Say hello to {friend.name.split(' ')[0]} 👋
                </p>
              ) : (
                conversationMessages.map((msg, i) => {
                  const isOwnMessage = msg.senderId === currentUser.id;
                  const prevMsg = conversationMessages[i - 1];
                  const showAvatar = !prevMsg || prevMsg.senderId !== msg.senderId;

                  return (
                    <MessageBubble
                      key={msg.id}
                      message={msg}
                      isOwnMessage={isOwnMessage}
                      showAvatar={showAvatar}
                      friendAvatar={friend.avatar}
                      friendName={friend.name}
                    />
                  );
                })
              )}

              {isAiTyping && <TypingIndicator />}

              {!aiEnabled && (
                <AISuggestionChips
                  messages={conversationMessages}
                  currentUser={currentUser}
                  friend={friend}
                  onSelect={setInputPrefill}
                />
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <MessageInput onSend={handleSend} prefillText={inputPrefill} />
          </>
        )}
      </div>
    </div>
  );
}