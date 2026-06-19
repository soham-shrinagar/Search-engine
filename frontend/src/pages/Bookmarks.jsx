import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import Sidebar from '../components/Sidebar';
import { bookmarkApi } from '../api/client';

export default function Bookmarks() {
  const { refreshBookmarks } = useBookmarks();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await bookmarkApi.getAll();
        setBookmarks(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleRemove = async (pageId) => {
    try {
      await bookmarkApi.remove(pageId);
      setBookmarks((prev) => prev.filter((b) => b.page_id !== pageId));
      await refreshBookmarks();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">Bookmarks</h1>
        <p className="page-subtitle">Pages saved from search results.</p>
      </div>

      <div className="flex gap-10">
        <Sidebar />
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card-flat p-4">
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card-flat p-4 text-sm text-ink-muted">{error}</div>
          ) : bookmarks.length === 0 ? (
            <div className="card-flat empty-state">
              <p className="text-sm font-medium text-ink dark:text-ink-dark mb-1">No bookmarks</p>
              <p className="text-sm text-ink-muted dark:text-ink-dark-muted mb-6 max-w-xs mx-auto">
                Search for something and tap the bookmark icon on a result.
              </p>
              <Link to="/" className="btn-primary text-sm">Search</Link>
            </div>
          ) : (
            <div className="card-flat divide-y divide-line/80 dark:divide-line-dark">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-ink dark:text-ink-dark hover:underline underline-offset-2 block truncate"
                    >
                      {bookmark.title || bookmark.url}
                    </a>
                    <p className="text-xs text-ink-faint truncate mt-0.5">{bookmark.url}</p>
                  </div>
                  <button
                    onClick={() => handleRemove(bookmark.page_id)}
                    className="btn-ghost text-xs flex-shrink-0"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
