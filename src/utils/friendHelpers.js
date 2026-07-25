import { storage } from './storage';

// Check if two users are already friends (accepted request either direction)
export function areFriends(userId1, userId2) {
  const requests = storage.getFriendRequests();
  return requests.some(
    (r) =>
      r.status === 'accepted' &&
      ((r.fromUserId === userId1 && r.toUserId === userId2) ||
        (r.fromUserId === userId2 && r.toUserId === userId1))
  );
}

// Get the relationship status between the current user and another user
// Returns one of: 'self' | 'friends' | 'request-sent' | 'request-received' | 'none'
export function getRelationshipStatus(currentUserId, otherUserId) {
  if (currentUserId === otherUserId) return 'self';

  const requests = storage.getFriendRequests();

  const accepted = requests.find(
    (r) =>
      r.status === 'accepted' &&
      ((r.fromUserId === currentUserId && r.toUserId === otherUserId) ||
        (r.fromUserId === otherUserId && r.toUserId === currentUserId))
  );
  if (accepted) return 'friends';

  const sentByMe = requests.find(
    (r) => r.status === 'pending' && r.fromUserId === currentUserId && r.toUserId === otherUserId
  );
  if (sentByMe) return 'request-sent';

  const sentToMe = requests.find(
    (r) => r.status === 'pending' && r.fromUserId === otherUserId && r.toUserId === currentUserId
  );
  if (sentToMe) return 'request-received';

  return 'none';
}

// Get all friends of a user (returns array of full user objects)
export function getFriendsOf(userId) {
  const requests = storage.getFriendRequests();
  const users = storage.getUsers();

  const friendIds = requests
    .filter(
      (r) => r.status === 'accepted' && (r.fromUserId === userId || r.toUserId === userId)
    )
    .map((r) => (r.fromUserId === userId ? r.toUserId : r.fromUserId));

  return users.filter((u) => friendIds.includes(u.id));
}

// Get count of pending requests received by a user (for navbar badge)
export function getPendingReceivedCount(userId) {
  const requests = storage.getFriendRequests();
  return requests.filter((r) => r.status === 'pending' && r.toUserId === userId).length;
}