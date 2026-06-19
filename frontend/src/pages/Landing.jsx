import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import GettingStarted from '../components/GettingStarted';
import { crawlApi } from '../api/client';

const features = [
  { title: 'Crawl', desc: 'Add URLs to your index', link: '/crawl' },
  { title: 'Dashboard', desc: 'Stats and crawl history', link: '/dashboard' },
  { title: 'Search', desc: 'Query what you indexed', link: '/search' },
];

export default function Landing() {
  const [hasPages, setHasPages] = useState(null);

  useEffect(() => {
    crawlApi.getPages({ limit: 1 })
      .then((res) => setHasPages(res.data.data.length > 0))
      .catch(() => setHasPages(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-6 pt-16 sm:pt-24 pb-20">
      <div className="text-center mb-10">
        <h1 className="text-[2.5rem] sm:text-5xl font-semibold tracking-tight text-ink dark:text-ink-dark leading-none">
          SearchSphere
        </h1>
        <p className="text-ink-muted dark:text-ink-dark-muted text-[15px] mt-4 leading-relaxed">
          Crawl pages, build an index, search what you added.
        </p>
        <div className="flex items-center justify-center gap-2 mt-7">
          <Link to="/register" className="btn-primary px-5">Sign up</Link>
          <Link to="/login" className="btn-secondary px-5">Sign in</Link>
        </div>
      </div>

      <SearchBar large />

      <p className="hint text-center mt-3">
        Only searches pages you&apos;ve crawled.{' '}
        <Link to="/crawl" className="link-subtle">Add some first</Link>
      </p>

      {hasPages !== null && <GettingStarted hasPages={hasPages} />}

      <div className="mt-16 pt-8 border-t border-line/80 dark:border-line-dark">
        <div className="grid gap-px sm:grid-cols-3 bg-line/80 dark:bg-line-dark rounded-xl overflow-hidden">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.link}
              className="bg-page dark:bg-page-dark p-5 hover:bg-surface dark:hover:bg-surface-dark transition-colors group"
            >
              <p className="text-sm font-medium text-ink dark:text-ink-dark group-hover:underline underline-offset-2">
                {feature.title}
              </p>
              <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-1">
                {feature.desc}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
