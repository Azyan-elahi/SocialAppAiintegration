import { useAI } from '../../hooks/useAI';

export default function AICommentSuggest({ postDescription, onSuggestion }) {
  const { callAI, isLoading } = useAI();

  async function handleSuggest() {
    const systemPrompt =
      'You are helping a user write a comment on a social media post. Write a short genuine comment (1-2 sentences). Be conversational. Do not use hashtags. Do not be generic like Great post.';

    const userPrompt = `The post is: ${postDescription}`;

    const result = await callAI(systemPrompt, userPrompt, false);
    if (result) {
      onSuggestion(result.trim());
    }
  }

  return (
    <button
      type="button"
      onClick={handleSuggest}
      disabled={isLoading}
      className="flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors disabled:opacity-50"
    >
      {isLoading ? (
        <>
          <span className="w-3 h-3 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
          Thinking...
        </>
      ) : (
        <>✨ Suggest Comment</>
      )}
    </button>
  );
}