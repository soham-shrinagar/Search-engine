import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/crawl', label: 'Crawl' },
  { to: '/bookmarks', label: 'Bookmarks', auth: true },
];

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const visibleItems = navItems.filter((item) => !item.auth || isAuthenticated);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/90 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="text-[15px] font-semibold tracking-tight text-neutral-950 dark:text-neutral-50"
          onClick={() => setMenuOpen(false)}
        >
          SearchSphere
        </Link>

        <nav className="hidden sm:flex items-center gap-6">
          {visibleItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`text-sm transition-colors ${active ? 'nav-link-active' : 'nav-link'}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <button onClick={toggleDarkMode} className="btn-ghost" aria-label="Toggle theme">
            {darkMode ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {isAuthenticated ? (
            <>
              <span className="text-xs text-neutral-400 hidden md:inline max-w-[140px] truncate">
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn-ghost text-xs hidden sm:inline-flex">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-2 px-4 hidden sm:inline-flex">Sign up</Link>
            </>
          )}

          <button
            className="btn-ghost sm:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950 px-5 py-3 space-y-1">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm ${location.pathname === item.to ? 'font-medium text-neutral-950 dark:text-neutral-50' : 'text-neutral-500'}`}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated ? (
            <button onClick={handleLogout} className="block py-2 text-sm text-neutral-500 w-full text-left">
              Sign out
            </button>
          ) : (
            <>
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2 text-sm text-neutral-500">Sign in</Link>
              <Link to="/register" onClick={() => setMenuOpen(false)} className="block py-2 text-sm font-medium">Sign up</Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
