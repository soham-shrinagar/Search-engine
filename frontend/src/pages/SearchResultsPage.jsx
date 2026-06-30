import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import SearchHelp from '../components/SearchHelp';
import IndexStatsBar from '../components/IndexStatsBar';
import EmptyState from '../components/EmptyState';
import { searchApi, analyticsApi, crawlApi, isRequestCanceled } from '../api/client';

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page'), 10) || 1;

  const [results, setResults] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 0, totalResults: 0 });
  const [responseTime, setResponseTime] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [pageMeta, setPageMeta] = useState({});
  const [lastCrawl, setLastCrawl] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  const requestIdRef = useRef(0);
  const abortRef = useRef(null);

  useEffect(() => {
    async function loadStats() {
      setStatsLoading(true);
      try {
        const [metricsRes, pagesRes, historyRes] = await Promise.all([
          analyticsApi.getDashboard(),
          crawlApi.getPages({ limit: 500 }),
          crawlApi.getHistory(1),
        ]);
        setMetrics(metricsRes.data.data);
        const meta = {};
        for (const p of pagesRes.data.data) {
          meta[p.id] = p.last_crawled_at;
        }
        setPageMeta(meta);
        const latest = historyRes.data.data[0];
        setLastCrawl(latest?.crawled_at || latest?.last_crawled_at || null);
      } catch {
        setMetrics(null);
      } finally {
        setStatsLoading(false);
      }
    }
    loadStats();
  }, []);

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
  const indexedCount = metrics?.totalIndexedPages ?? 0;
  const hasIndexedPages = indexedCount > 0;

  const resultsWithMeta = results.map((r) => ({
    ...r,
    lastIndexed: pageMeta[r.id] || null,
  }));

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8 animate-fade-in">
        <Link to="/" className="link-subtle text-xs mb-3 sm:mb-4 inline-block min-h-[44px] flex items-center">
          ← Home
        </Link>
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-ink dark:text-ink-dark mb-2">
          Search
        </h1>
        <p className="text-sm text-ink-muted dark:text-ink-dark-muted mb-5 sm:mb-6">
          Only indexed pages are searchable.
        </p>
        <SearchBar initialQuery={query} />
      </div>

      {!hasIndexedPages && !statsLoading && (
        <EmptyState
          title="No pages indexed yet"
          description="Index a page first, then search."
          actionLabel="Go to Index Website"
          actionTo="/crawl"
        />
      )}

      {hasIndexedPages && !hasQuery && (
        <div className="space-y-6 animate-fade-in">
          <IndexStatsBar metrics={metrics} lastCrawl={lastCrawl} loading={statsLoading} />
          <EmptyState
            title="Enter a search query"
            description="Type something above to search your index."
            actionLabel="Index another website"
            actionTo="/crawl"
          />
          <SearchHelp />
        </div>
      )}

      {hasQuery && (
        <div className="animate-fade-in">
          {hasIndexedPages && (
            <div className="mb-6">
              <IndexStatsBar metrics={metrics} lastCrawl={lastCrawl} loading={statsLoading} />
            </div>
          )}
          <SearchResults
            results={resultsWithMeta}
            loading={loading}
            error={error}
            pagination={pagination}
            onPageChange={handlePageChange}
            query={query}
            responseTime={responseTime}
            hasIndexedPages={hasIndexedPages}
          />
          {!loading && !error && (
            <div className="mt-8">
              <SearchHelp />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
