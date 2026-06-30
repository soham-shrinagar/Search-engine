import { Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import HowItWorks from '../components/HowItWorks';
import { crawlApi } from '../api/client';
import { useState, useEffect } from 'react';

export default function Landing() {
  const [hasPages, setHasPages] = useState(null);

  useEffect(() => {
    crawlApi.getPages({ limit: 1 })
      .then((res) => setHasPages(res.data.data.length > 0))
      .catch(() => setHasPages(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 lg:pt-20 pb-16 sm:pb-24">
      <div className="text-center mb-8 sm:mb-10 animate-fade-in">
        <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-semibold tracking-tight text-ink dark:text-ink-dark leading-tight">
          SearchSphere
        </h1>
        <p className="text-ink-muted dark:text-ink-dark-muted text-sm sm:text-[15px] mt-3 sm:mt-4 max-w-xl mx-auto px-2">
          Crawl pages, build an index, search what you added.
        </p>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2 mt-6 sm:mt-7 max-w-xs sm:max-w-none mx-auto">
          <Link to="/register" className="btn-primary px-5 py-2.5 sm:py-2">Sign up</Link>
          <Link to="/login" className="btn-secondary px-5 py-2.5 sm:py-2">Sign in</Link>
        </div>
      </div>

      {hasPages === false && (
        <div className="info-banner mb-6 sm:mb-8 animate-fade-in">
          <p className="text-sm text-ink dark:text-ink-dark">
            Search only works on pages you&apos;ve already crawled.
          </p>
          <Link to="/crawl" className="btn-primary text-sm mt-4 w-full sm:w-auto">
            Crawl Your First Page
          </Link>
        </div>
      )}

      <div className="max-w-2xl mx-auto mb-10 sm:mb-14">
        <SearchBar large />
        {hasPages === false && (
          <p className="hint text-center mt-3 px-2">
            No pages indexed yet.
          </p>
        )}
      </div>

      <div className="border-t border-line/80 dark:border-line-dark pt-10 sm:pt-14">
        <HowItWorks />
      </div>

      {hasPages && (
        <p className="text-center text-sm text-ink-muted dark:text-ink-dark-muted mt-10 px-2 animate-fade-in">
          You have searchable pages.{' '}
          <Link to="/crawl" className="link-subtle">Index more</Link>
          {' · '}
          <Link to="/dashboard" className="link-subtle">View analytics</Link>
        </p>
      )}
    </div>
  );
}
