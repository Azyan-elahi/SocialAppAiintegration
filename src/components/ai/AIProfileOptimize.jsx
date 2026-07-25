import { useAI } from '../../hooks/useAI';

export default function AIProfileOptimize({ name, bio, location, onSuggestion }) {
  const { callAI, isLoading, error } = useAI();

  async function handleOptimize() {
    const systemPrompt =
      'You are a professional profile writer. Write an improved bio that is professional, warm and engaging. Keep it under 150 characters. Return only the bio text.';

    const userPrompt = `Current bio: ${bio || '(empty)'}. Name: ${name}. Location: ${location || '(not set)'}.`;

    const result = await callAI(systemPrompt, userPrompt, false);
    if (result) {
      onSuggestion(result.trim());
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={handleOptimize}
        disabled={isLoading}
        className="self-start flex items-center gap-1.5 text-xs font-medium text-violet-600 border border-violet-300 hover:bg-violet-50 transition-colors px-3 py-1.5 rounded-full disabled:opacity-50"
      >
        {isLoading ? (
          <>
            <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
            Optimising...
          </>
        ) : (
          <>✨ Optimise with AI</>
        )}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}