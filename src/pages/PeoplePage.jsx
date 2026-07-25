import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { storage } from '../utils/storage';
import { getRelationshipStatus } from '../utils/friendHelpers';
import { truncateText } from '../utils/helpers';
import Avatar from '../components/ui/Avatar';

export default function PeoplePage() {
  const { currentUser } = useAuth();
  const { sendRequest, acceptRequest, rejectRequest, findRequestBetween, refresh } = useFriends();
  const navigate = useNavigate();

  const allUsers = storage.getUsers();

  const candidates = allUsers.filter((u) => {
    if (u.id === currentUser.id) return false;
    const status = getRelationshipStatus(currentUser.id, u.id);
    return status !== 'friends';
  });

  const sortOrder = { 'request-received': 0, none: 1, 'request-sent': 2 };
  const sortedCandidates = [...candidates].sort((a, b) => {
    const statusA = getRelationshipStatus(currentUser.id, a.id);
    const statusB = getRelationshipStatus(currentUser.id, b.id);
    return sortOrder[statusA] - sortOrder[statusB];
  });

  function handleAddFriend(userId) {
    sendRequest(currentUser.id, userId);
    refresh();
  }

  function handleAccept(userId) {
    const req = findRequestBetween(currentUser.id, userId);
    if (req) {
      acceptRequest(req.id);
      refresh();
    }
  }

  function handleReject(userId) {
    const req = findRequestBetween(currentUser.id, userId);
    if (req) {
      rejectRequest(req.id);
      refresh();
    }
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-medium text-ink">People You May Know</h1>
        <p className="text-gray-500 text-sm mt-1">Discover and connect with others</p>
      </div>

      {sortedCandidates.length === 0 ? (
        <div className="text-center py-24 bg-sand/40 rounded-2xl">
          <p className="text-lg text-gray-500">No suggestions right now</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedCandidates.map((user) => {
            const status = getRelationshipStatus(currentUser.id, user.id);

            return (
              <div
                key={user.id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-md hover:border-violet-100 transition-all duration-200"
              >
                <div
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  onClick={() => navigate(`/profile/${user.id}`)}
                >
                  <Avatar src={user.avatar} name={user.name} size="md" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-ink truncate">{user.name}</p>
                      {status === 'request-received' && (
                        <span className="text-xs text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full flex-shrink-0">
                          Wants to connect
                        </span>
                      )}
                    </div>
                    {user.bio ? (
                      <p className="text-sm text-gray-500 truncate">{truncateText(user.bio, 60)}</p>
                    ) : (
                      <p className="text-sm text-gray-400 italic">No bio yet</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {status === 'request-sent' && (
                    <span className="flex items-center gap-1.5 text-sm font-medium text-gray-400 bg-gray-100 px-4 py-2 rounded-full">
                      <span>⏳</span> Sent
                    </span>
                  )}

                  {status === 'request-received' && (
                    <>
                      <button
                        onClick={() => handleAccept(user.id)}
                        className="text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-4 py-2 rounded-full"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(user.id)}
                        className="text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors px-4 py-2 rounded-full"
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {status === 'none' && (
                    <button
                      onClick={() => handleAddFriend(user.id)}
                      className="flex items-center gap-1.5 text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-4 py-2 rounded-full"
                    >
                      <span>+</span> Add Friend
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}