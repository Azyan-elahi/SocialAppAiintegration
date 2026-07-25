import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function DashboardLayout() {
  const { isAuthenticated } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
      isActive ? 'bg-violet-500 text-white' : 'text-white/70 hover:text-white'
    }`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      {/* Mobile: floating hamburger button, bottom-right */}
      <button
        onClick={() => setIsSidebarOpen(true)}
        className="lg:hidden fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-ink text-white text-xl flex items-center justify-center shadow-lg"
        aria-label="Open dashboard menu"
      >
        ☰
      </button>

      <div className="flex gap-10">
        {/* Mobile: dark overlay behind sidebar */}
        {isSidebarOpen && (
          <div
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
          />
        )}

        {/* Sidebar — slides in on mobile, static on desktop */}
        <aside
          className={`w-64 lg:w-56 flex-shrink-0 bg-ink p-5 h-fit
            fixed lg:static top-0 left-0 z-50 lg:z-auto
            h-screen lg:h-fit lg:rounded-2xl lg:sticky lg:top-24
            transition-transform duration-300
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <div className="flex items-center justify-between mb-5">
            <p className="font-serif text-lg text-white">Dashboard</p>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden text-white/70 hover:text-white text-xl"
              aria-label="Close menu"
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col gap-1.5">
            <NavLink to="/dashboard/posts" onClick={() => setIsSidebarOpen(false)} className={linkClasses}>
              <span>📝</span> My Posts
            </NavLink>
            <NavLink to="/dashboard/create" onClick={() => setIsSidebarOpen(false)} className={linkClasses}>
              <span>➕</span> Create Post
            </NavLink>
            <NavLink to="/dashboard/settings" onClick={() => setIsSidebarOpen(false)} className={linkClasses}>
              <span>⚙️</span> Settings
            </NavLink>
          </nav>
        </aside>

        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}