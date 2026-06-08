import ResultCard from './ResultCard';
import Pagination from './Pagination';

function ResultSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-3 w-full" />
      <div className="skeleton h-3 w-4/5" />
    </div>
  );
}

export default function SearchResults({ results, loading, error, pagination, onPageChange, query, responseTime }) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-1">
          Something went wrong
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{error}</p>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-1">
          No results for &ldquo;{query}&rdquo;
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          Try different words, or crawl a page first from the Crawl tab.
        </p>
      </div>
    );
  }

  return (
    <div>
      <p className="text-xs text-neutral-400 dark:text-neutral-500 mb-4">
        {pagination.totalResults} results · {responseTime}ms
      </p>
      <div className="space-y-3">
        {results.map((result) => (
          <ResultCard key={result.id} result={result} />
        ))}
      </div>
      <Pagination
        page={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
}
