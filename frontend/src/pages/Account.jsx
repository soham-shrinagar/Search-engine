import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppPageLayout from '../components/AppPageLayout';
import { authApi } from '../api/client';

export default function Account() {
  const [history, setHistory] = useState([]);
  const [saved, setSaved] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const [historyRes, savedRes] = await Promise.all([
          authApi.getHistory(),
          authApi.getSavedSearches(),
        ]);
        setHistory(historyRes.data.data);
        setSaved(savedRes.data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRemoveSaved = async (id) => {
    try {
      await authApi.deleteSavedSearch(id);
      setSaved((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <AppPageLayout title="Account" subtitle="Your saved searches and search history when signed in.">
      {loading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="card-flat">
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card-flat text-sm text-ink-muted break-words">{error}</div>
      ) : (
        <div className="space-y-4 sm:space-y-5">
          <section className="card-flat">
            <h2 className="section-title">Saved searches</h2>
            {saved.length === 0 ? (
              <p className="text-sm text-ink-muted dark:text-ink-dark-muted leading-relaxed">
                No saved searches yet. Run a search and use &ldquo;Save search&rdquo; on the results page.
              </p>
            ) : (
              <div className="divide-y divide-line/60 dark:divide-line-dark -mx-4 sm:-mx-5 px-4 sm:px-5">
                {saved.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 py-3 first:pt-0 last:pb-0">
                    <Link
                      to={`/search?q=${encodeURIComponent(item.query)}`}
                      className="text-sm text-ink dark:text-ink-dark hover:underline underline-offset-2 break-all sm:truncate min-w-0"
                    >
                      {item.query}
                    </Link>
                    <button
                      onClick={() => handleRemoveSaved(item.id)}
                      className="btn-ghost text-xs flex-shrink-0 self-start sm:self-center py-2"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="card-flat">
            <h2 className="section-title">Search history</h2>
            {history.length === 0 ? (
              <p className="text-sm text-ink-muted dark:text-ink-dark-muted leading-relaxed">
                No search history yet. Your recent queries will appear here after you search while signed in.
              </p>
            ) : (
              <div className="divide-y divide-line/60 dark:divide-line-dark -mx-4 sm:-mx-5 px-4 sm:px-5">
                {history.map((item) => (
                  <div key={item.query} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <Link
                      to={`/search?q=${encodeURIComponent(item.query)}`}
                      className="text-sm text-ink dark:text-ink-dark hover:underline underline-offset-2 break-all sm:truncate min-w-0 flex-1"
                    >
                      {item.query}
                    </Link>
                    <span className="text-xs text-ink-faint flex-shrink-0 tabular-nums">
                      {item.search_count}×
                    </span>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </AppPageLayout>
  );
}
