import { useState, useCallback } from 'react';
import { storage, generateId } from '../utils/storage';

export function useFriends() {
  const [requests, setRequests] = useState(() => storage.getFriendRequests());

  const refresh = useCallback(() => {
    setRequests(storage.getFriendRequests());
  }, []);

  // SEND a new friend request
  function sendRequest(fromUserId, toUserId) {
    const newRequest = {
      id: generateId('req'),
      fromUserId,
      toUserId,
      status: 'pending',
      sentAt: new Date().toISOString(),
      respondedAt: null,
    };

    const updated = [...storage.getFriendRequests(), newRequest];
    storage.setFriendRequests(updated);
    setRequests(updated);
  }

  // ACCEPT a pending request (only the receiver can accept)
  function acceptRequest(requestId) {
    const updated = storage.getFriendRequests().map((r) =>
      r.id === requestId
        ? { ...r, status: 'accepted', respondedAt: new Date().toISOString() }
        : r
    );
    storage.setFriendRequests(updated);
    setRequests(updated);
  }

  // REJECT a pending request
  function rejectRequest(requestId) {
    const updated = storage.getFriendRequests().map((r) =>
      r.id === requestId
        ? { ...r, status: 'rejected', respondedAt: new Date().toISOString() }
        : r
    );
    storage.setFriendRequests(updated);
    setRequests(updated);
  }

  // CANCEL a request that the current user sent (removes it completely)
  function cancelRequest(requestId) {
    const updated = storage.getFriendRequests().filter((r) => r.id !== requestId);
    storage.setFriendRequests(updated);
    setRequests(updated);
  }

  // UNFRIEND — removes the accepted request between two users
  function unfriend(userId1, userId2) {
    const updated = storage.getFriendRequests().filter(
      (r) =>
        !(
          r.status === 'accepted' &&
          ((r.fromUserId === userId1 && r.toUserId === userId2) ||
            (r.fromUserId === userId2 && r.toUserId === userId1))
        )
    );
    storage.setFriendRequests(updated);
    setRequests(updated);
  }

  // GETTERS — computed from current requests state

  function getReceivedRequests(userId) {
    return requests
      .filter((r) => r.status === 'pending' && r.toUserId === userId)
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  }

  function getSentRequests(userId) {
    return requests
      .filter((r) => r.status === 'pending' && r.fromUserId === userId)
      .sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));
  }

  // Find the specific request object between two users (if any), useful for cancel/accept buttons
  function findRequestBetween(userId1, userId2) {
    return requests.find(
      (r) =>
        r.status === 'pending' &&
        ((r.fromUserId === userId1 && r.toUserId === userId2) ||
          (r.fromUserId === userId2 && r.toUserId === userId1))
    );
  }

  return {
    requests,
    refresh,
    sendRequest,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    unfriend,
    getReceivedRequests,
    getSentRequests,
    findRequestBetween,
  };
}