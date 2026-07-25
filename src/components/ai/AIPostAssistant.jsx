import { useState } from 'react';
import { useAI } from '../../hooks/useAI';

export default function AIPostAssistant({ onUseContent }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const { callAI, isLoading, error } = useAI();

  async function handleGenerate() {
    if (!prompt.trim()) return;

    const systemPrompt =
      'You are a social media writing assistant. The user will give you a brief idea for their post. Generate an engaging social media post. Return JSON: { "description": "..." }. Keep under 280 characters. Be natural and warm. No hashtags unless requested.';

    const result = await callAI(systemPrompt, prompt, true);
    if (result?.description) {
      setSuggestion(result.description);
    }
  }

  function handleUse() {
    onUseContent(suggestion);
    setSuggestion('');
    setPrompt('');
    setIsOpen(false);
  }

  return (
    <div className="border border-violet-200 rounded-xl overflow-hidden">
      {/* Collapsed header — click to expand */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-violet-50 hover:bg-violet-100 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-violet-700">
          <span>✨</span> AI Writing Assistant
        </span>
        <span className={`text-violet-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}>▾</span>
      </button>

      {isOpen && (
        <div className="p-4 flex flex-col gap-3">
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1.5">
              Give AI a brief idea for your post
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. I just completed a React project"
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-violet-400 transition-all text-sm resize-none"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="flex items-center justify-center gap-2 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-4 py-2 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Post Content'
            )}
          </button>

          {error && <p className="text-xs text-red-500">{error}</p>}

          {suggestion && (
            <div className="bg-white border border-violet-200 rounded-lg p-3">
              <p className="text-sm text-gray-700 mb-3">{suggestion}</p>
              <button
                type="button"
                onClick={handleUse}
                className="text-sm font-medium text-violet-600 border border-violet-300 hover:bg-violet-50 transition-colors px-4 py-1.5 rounded-full"
              >
                Use This Content
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}