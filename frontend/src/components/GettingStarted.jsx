import { Link } from 'react-router-dom';

export default function GettingStarted({ hasPages }) {
  if (hasPages) {
    return (
      <p className="text-center text-sm text-ink-muted dark:text-ink-dark-muted mt-8">
        You have pages indexed.{' '}
        <Link to="/crawl" className="link-subtle">Crawl more</Link>
        {' · '}
        <Link to="/dashboard" className="link-subtle">Dashboard</Link>
      </p>
    );
  }

  return (
    <div className="card-flat p-6 mt-10">
      <p className="text-sm font-medium text-ink dark:text-ink-dark mb-5">
        Getting started
      </p>
      <ol className="space-y-5">
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark-hover border border-line dark:border-line-dark flex items-center justify-center text-[11px] font-medium text-ink-muted dark:text-ink-dark-muted">
            1
          </span>
          <div>
            <p className="text-sm text-ink dark:text-ink-dark">Crawl a page</p>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-1 leading-relaxed">
              Paste a URL and we&apos;ll index its content.
            </p>
            <Link to="/crawl" className="btn-primary text-xs mt-3 inline-flex px-3 py-1.5">
              Go to crawl
            </Link>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark-hover border border-line dark:border-line-dark flex items-center justify-center text-[11px] font-medium text-ink-muted dark:text-ink-dark-muted">
            2
          </span>
          <div>
            <p className="text-sm text-ink dark:text-ink-dark">Search it</p>
            <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-1 leading-relaxed">
              Use the bar above. Quotes for phrases, AND / OR for boolean.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-surface dark:bg-surface-dark-hover border border-line dark:border-line-dark flex items-center justify-center text-[11px] font-medium text-ink-muted dark:text-ink-dark-muted">
            3
          </span>
          <div>
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
