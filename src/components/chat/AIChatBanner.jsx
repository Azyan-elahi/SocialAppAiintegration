export default function AIChatBanner({ onDisable }) {
  return (
    <button
      onClick={onDisable}
      className="w-full text-left bg-violet-50 text-violet-700 text-xs font-medium px-4 py-2 hover:bg-violet-100 transition-colors border-b border-violet-100"
    >
      ✨ AI is responding on your behalf — tap to disable
    </button>
  );
}