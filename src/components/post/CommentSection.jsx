import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { storage, generateId } from '../../utils/storage';
import { formatDate } from '../../utils/helpers';
import Avatar from '../ui/Avatar';
import AICommentSuggest from '../ai/AICommentSuggest';

export default function CommentSection({ postId, postDescription }) {
  const { currentUser, isAuthenticated } = useAuth();
  const [commentText, setCommentText] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [, forceRerender] = useState(0);

  const comments = storage
    .getComments()
    .filter((c) => c.postId === postId)
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const users = storage.getUsers();
  function getAuthor(authorId) {
    return users.find((u) => u.id === authorId);
  }

  function handleAddComment(e) {
    e.preventDefault();
    if (!commentText.trim()) return;

    const newComment = {
      id: generateId('cmt'),
      postId,
      authorId: currentUser.id,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };

    storage.setComments([...storage.getComments(), newComment]);
    setCommentText('');
    forceRerender((n) => n + 1);
  }

  function handleDeleteComment(commentId) {
    const updated = storage.getComments().filter((c) => c.id !== commentId);
    storage.setComments(updated);
    setConfirmDeleteId(null);
    forceRerender((n) => n + 1);
  }

  return (
    <div className="mt-6 pt-6 border-t border-gray-100">
      <h3 className="font-semibold text-ink mb-4">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h3>

      {/* Add comment form */}
      {isAuthenticated ? (
        <div className="mb-6">
          <form onSubmit={handleAddComment} className="flex gap-3">
            <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
            <div className="flex-1 flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 px-4 py-2 border border-gray-200 rounded-full outline-none focus:ring-2 focus:ring-violet-400 transition-all text-sm"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-5 py-2 rounded-full disabled:opacity-40"
              >
                Post
              </button>
            </div>
          </form>
          <div className="ml-11 mt-2">
            <AICommentSuggest postDescription={postDescription} onSuggestion={setCommentText} />
          </div>
        </div>
      ) : (
        <p className="text-gray-500 text-sm mb-6 bg-sand/40 px-4 py-3 rounded-xl">
          <Link to="/login" className="text-violet-600 font-medium hover:underline">
            Login
          </Link>{' '}
          to comment
        </p>
      )}

      {/* Comments list */}
      <div className="flex flex-col gap-4">
        {comments.map((comment) => {
          const author = getAuthor(comment.authorId);
          if (!author) return null;
          const isOwnComment = isAuthenticated && comment.authorId === currentUser.id;

          return (
            <div key={comment.id} className="flex gap-3">
              <Link to={`/profile/${author.id}`}>
                <Avatar src={author.avatar} name={author.name} size="sm" />
              </Link>
              <div className="flex-1">
                <div className="bg-gray-50 rounded-2xl px-4 py-2.5">
                  <Link
                    to={`/profile/${author.id}`}
                    className="font-medium text-sm text-ink hover:text-violet-600 transition-colors"
                  >
                    {author.name}
                  </Link>
                  <p className="text-gray-700 text-sm mt-0.5">{comment.text}</p>
                </div>

                <div className="flex items-center gap-3 mt-1.5 ml-2">
                  <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>

                  {isOwnComment && confirmDeleteId !== comment.id && (
                    <button
                      onClick={() => setConfirmDeleteId(comment.id)}
                      className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                    >
                      Delete
                    </button>
                  )}

                  {confirmDeleteId === comment.id && (
                    <span className="text-xs text-gray-600">
                      Are you sure?{' '}
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-red-500 font-medium hover:underline"
                      >
                        Yes
                      </button>{' '}
                      /{' '}
                      <button
                        onClick={() => setConfirmDeleteId(null)}
                        className="text-gray-500 font-medium hover:underline"
                      >
                        No
                      </button>
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}