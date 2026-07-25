// storage.js — single source of truth for all localStorage operations

const KEYS = {
  USERS: 'users',
  POSTS: 'posts',
  COMMENTS: 'comments',
  LIKES: 'likes',
  CURRENT_USER: 'currentUser',
  FRIEND_REQUESTS: 'friendRequests',
  MESSAGES: 'messages',
  AI_SETTINGS: 'aiSettings',
};

// Generic helpers — read/write any key safely
function getItem(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error(`Error reading ${key} from localStorage`, err);
    return fallback;
  }
}

function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing ${key} to localStorage`, err);
  }
}

// Generate unique IDs like 'usr_1703001234_abc'
export function generateId(prefix) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${random}`;
}

export const storage = {
  // Users
  getUsers: () => getItem(KEYS.USERS, []),
  setUsers: (users) => setItem(KEYS.USERS, users),

  // Posts
  getPosts: () => getItem(KEYS.POSTS, []),
  setPosts: (posts) => setItem(KEYS.POSTS, posts),

  // Comments
  getComments: () => getItem(KEYS.COMMENTS, []),
  setComments: (comments) => setItem(KEYS.COMMENTS, comments),

  // Likes
  getLikes: () => getItem(KEYS.LIKES, []),
  setLikes: (likes) => setItem(KEYS.LIKES, likes),

  // Current logged-in user (session)
  getCurrentUser: () => getItem(KEYS.CURRENT_USER, null),
  setCurrentUser: (user) => setItem(KEYS.CURRENT_USER, user),
  clearCurrentUser: () => localStorage.removeItem(KEYS.CURRENT_USER),

  // Friend Requests
  getFriendRequests: () => getItem(KEYS.FRIEND_REQUESTS, []),
  setFriendRequests: (requests) => setItem(KEYS.FRIEND_REQUESTS, requests),
  // Messages
  getMessages: () => getItem(KEYS.MESSAGES, []),
  setMessages: (messages) => setItem(KEYS.MESSAGES, messages),
};