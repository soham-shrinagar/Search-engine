import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../api/client';
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
      <div className="space-y-3">
        <p className="hint">Searching indexed pages…</p>
        {[...Array(4)].map((_, i) => (
          <ResultSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-2">
          Search failed
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{error}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-secondary text-sm mt-6"
        >
          Try again
        </button>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="card p-10 text-center">
        <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-2">
          No results for &ldquo;{query}&rdquo;
        </p>
        <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
          Try different keywords, use phrase search with quotes, or crawl the page first.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
          <Link to="/crawl" className="btn-primary text-sm">Crawl a page</Link>
          <Link to="/" className="btn-secondary text-sm">New search</Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <p className="hint">
          About {pagination.totalResults} results ({responseTime}ms) · ranked by TF-IDF relevance
        </p>
        {isAuthenticated ? (
          <div className="flex items-center gap-2">
            {saveError && <span className="text-xs text-neutral-500">{saveError}</span>}
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
          <Link to="/login" state={{ from: '/search' }} className="text-xs text-neutral-400 hover:underline underline-offset-2">
            Sign in to bookmark & save searches
          </Link>
        )}
      </div>
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
