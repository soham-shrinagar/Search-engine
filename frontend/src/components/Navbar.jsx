import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { appLinks, NavIcon } from './navConfig';

export default function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate('/');
  };

  const visibleItems = appLinks.filter((item) => !item.auth || isAuthenticated);

  return (
    <header className="sticky top-0 z-50 border-b border-line/80 dark:border-line-dark bg-page/90 dark:bg-page-dark/90 backdrop-blur-lg safe-bottom">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-3">
        <Link
          to="/"
          className="text-sm font-semibold tracking-tight text-ink dark:text-ink-dark truncate min-w-0"
          onClick={() => setMenuOpen(false)}
        >
          SearchSphere
        </Link>

        <nav className="hidden md:flex items-center gap-1 flex-1 justify-center">
          {visibleItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? 'font-medium text-ink dark:text-ink-dark bg-surface dark:bg-surface-dark'
                    : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-surface/60 dark:hover:bg-surface-dark/60'
                }`}
              >
                <NavIcon name={item.icon} className="w-4 h-4 opacity-70" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <button onClick={toggleDarkMode} className="btn-ghost p-2.5 touch-target" aria-label="Toggle theme">
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
              <span className="text-xs text-ink-faint dark:text-ink-dark-faint hidden lg:inline max-w-[160px] truncate px-2">
                {user.email}
              </span>
              <button onClick={handleLogout} className="btn-ghost text-xs hidden md:inline-flex px-3">
                Log out
              </button>
            </>
          ) : location.pathname === '/' ? (
            <>
              <Link to="/login" className="btn-ghost text-sm hidden md:inline-flex px-3">Sign in</Link>
              <Link to="/register" className="btn-primary text-sm py-1.5 px-3.5 hidden md:inline-flex">Sign up</Link>
            </>
          ) : (
            <Link to="/login" className="btn-primary text-sm py-1.5 px-3.5 hidden md:inline-flex">Sign in</Link>
          )}

          <button
            className="btn-ghost p-2.5 touch-target md:hidden"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
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
        <div className="md:hidden border-t border-line/80 dark:border-line-dark bg-page dark:bg-page-dark px-4 py-3 max-h-[calc(100dvh-3.5rem)] overflow-y-auto">
          {visibleItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2.5 py-3 text-sm min-h-[44px] ${
                location.pathname === item.to
                  ? 'font-medium text-ink dark:text-ink-dark'
                  : 'text-ink-muted dark:text-ink-dark-muted'
              }`}
            >
              <NavIcon name={item.icon} className="w-4 h-4 opacity-70" />
              {item.label}
            </Link>
          ))}
          <div className="border-t border-line/80 dark:border-line-dark mt-2 pt-3">
            {isAuthenticated ? (
              <>
                <p className="text-xs text-ink-faint truncate px-1 py-2">{user.email}</p>
                <button
                  onClick={handleLogout}
                  className="block py-3 text-sm text-ink-muted w-full text-left min-h-[44px]"
                >
                  Log out
                </button>
              </>
            ) : location.pathname === '/' ? (
              <div className="flex flex-col gap-2 py-1">
                <Link to="/register" onClick={() => setMenuOpen(false)} className="btn-primary text-sm w-full text-center py-2.5">
                  Sign up
                </Link>
                <Link to="/login" onClick={() => setMenuOpen(false)} className="btn-secondary text-sm w-full text-center py-2.5">
                  Sign in
                </Link>
              </div>
            ) : (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="block py-3 text-sm font-medium min-h-[44px] flex items-center">
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
