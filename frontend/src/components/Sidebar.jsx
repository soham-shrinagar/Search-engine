import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
  { to: '/dashboard', label: 'Dashboard', desc: 'Metrics & analytics' },
  { to: '/crawl', label: 'Crawl', desc: 'Add & manage pages' },
  { to: '/bookmarks', label: 'Bookmarks', desc: 'Saved pages', auth: true },
  { to: '/account', label: 'Account', desc: 'History & saved searches', auth: true },
];

export default function Sidebar() {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  const visibleLinks = links.filter((link) => !link.auth || isAuthenticated);

  return (
    <aside className="w-56 flex-shrink-0 hidden lg:block">
      <nav className="card p-3 sticky top-20 space-y-1">
        {visibleLinks.map((link) => {
          const active = location.pathname === link.to;
          return (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-3 py-2.5 rounded-lg transition-colors ${
                active
                  ? 'bg-neutral-100 dark:bg-neutral-900'
                  : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
              }`}
            >
              <span className={`text-sm block ${active ? 'font-medium text-neutral-950 dark:text-neutral-50' : 'text-neutral-950 dark:text-neutral-50'}`}>
                {link.label}
              </span>
              <span className="text-xs text-neutral-400 mt-0.5 block">{link.desc}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
