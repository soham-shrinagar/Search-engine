import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import CrawlTable from '../components/CrawlTable';
import { crawlApi } from '../api/client';

export default function CrawlManagement() {
  const [url, setUrl] = useState('');
  const [recursive, setRecursive] = useState(false);
  const [maxDepth, setMaxDepth] = useState(2);
  const [maxPages, setMaxPages] = useState(50);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(null);
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
    setSubmitSuccess(null);

    try {
      const { data } = await crawlApi.submit({
        url: url.trim(),
        recursive,
        maxDepth,
        maxPages,
        sameDomainOnly: true,
      });

      if (recursive) {
        const { summary } = data.data;
        setSubmitSuccess(
          `Done — ${summary.indexed} indexed, ${summary.skipped} skipped, ${summary.failed} failed.`
        );
      } else {
        setSubmitSuccess(`Indexed "${data.data.title || data.data.url}".`);
      }
      setUrl('');
      loadData();
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Crawl</h1>
        <p className="page-subtitle">Add URLs to your search index.</p>
      </div>

      <div className="flex gap-10">
        <Sidebar />
        <div className="flex-1 min-w-0 space-y-6">
          <div className="card-flat p-5 sm:p-6">
            <h2 className="section-title">Add URL</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="crawl-url" className="block text-xs font-medium text-ink-muted dark:text-ink-dark-muted mb-1.5">
                  URL
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

              <div className="flex flex-wrap gap-x-5 gap-y-2 items-center text-sm text-ink-muted dark:text-ink-dark-muted">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={recursive}
                    onChange={(e) => setRecursive(e.target.checked)}
                    className="rounded border-line dark:border-line-dark text-ink focus:ring-ink/20"
                  />
                  Follow links
                </label>

                {recursive && (
                  <>
                    <label className="flex items-center gap-2">
                      Depth
                      <input
                        type="number"
                        value={maxDepth}
                        onChange={handleDepthChange}
                        min={1}
                        max={5}
                        className="input-field w-14 py-1.5 text-center text-sm"
                      />
                    </label>
                    <label className="flex items-center gap-2">
                      Max pages
                      <input
                        type="number"
                        value={maxPages}
                        onChange={handleMaxPagesChange}
                        min={1}
                        max={100}
                        className="input-field w-16 py-1.5 text-center text-sm"
                      />
                    </label>
                  </>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-ink-muted dark:text-ink-dark-muted">{submitError}</p>
              )}
              {submitSuccess && (
                <div className="rounded-lg bg-surface dark:bg-surface-dark-hover border border-line/60 dark:border-line-dark px-4 py-3">
                  <p className="text-sm text-ink dark:text-ink-dark">{submitSuccess}</p>
                  <Link to="/" className="btn-primary text-xs mt-3 inline-flex px-3 py-1.5">Search now</Link>
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-primary">
                {submitting ? 'Crawling…' : 'Submit'}
              </button>
            </form>
          </div>

          {loadError && (
            <div className="card-flat px-4 py-3 text-sm text-ink-muted">
              Couldn&apos;t load data — {loadError}
            </div>
          )}

          <div className="card-flat p-5">
            <h2 className="section-title">Indexed pages</h2>
            <CrawlTable
              data={pages}
              loading={loading}
              emptyMessage="Nothing indexed yet."
            />
          </div>

          <div className="card-flat p-5">
            <h2 className="section-title">History</h2>
            <CrawlTable data={history} loading={loading} emptyMessage="No history yet." />
          </div>
        </div>
      </div>
    </div>
  );
}
