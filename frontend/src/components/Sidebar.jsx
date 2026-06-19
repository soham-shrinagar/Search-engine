import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/crawl', label: 'Crawl' },
  { to: '/bookmarks', label: 'Bookmarks', auth: true },
  { to: '/account', label: 'Account', auth: true },
];

export default function Sidebar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const visibleLinks = links.filter((link) => !link.auth || isAuthenticated);

  return (
    <aside className="w-44 flex-shrink-0 hidden lg:block">
      <nav className="sticky top-[4.5rem] space-y-0.5">
        {visibleLinks.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                active
                  ? 'font-medium text-ink dark:text-ink-dark bg-surface dark:bg-surface-dark'
                  : 'text-ink-muted dark:text-ink-dark-muted hover:text-ink dark:hover:text-ink-dark hover:bg-surface/80 dark:hover:bg-surface-dark/80'
              }`}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
