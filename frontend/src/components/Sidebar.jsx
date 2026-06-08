import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Overview' },
  { to: '/crawl', label: 'Crawl' },
  { to: '/bookmarks', label: 'Bookmarks', auth: true },
];

export default function Sidebar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const visibleLinks = links.filter((link) => !link.auth || isAuthenticated);

  return (
    <aside className="w-48 flex-shrink-0 hidden lg:block">
      <nav className="sticky top-20 space-y-0.5">
        {visibleLinks.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-neutral-100 dark:bg-neutral-900 text-neutral-950 dark:text-neutral-50 font-medium'
                  : 'text-neutral-500 dark:text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50'
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
