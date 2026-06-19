import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
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
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Account</h1>
        <p className="page-subtitle">Your saved searches and history.</p>
      </div>

      <div className="flex gap-10">
        <Sidebar />
        <div className="flex-1 min-w-0 space-y-5">
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="card-flat p-4">
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card-flat p-4 text-sm text-ink-muted">{error}</div>
          ) : (
            <>
              <section className="card-flat p-5">
                <h2 className="section-title">Saved searches</h2>
                {saved.length === 0 ? (
                  <p className="text-sm text-ink-muted dark:text-ink-dark-muted">None yet.</p>
                ) : (
                  <div className="divide-y divide-line/80 dark:divide-line-dark">
                    {saved.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <Link
                          to={`/search?q=${encodeURIComponent(item.query)}`}
                          className="text-sm text-ink dark:text-ink-dark hover:underline underline-offset-2 truncate"
                        >
                          {item.query}
                        </Link>
                        <button
                          onClick={() => handleRemoveSaved(item.id)}
                          className="btn-ghost text-xs flex-shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="card-flat p-5">
                <h2 className="section-title">Search history</h2>
                {history.length === 0 ? (
                  <p className="text-sm text-ink-muted dark:text-ink-dark-muted">None yet.</p>
                ) : (
                  <div className="divide-y divide-line/80 dark:divide-line-dark">
                    {history.map((item) => (
                      <div key={item.query} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                        <Link
                          to={`/search?q=${encodeURIComponent(item.query)}`}
                          className="text-sm text-ink dark:text-ink-dark hover:underline underline-offset-2 truncate"
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
