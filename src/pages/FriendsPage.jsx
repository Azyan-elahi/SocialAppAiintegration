import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { getFriendsOf } from '../utils/friendHelpers';
import { truncateText } from '../utils/helpers';
import Avatar from '../components/ui/Avatar';

export default function FriendsPage() {
  const { currentUser } = useAuth();
  const { unfriend, refresh, requests } = useFriends();
  const navigate = useNavigate();

  const friends = getFriendsOf(currentUser.id);

  function handleUnfriend(friendId) {
    unfriend(currentUser.id, friendId);
    refresh();
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-ink">Friends</h1>
        <p className="text-gray-500 text-sm mt-1">
          {friends.length} {friends.length === 1 ? 'friend' : 'friends'}
        </p>
      </div>

      {friends.length === 0 ? (
        <div className="text-center py-24 bg-sand/40 rounded-2xl">
          <p className="text-lg text-gray-500 mb-4">No friends yet — go to People to connect</p>
          <button
            onClick={() => navigate('/people')}
            className="text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-5 py-2.5 rounded-full"
          >
            Find People
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {friends.map((friend) => (
            <div
              key={friend.id}
              className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-md hover:border-violet-100 transition-all duration-200"
            >
              <div
                className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                onClick={() => navigate(`/profile/${friend.id}`)}
              >
                <div className="relative flex-shrink-0">
                  <Avatar src={friend.avatar} name={friend.name} size="md" />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-violet-500 border-2 border-white rounded-full" />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{friend.name}</p>
                  {friend.bio ? (
                    <p className="text-sm text-gray-500 truncate">{truncateText(friend.bio, 60)}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No bio yet</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/chat/${friend.id}`)}
                  className="text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-4 py-2 rounded-full"
                >
                  Message
                </button>
                <button
                  onClick={() => handleUnfriend(friend.id)}
                  className="text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors px-4 py-2 rounded-full"
                >
                  Unfriend
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}