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
    <div className="max-w-2xl mx-auto px-5 py-8">
      <div className="mb-6">
        <Link
          to="/"
          className="text-xs text-neutral-400 hover:text-neutral-950 dark:hover:text-neutral-50 transition-colors mb-4 inline-block"
        >
          ← Back
        </Link>
        <SearchBar initialQuery={query} />
      </div>

      {!hasQuery ? (
        <div className="card p-10 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
            Type something above to search your added pages.
          </p>
          <Link to="/crawl" className="btn-secondary text-sm">Add a page first</Link>
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
