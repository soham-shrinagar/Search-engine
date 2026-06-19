import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { searchApi, isRequestCanceled } from '../api/client';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, totalResults: 0 });
  const [responseTime, setResponseTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setPagination({ page: 1, totalPages: 0, totalResults: 0 });
      setError(null);
      setLoading(false);
      return;
    }

    if (abortRef.current) abortRef.current.abort();

    const controller = new AbortController();
    abortRef.current = controller;
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setError(null);

    searchApi.search(query, page, false, controller.signal)
      .then(({ data }) => {
        if (requestId !== requestIdRef.current) return;
        setResults(data.data.results);
        setPagination(data.data.pagination);
        setResponseTime(data.data.responseTime);
        setLoading(false);
      })
      .catch((err) => {
        if (requestId !== requestIdRef.current) return;
        if (isRequestCanceled(err)) {
          setLoading(false);
          return;
        }
        setError(err.message || 'Search failed');
        setResults([]);
        setLoading(false);
      });

    return () => controller.abort();
  }, [query, page]);

  const handlePageChange = (newPage) => {
    setSearchParams({ q: query, page: newPage.toString() });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const hasQuery = query.trim().length > 0;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8">
        <Link to="/" className="link-subtle text-xs mb-3 sm:mb-4 inline-block min-h-[44px] flex items-center">
          ← Home
        </Link>
        <SearchBar initialQuery={query} />
      </div>

      {!hasQuery ? (
        <div className="card-flat empty-state">
          <p className="text-sm text-ink-muted dark:text-ink-dark-muted mb-4">
            Enter a query above.
          </p>
          <Link to="/crawl" className="btn-secondary text-sm w-full sm:w-auto max-w-xs mx-auto">Add pages first</Link>
        </div>
      ) : (
        <SearchResults
          results={results}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          query={query}
          responseTime={responseTime}
        />
      )}
    </div>
  );
}
