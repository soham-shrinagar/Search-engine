import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { appLinks, NavIcon } from './navConfig';

function useVisibleLinks() {
  const { isAuthenticated } = useAuth();
  return appLinks.filter((link) => !link.auth || isAuthenticated);
}

export function MobileTabNav() {
  const location = useLocation();
  const visibleLinks = useVisibleLinks();

  return (
    <nav
      className="lg:hidden -mx-4 px-4 mb-6 overflow-x-auto overscroll-x-contain"
      aria-label="Section navigation"
    >
      <div className="flex gap-1 min-w-max pb-0.5">
        {visibleLinks.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-sm rounded-lg whitespace-nowrap transition-colors ${
                active
                  ? 'font-medium text-ink dark:text-ink-dark bg-surface dark:bg-surface-dark'
                  : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark'
              }`}
            >
              <NavIcon name={link.icon} className="w-3.5 h-3.5 opacity-70" />
              {link.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default function Sidebar() {
  const location = useLocation();
  const visibleLinks = useVisibleLinks();

  return (
    <aside className="w-48 flex-shrink-0 hidden lg:block">
      <nav className="sticky top-[4.5rem] space-y-0.5">
        {visibleLinks.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg transition-colors ${
                active
                  ? 'font-medium text-ink dark:text-ink-dark bg-surface dark:bg-surface-dark'
                  : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-surface/80 dark:hover:bg-surface-dark/80'
              }`}
            >
              <NavIcon name={link.icon} className="w-4 h-4 opacity-70" />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
