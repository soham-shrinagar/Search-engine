import { Link } from 'react-router-dom';

export default function GettingStarted({ hasPages }) {
  if (hasPages) {
    return (
      <p className="text-center text-sm text-ink-muted dark:text-ink-dark-muted mt-6 sm:mt-8 px-2">
        You have pages indexed.{' '}
        <Link to="/crawl" className="link-subtle">Crawl more</Link>
        {' · '}
        <Link to="/dashboard" className="link-subtle">Dashboard</Link>
      </p>
    );
  }

  return (
    <div className="card-flat mt-8 sm:mt-10">
      <p className="text-sm font-medium text-ink dark:text-ink-dark mb-4 sm:mb-5">
        Getting started
      </p>
      <ol className="space-y-5 sm:space-y-6">
        <li className="flex gap-3 sm:gap-4">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark-hover border border-line dark:border-line-dark flex items-center justify-center text-[11px] font-medium text-ink-muted dark:text-ink-dark-muted mt-0.5">
            1
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink dark:text-ink-dark">Crawl a page</p>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-1 leading-relaxed">
              Paste a URL and we&apos;ll index its content.
            </p>
            <Link to="/crawl" className="btn-primary text-xs mt-3 inline-flex px-3 py-2 w-full sm:w-auto justify-center">
              Go to crawl
            </Link>
          </div>
        </li>
        <li className="flex gap-3 sm:gap-4">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark-hover border border-line dark:border-line-dark flex items-center justify-center text-[11px] font-medium text-ink-muted dark:text-ink-dark-muted mt-0.5">
            2
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink dark:text-ink-dark">Search it</p>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-1 leading-relaxed">
              Use the bar above. Quotes for phrases, AND / OR for boolean.
            </p>
          </div>
        </li>
        <li className="flex gap-3 sm:gap-4">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark-hover border border-line dark:border-line-dark flex items-center justify-center text-[11px] font-medium text-ink-muted dark:text-ink-dark-muted mt-0.5">
            3
          </span>
          <div className="min-w-0">
            <p className="text-sm text-ink dark:text-ink-dark">Check the dashboard</p>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-1 leading-relaxed">
              Index size, search trends, crawl logs.
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
