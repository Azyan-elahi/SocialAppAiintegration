import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFriends } from '../hooks/useFriends';
import { storage } from '../utils/storage';
import Avatar from '../components/ui/Avatar';

export default function FriendRequestsPage() {
  const { currentUser } = useAuth();
  const { getReceivedRequests, getSentRequests, acceptRequest, rejectRequest, cancelRequest, refresh } =
    useFriends();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('received');

  const users = storage.getUsers();
  function getUser(userId) {
    return users.find((u) => u.id === userId);
  }

  const receivedRequests = getReceivedRequests(currentUser.id);
  const sentRequests = getSentRequests(currentUser.id);

  function handleAccept(requestId) {
    acceptRequest(requestId);
    refresh();
  }

  function handleReject(requestId) {
    rejectRequest(requestId);
    refresh();
  }

  function handleCancel(requestId) {
    cancelRequest(requestId);
    refresh();
  }

  const tabClasses = (tab) =>
    `px-5 py-2.5 text-sm font-medium rounded-full transition-all duration-200 ${
      activeTab === tab
        ? 'bg-violet-500 text-white shadow-sm shadow-violet-300'
        : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl font-medium text-ink">Friend Requests</h1>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-8">
        <button onClick={() => setActiveTab('received')} className={tabClasses('received')}>
          Received {receivedRequests.length > 0 && `(${receivedRequests.length})`}
        </button>
        <button onClick={() => setActiveTab('sent')} className={tabClasses('sent')}>
          Sent {sentRequests.length > 0 && `(${sentRequests.length})`}
        </button>
      </div>

      {/* Received tab */}
      {activeTab === 'received' && (
        <>
          {receivedRequests.length === 0 ? (
            <div className="text-center py-24 bg-sand/40 rounded-2xl">
              <p className="text-lg text-gray-500">No requests received</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {receivedRequests.map((req) => {
                const sender = getUser(req.fromUserId);
                if (!sender) return null;

                return (
                  <div
                    key={req.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-md hover:border-violet-100 transition-all duration-200"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => navigate(`/profile/${sender.id}`)}
                    >
                      <Avatar src={sender.avatar} name={sender.name} size="md" />
                      <p className="font-medium text-ink truncate">{sender.name}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAccept(req.id)}
                        className="text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-4 py-2 rounded-full"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleReject(req.id)}
                        className="text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors px-4 py-2 rounded-full"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Sent tab */}
      {activeTab === 'sent' && (
        <>
          {sentRequests.length === 0 ? (
            <div className="text-center py-24 bg-sand/40 rounded-2xl">
              <p className="text-lg text-gray-500">No requests sent</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {sentRequests.map((req) => {
                const receiver = getUser(req.toUserId);
                if (!receiver) return null;

                return (
                  <div
                    key={req.id}
                    className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between gap-4 hover:shadow-md hover:border-violet-100 transition-all duration-200"
                  >
                    <div
                      className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                      onClick={() => navigate(`/profile/${receiver.id}`)}
                    >
                      <Avatar src={receiver.avatar} name={receiver.name} size="md" />
                      <p className="font-medium text-ink truncate">{receiver.name}</p>
                    </div>

                    <button
                      onClick={() => handleCancel(req.id)}
                      className="text-sm font-medium text-gray-500 hover:bg-gray-100 transition-colors px-4 py-2 rounded-full flex-shrink-0"
                    >
                      Cancel Request
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}