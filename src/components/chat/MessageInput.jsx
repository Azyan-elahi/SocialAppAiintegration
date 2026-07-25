import { useState, useRef, useEffect } from 'react';
import { fileToBase64 } from '../../utils/helpers';

export default function MessageInput({ onSend, prefillText }) {
  const [text, setText] = useState('');
  const [mediaPreview, setMediaPreview] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);

  // When a chip is selected in the parent, fill the textarea with that text
  useEffect(() => {
    if (prefillText) {
      setText(prefillText);
      const el = textareaRef.current;
      if (el) {
        el.focus();
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 96) + 'px';
      }
    }
  }, [prefillText]);

  function handleTextChange(e) {
    setText(e.target.value);
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 96) + 'px';
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  async function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    if (!isImage && !isVideo) return;

    const base64 = await fileToBase64(file);
    setMediaPreview({ type: isImage ? 'image' : 'video', content: base64 });
    e.target.value = '';
  }

  function clearMedia() {
    setMediaPreview(null);
  }

  function handleSend() {
    const trimmed = text.trim();
    if (!trimmed && !mediaPreview) return;

    if (mediaPreview) {
      onSend({ type: mediaPreview.type, content: mediaPreview.content });
      setMediaPreview(null);
    }
    if (trimmed) {
      onSend({ type: 'text', content: trimmed });
    }

    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  }

  const canSend = text.trim().length > 0 || mediaPreview !== null;

  return (
    <div className="border-t border-gray-100 bg-white px-4 py-3">
      {mediaPreview && (
        <div className="relative inline-block mb-2">
          {mediaPreview.type === 'image' ? (
            <img src={mediaPreview.content} alt="Preview" className="h-20 rounded-lg" />
          ) : (
            <video src={mediaPreview.content} className="h-20 rounded-lg" />
          )}
          <button
            onClick={clearMedia}
            className="absolute -top-2 -right-2 bg-black/70 hover:bg-black text-white w-5 h-5 rounded-full text-xs flex items-center justify-center"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 transition-colors"
          aria-label="Attach file"
        >
          📎
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          className="flex-1 resize-none px-4 py-2 border border-gray-200 rounded-2xl outline-none focus:border-violet-400 transition-colors text-sm max-h-24"
        />

        <button
          onClick={handleSend}
          disabled={!canSend}
          className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-full bg-violet-500 hover:bg-violet-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Send message"
        >
          ➤
        </button>
      </div>
    </div>
  );
}