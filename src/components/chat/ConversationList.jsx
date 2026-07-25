import { truncateText, formatDate } from '../../utils/helpers';
import Avatar from '../ui/Avatar';

export default function ConversationList({ conversations, activeChatId, onSelectConversation }) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <p className="text-gray-500 text-sm">You have no friends yet — go to People to connect</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {conversations.map(({ friend, lastMessage, unreadCount }) => {
        const isActive = activeChatId === friend.id;

        const previewText =
          lastMessage.type === 'text'
            ? truncateText(lastMessage.content, 40)
            : lastMessage.type === 'image'
            ? '📷 Photo'
            : '🎥 Video';

        return (
          <button
            key={friend.id}
            onClick={() => onSelectConversation(friend.id)}
            className={`flex items-center gap-3 px-4 py-3 text-left transition-colors border-l-4 ${
              isActive ? 'bg-violet-50 border-violet-500' : 'border-transparent hover:bg-gray-50'
            }`}
          >
            <Avatar src={friend.avatar} name={friend.name} size="md" />

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-medium text-ink truncate">{friend.name}</p>
                <span className="text-[11px] text-gray-400 flex-shrink-0">
                  {formatDate(lastMessage.timestamp)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 mt-0.5">
                <p className="text-sm text-gray-500 truncate">{previewText}</p>
                {unreadCount > 0 && (
                  <span className="bg-violet-500 text-white text-xs font-bold rounded-full px-2 py-0.5 min-w-[1.25rem] text-center flex-shrink-0">
                    {unreadCount}
                  </span>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}