import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/crawl', label: 'Crawl' },
  { to: '/bookmarks', label: 'Bookmarks', auth: true },
  { to: '/account', label: 'Account', auth: true },
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
    <header className="sticky top-0 z-50 border-b border-line/80 dark:border-line-dark bg-page/80 dark:bg-page-dark/80 backdrop-blur-lg">
      <div className="max-w-6xl mx-auto px-5 sm:px-6 h-[3.25rem] flex items-center justify-between">
        <Link
          to="/"
          className="text-sm font-semibold tracking-tight text-ink dark:text-ink-dark"
          onClick={() => setMenuOpen(false)}
        >
          SearchSphere
        </Link>

        <nav className="hidden sm:flex items-center gap-5">
          {visibleItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={active ? 'nav-link-active text-sm' : 'nav-link'}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <button onClick={toggleDarkMode} className="btn-ghost p-2" aria-label="Toggle theme">
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
              <span className="text-xs text-ink-faint dark:text-ink-dark-faint hidden md:inline max-w-[160px] truncate px-2">
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn-ghost text-xs hidden sm:inline-flex">
                Log out
              </button>
            </>
          ) : location.pathname === '/' ? (
            <>
              <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-3.5 hidden sm:inline-flex ml-1">Sign up</Link>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-1.5 px-3.5 hidden sm:inline-flex">Sign in</Link>
          )}

          <button
            className="btn-ghost p-2 sm:hidden"
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
        <div className="sm:hidden border-t border-line/80 dark:border-line-dark bg-page dark:bg-page-dark px-5 py-2">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`block py-2.5 text-sm ${location.pathname === item.to ? 'font-medium text-ink dark:text-ink-dark' : 'text-ink-muted dark:text-ink-dark-muted'}`}
            >
              {item.label}
            </Link>
          ))}
          <div className="border-t border-line/80 dark:border-line-dark mt-2 pt-2">
            {isAuthenticated ? (
              <button onClick={handleLogout} className="block py-2.5 text-sm text-ink-muted w-full text-left">
                Log out
              </button>
            ) : location.pathname === '/' ? (
              <div className="flex gap-3 py-2">
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm flex-1 text-center">Sign up</Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm flex-1 text-center">Sign in</Link>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-2.5 text-sm font-medium">Sign in</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
