import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
import ResultCard from './ResultCard';
import Pagination from './Pagination';
import EmptyState from './EmptyState';

function ResultSkeleton() {
  return (
    <div className="result-item space-y-2.5">
      <div className="skeleton h-4 w-2/3" />
      <div className="skeleton h-3 w-1/3" />
      <div className="skeleton h-3 w-full" />
    </div>
  );
}

export default function SearchResults({
  results,
  loading,
  error,
  pagination,
  onPageChange,
  query,
  responseTime,
  hasIndexedPages = true,
}) {
  const { isAuthenticated } = useAuth();
  const [saveState, setSaveState] = useState('idle');
  const [saveError, setSaveError] = useState(null);

  const handleSaveSearch = async () => {
    if (!isAuthenticated || !query.trim()) return;
    setSaveState('saving');
    setSaveError(null);
    try {
      await authApi.saveSearch(query.trim());
      setSaveState('saved');
    } catch (err) {
      setSaveError(err.message);
      setSaveState('idle');
    }
  };

  if (loading) {
    return (
      <div>
        <p className="hint mb-4">Searching indexed pages…</p>
        {[...Array(4)].map((_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        title="Search failed"
        description={error}
        actionLabel="Try again"
        onAction={() => window.location.reload()}
      />
    );
  }

  if (!results || results.length === 0) {
    if (!hasIndexedPages) {
      return (
        <EmptyState
          title="No pages indexed yet"
          description="Index a page first."
          actionLabel="Index a Website"
          actionTo="/crawl"
        />
      );
    }

    return (
      <EmptyState
        title={`No results for "${query}"`}
        description="Try different keywords or index more pages."
        actionLabel="Index a Website"
        actionTo="/crawl"
      />
    );
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between mb-1 pb-3 sm:pb-4 border-b border-line/80 dark:border-line-dark">
        <p className="hint">
          {pagination.totalResults} results · {responseTime}ms
        </p>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {saveError && <span className="text-xs text-ink-muted">{saveError}</span>}
            <button
              type="button"
              onClick={handleSaveSearch}
              disabled={saveState === 'saving' || saveState === 'saved'}
              className="btn-ghost text-xs"
            >
              {saveState === 'saved' ? 'Saved' : saveState === 'saving' ? 'Saving…' : 'Save search'}
            </button>
          </div>
        ) : (
          <Link to="/login" state={{ from: '/search' }} className="link-subtle text-xs">
            Sign in to save searches
          </Link>
        )}
      </div>
      <div>
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
