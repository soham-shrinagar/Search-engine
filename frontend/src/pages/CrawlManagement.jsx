import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppPageLayout from '../components/AppPageLayout';
import CrawlTable from '../components/CrawlTable';
import CrawlPipeline from '../components/CrawlPipeline';
import CrawlErrorPanel from '../components/CrawlErrorPanel';
import EmptyState from '../components/EmptyState';
import { crawlApi } from '../api/client';

export default function CrawlManagement() {
  const [url, setUrl] = useState('');
  const [recursive, setRecursive] = useState(false);
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [lastSuccess, setLastSuccess] = useState(null);
  const [pages, setPages] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadData = async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const [pagesRes, historyRes] = await Promise.all([
        crawlApi.getPages(),
        crawlApi.getHistory(),
      ]);
      setPages(pagesRes.data.data);
      setHistory(historyRes.data.data);
    } catch (err) {
      setLoadError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDepthChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setMaxDepth(Number.isNaN(val) ? 2 : Math.min(Math.max(val, 1), 5));
  };

  const handleMaxPagesChange = (e) => {
    const val = parseInt(e.target.value, 10);
    setMaxPages(Number.isNaN(val) ? 50 : Math.min(Math.max(val, 1), 100));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;

    setSubmitting(true);
    setSubmitError(null);
    setLastSuccess(null);
    const startTime = Date.now();

    try {
      const { data } = await crawlApi.submit({
        url: url.trim(),
        recursive,
        maxDepth,
        maxPages,
        sameDomainOnly: true,
      });

      const elapsed = Date.now() - startTime;

      if (recursive) {
        const { summary } = data.data;
        if (summary.indexed === 0 && summary.failed > 0) {
          setSubmitError(
            `Crawl finished but no pages were indexed (${summary.failed} failed, ${summary.skipped} skipped). ` +
            'This site may block crawlers or require login.'
          );
        } else {
          setLastSuccess({
            recursive: true,
            summary,
            title: url.trim(),
            url: url.trim(),
            elapsed,
          });
        }
      } else {
        setLastSuccess({
          recursive: false,
          title: data.data.title || url.trim(),
          url: data.data.url || url.trim(),
          termCount: data.data.termCount,
          status: data.data.status,
          elapsed,
        });
      }
      setUrl('');
      loadData();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const formatElapsed = (ms) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <AppPageLayout
      title="Index Website"
      subtitle="Add webpages to your search index. Crawling must happen before search — this is where your searchable content comes from."
    >
      <div className="space-y-4 sm:space-y-6">
        <CrawlPipeline />

        <div className="card-flat">
          <h2 className="text-sm font-medium text-ink dark:text-ink-dark mb-1">Index a website</h2>
          <p className="text-xs text-ink-muted dark:text-ink-dark-muted mb-4 leading-relaxed">
            Paste a URL below. SearchSphere will crawl it and add the content to your index.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="crawl-url" className="block text-xs font-medium text-ink-muted dark:text-ink-dark-muted mb-1.5">
                Website URL
              </label>
              <input
                id="crawl-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="input-field"
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 sm:gap-x-5 sm:gap-y-2 text-sm text-ink-muted dark:text-ink-dark-muted">
              <label className="flex items-center gap-2 cursor-pointer select-none min-h-[44px] sm:min-h-0">
                <input
                  type="checkbox"
                  checked={recursive}
                  onChange={(e) => setRecursive(e.target.checked)}
                  className="rounded border-line dark:border-line-dark text-ink focus:ring-ink/20 w-4 h-4"
                />
                Follow links on the same site
              </label>

              {recursive && (
                <div className="flex flex-wrap gap-3 sm:gap-5">
                  <label className="flex items-center gap-2 min-h-[44px] sm:min-h-0">
                    Link depth
                    <input
                      type="number"
                      value={maxDepth}
                      onChange={handleDepthChange}
                      min={1}
                      max={5}
                      className="input-field w-16 py-2 text-center text-sm"
                    />
                  </label>
                  <label className="flex items-center gap-2 min-h-[44px] sm:min-h-0">
                    Max pages
                    <input
                      type="number"
                      value={maxPages}
                      onChange={handleMaxPagesChange}
                      min={1}
                      max={100}
                      className="input-field w-20 py-2 text-center text-sm"
                    />
                  </label>
                </div>
              )}
            </div>

            {submitError && <CrawlErrorPanel message={submitError} />}

            {lastSuccess && (
              <div className="success-panel animate-fade-in">
                <p className="text-sm font-medium text-ink dark:text-ink-dark mb-3">
                  Successfully indexed!
                </p>
                {lastSuccess.recursive ? (
                  <div className="space-y-2 text-sm text-ink-muted dark:text-ink-dark-muted">
                    <p>
                      <span className="text-ink-faint">Batch result · </span>
                      {lastSuccess.summary.indexed} indexed, {lastSuccess.summary.skipped} skipped,{' '}
                      {lastSuccess.summary.failed} failed
                    </p>
                    <p><span className="text-ink-faint">Time taken · </span>{formatElapsed(lastSuccess.elapsed)}</p>
                  </div>
                ) : (
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-ink-faint text-xs">Page title</dt>
                      <dd className="text-ink dark:text-ink-dark font-medium mt-0.5 break-words">{lastSuccess.title}</dd>
                    </div>
                    {lastSuccess.termCount != null && (
                      <div>
                        <dt className="text-ink-faint text-xs">Unique terms</dt>
                        <dd className="text-ink dark:text-ink-dark font-medium mt-0.5 tabular-nums">{lastSuccess.termCount}</dd>
                      </div>
                    )}
                    <div>
                      <dt className="text-ink-faint text-xs">Time taken</dt>
                      <dd className="text-ink dark:text-ink-dark font-medium mt-0.5 tabular-nums">{formatElapsed(lastSuccess.elapsed)}</dd>
                    </div>
                    <div className="sm:col-span-2">
                      <dt className="text-ink-faint text-xs">URL</dt>
                      <dd className="text-ink-muted dark:text-ink-dark-muted mt-0.5 text-xs truncate">{lastSuccess.url}</dd>
                    </div>
                  </dl>
                )}
                <p className="text-xs text-ink-muted dark:text-ink-dark-muted mt-4">
                  Now you can search this content.
                </p>
                <Link
                  to={lastSuccess.title ? `/search?q=${encodeURIComponent(lastSuccess.title.split(' ')[0] || '')}` : '/search'}
                  className="btn-primary text-xs mt-3 inline-flex px-3 py-2"
                >
                  Search this content
                </Link>
              </div>
            )}

            <button type="submit" disabled={submitting} className="btn-primary w-full sm:w-auto py-2.5">
              {submitting ? 'Indexing…' : 'Index a Website'}
            </button>
          </form>
        </div>

        {loadError && (
          <div className="card-flat text-sm text-ink-muted break-words">
            Couldn&apos;t load data — {loadError}
          </div>
        )}

        <div className="card-flat">
          <h2 className="section-title">Indexed websites</h2>
          <p className="text-xs text-ink-muted dark:text-ink-dark-muted -mt-2 mb-4 leading-relaxed">
            Pages ready to appear in search results.
          </p>
          {!loading && pages.length === 0 ? (
            <EmptyState
              title="No indexed websites yet"
              description="Submit a URL above to crawl your first page. Once indexed, it becomes searchable."
            />
          ) : (
            <CrawlTable data={pages} loading={loading} emptyMessage="No indexed websites yet." />
          )}
        </div>

        <div className="card-flat">
          <h2 className="section-title">Recent crawls</h2>
          <p className="text-xs text-ink-muted dark:text-ink-dark-muted -mt-2 mb-4 leading-relaxed">
            A log of every crawl attempt and its outcome.
          </p>
          {!loading && history.length === 0 ? (
            <EmptyState
              title="No crawl history"
              description="Crawl history appears here after you index your first website."
            />
          ) : (
            <CrawlTable data={history} loading={loading} emptyMessage="No recent crawls." />
          )}
        </div>
      </div>
    </AppPageLayout>
  );
}
