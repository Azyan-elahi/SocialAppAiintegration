export default function MessageBubble({ message, isOwnMessage, showAvatar, friendAvatar, friendName }) {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex items-end gap-2 mb-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}>
      {/* Friend's avatar — only on their messages, and only shown once per group */}
      {!isOwnMessage && (
        <div className="w-7 h-7 flex-shrink-0">
          {showAvatar &&
            (friendAvatar ? (
              <img src={friendAvatar} alt={friendName} className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-violet-500 text-white text-xs flex items-center justify-center font-semibold">
                {friendName?.charAt(0).toUpperCase()}
              </div>
            ))}
        </div>
      )}

      <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'} max-w-[70%]`}>
        <div
          className={
            isOwnMessage
              ? 'bg-violet-500 text-white rounded-2xl rounded-br-sm px-4 py-2'
              : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-sm px-4 py-2'
          }
        >
          {message.type === 'text' && <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>}

          {message.type === 'image' && (
            <img
              src={message.content}
              alt="Sent image"
              className="rounded-lg max-w-full max-h-64 cursor-pointer"
            />
          )}

          {message.type === 'video' && (
            <video src={message.content} controls className="rounded-lg max-w-full max-h-64" />
          )}
        </div>

        <div className="flex items-center gap-1 mt-1 px-1">
          {message.aiGenerated && <span className="text-xs">✨</span>}
          <span className="text-[11px] text-gray-400">{time}</span>
        </div>
      </div>
    </div>
  );
}