import { Link } from 'react-router-dom';

export default function GettingStarted({ hasPages }) {
  if (hasPages) {
    return (
      <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-6">
        You have indexed pages. Search above, or{' '}
        <Link to="/crawl" className="underline underline-offset-2 hover:text-neutral-950 dark:hover:text-neutral-50">
          crawl more
        </Link>
        {' '}·{' '}
        <Link to="/dashboard" className="underline underline-offset-2 hover:text-neutral-950 dark:hover:text-neutral-50">
          view dashboard
        </Link>
      </p>
    );
  }

  return (
    <div className="card p-6 mt-8">
      <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-4">
        Getting started
      </p>
      <ol className="space-y-4">
        <li className="flex gap-4">
          <span className="step-num">1</span>
          <div>
            <p className="text-sm text-neutral-950 dark:text-neutral-50">Crawl a website</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Submit a URL — we extract content and build a searchable index.
            </p>
            <Link to="/crawl" className="btn-primary text-sm mt-3 inline-flex">
              Open crawl manager
            </Link>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="step-num">2</span>
          <div>
            <p className="text-sm text-neutral-950 dark:text-neutral-50">Search your index</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              Use the search bar above. Try phrases in quotes or boolean operators like AND / OR.
            </p>
          </div>
        </li>
        <li className="flex gap-4">
          <span className="step-num">3</span>
          <div>
            <p className="text-sm text-neutral-950 dark:text-neutral-50">Track everything</p>
            <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-0.5">
              The dashboard shows index size, search trends, crawl history, and errors.
            </p>
            <Link to="/dashboard" className="btn-secondary text-sm mt-3 inline-flex">
              View dashboard
            </Link>
          </div>
        </li>
      </ol>
    </div>
  );
}
