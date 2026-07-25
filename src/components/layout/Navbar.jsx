import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getPendingReceivedCount } from '../../utils/friendHelpers';
import { useFriends } from '../../hooks/useFriends';
import Avatar from '../ui/Avatar';

export default function Navbar() {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const { requests } = useFriends(); // subscribing so navbar re-renders when requests change
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const pendingCount = isAuthenticated ? getPendingReceivedCount(currentUser.id) : 0;

  function handleLogout() {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  }

  function handleNavigate(path) {
    navigate(path);
    setIsMenuOpen(false);
  }

  const linkClass =
    'group relative text-sm font-medium text-white/70 hover:text-white transition-colors py-1';
  const underline =
    <span className="absolute left-0 -bottom-0.5 h-0.5 w-0 bg-violet-400 group-hover:w-full transition-all duration-300" />;

  return (
    <nav className="sticky top-0 z-40 bg-ink px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link to="/" className="font-serif text-2xl font-medium text-white tracking-tight">
          Social<span className="text-violet-400">App</span>
        </Link>

        {isAuthenticated ? (
          <>
            {/* Desktop links — hidden below md breakpoint */}
            <div className="hidden md:flex items-center gap-5">
              <Link to="/people" className={linkClass}>
                People
                {underline}
              </Link>
              <Link to="/requests" className={`${linkClass} inline-block`}>
                Requests
                {underline}
                {pendingCount > 0 && (
                  <span className="absolute -top-2 -right-3 bg-coral text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </Link>
              <Link to="/friends" className={linkClass}>
                Friends
                {underline}
              </Link>
              <Link to="/chat" className={linkClass}>
                Chat
                {underline}
              </Link>
              <Link to="/dashboard/posts" className={linkClass}>
                Dashboard
                {underline}
              </Link>
              <Link
                to={`/profile/${currentUser.id}`}
                className="ring-2 ring-transparent hover:ring-violet-400 rounded-full transition-all"
              >
                <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm font-medium text-white/70 hover:text-coral transition-colors"
              >
                Logout
              </button>
            </div>

            {/* Mobile: avatar + hamburger */}
            <div className="flex md:hidden items-center gap-3">
              {pendingCount > 0 && (
                <span className="bg-coral text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
              <Link to={`/profile/${currentUser.id}`}>
                <Avatar src={currentUser.avatar} name={currentUser.name} size="sm" />
              </Link>
              <button
                onClick={() => setIsMenuOpen(true)}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-lg transition-colors"
                aria-label="Open menu"
              >
                ☰
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm font-medium text-white/70 hover:text-white transition-colors px-2"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 transition-colors px-4 py-2 rounded-full"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>

      {/* Mobile menu overlay + slide-down panel */}
      {isMenuOpen && (
        <>
          <div
            onClick={() => setIsMenuOpen(false)}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
          />
          <div className="md:hidden fixed top-0 right-0 z-50 w-64 h-screen bg-ink p-5 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <p className="font-serif text-lg text-white">Menu</p>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="text-white/70 hover:text-white text-xl"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>

            <nav className="flex flex-col gap-1.5">
              <button
                onClick={() => handleNavigate('/people')}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                People
              </button>
              <button
                onClick={() => handleNavigate('/requests')}
                className="flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                Requests
                {pendingCount > 0 && (
                  <span className="bg-coral text-white text-[10px] font-bold rounded-full min-w-[16px] h-4 px-1 flex items-center justify-center">
                    {pendingCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => handleNavigate('/friends')}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                Friends
              </button>
              <button
                onClick={() => handleNavigate('/chat')}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                Chat
              </button>
              <button
                onClick={() => handleNavigate('/dashboard/posts')}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                Dashboard
              </button>

              <div className="border-t border-white/10 my-2" />

              <button
                onClick={handleLogout}
                className="text-left px-4 py-3 rounded-xl text-sm font-medium text-coral hover:bg-white/10 transition-colors"
              >
                Logout
              </button>
            </nav>
          </div>
        </>
      )}
    </nav>
  );
}