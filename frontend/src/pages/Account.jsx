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
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="page-header">
        <h1 className="page-title">Your account</h1>
        <p className="page-subtitle">Search history and saved queries — only visible to you.</p>
      </div>

      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 min-w-0 space-y-6">
          {loading ? (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card p-4 text-sm text-neutral-500">{error}</div>
          ) : (
            <>
              <section className="card p-5">
                <h2 className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                  Saved searches
                </h2>
                <p className="text-xs text-neutral-400 mb-4">
                  Queries you saved from the search page.
                </p>
                {saved.length === 0 ? (
                  <p className="text-sm text-neutral-500">No saved searches yet.</p>
                ) : (
                  <div className="space-y-2">
                    {saved.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                        <Link
                          to={`/search?q=${encodeURIComponent(item.query)}`}
                          className="text-sm text-neutral-950 dark:text-neutral-50 hover:underline underline-offset-2 truncate"
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

              <section className="card p-5">
                <h2 className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-1">
                  Search history
                </h2>
                <p className="text-xs text-neutral-400 mb-4">
                  Recent queries from your signed-in searches.
                </p>
                {history.length === 0 ? (
                  <p className="text-sm text-neutral-500">No search history yet.</p>
                ) : (
                  <div className="space-y-2">
                    {history.map((item) => (
                      <div key={item.query} className="flex items-center justify-between gap-3 py-2 border-b border-neutral-100 dark:border-neutral-800 last:border-0">
                        <Link
                          to={`/search?q=${encodeURIComponent(item.query)}`}
                          className="text-sm text-neutral-950 dark:text-neutral-50 hover:underline underline-offset-2 truncate"
                        >
                          {item.query}
                        </Link>
                        <span className="text-xs text-neutral-400 flex-shrink-0">
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
