import { useEffect, useState, useRef } from 'react';
import { useAI } from '../../hooks/useAI';

export default function AISuggestionChips({ messages, currentUser, friend, onSelect }) {
  const { callAI } = useAI();
  const [chips, setChips] = useState([]);
  const lastProcessedId = useRef(null);

  useEffect(() => {
    const lastMsg = messages[messages.length - 1];

    // Only suggest when the most recent message is from the friend
    if (!lastMsg || lastMsg.senderId !== friend.id) {
      setChips([]);
      return;
    }

    // Don't regenerate suggestions for a message we already processed
    if (lastProcessedId.current === lastMsg.id) return;
    lastProcessedId.current = lastMsg.id;

    async function generateSuggestions() {
      const recent = messages
        .slice(-5)
        .map((m) => `${m.senderId === currentUser.id ? currentUser.name : friend.name}: ${m.type === 'text' ? m.content : `[${m.type}]`}`)
        .join('\n');

      const systemPrompt = `You are ${currentUser.name}'s messaging assistant. You are helping ${currentUser.name} reply to ${friend.name}. Recent conversation: ${recent}. Generate 3 short natural reply options. Return JSON: { "suggestions": ["reply1", "reply2", "reply3"] }. Each suggestion under 100 characters. Match the conversational tone.`;

      const result = await callAI(systemPrompt, 'Generate reply suggestions.', true);
      // Fail silently per spec — no error shown to user
      setChips(result?.suggestions || []);
    }

    generateSuggestions();
  }, [messages, currentUser, friend, callAI]);

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-3 ml-9">
      {chips.map((chip, i) => (
        <button
          key={i}
          onClick={() => {
            onSelect(chip);
            setChips([]);
          }}
          className="bg-white border border-violet-200 text-violet-700 text-sm rounded-full px-3 py-1 hover:bg-violet-50 cursor-pointer transition-colors"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}