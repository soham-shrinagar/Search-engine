import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useBookmarks } from '../context/BookmarkContext';
import AppPageLayout from '../components/AppPageLayout';
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
    <AppPageLayout title="Bookmarks" subtitle="Pages saved from search results.">
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card-flat">
              <div className="skeleton h-4 w-3/4 mb-2" />
              <div className="skeleton h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="card-flat text-sm text-ink-muted break-words">{error}</div>
      ) : bookmarks.length === 0 ? (
        <div className="card-flat empty-state">
          <p className="text-sm font-medium text-ink dark:text-ink-dark mb-1">No bookmarks</p>
          <p className="text-sm text-ink-muted dark:text-ink-dark-muted mb-6 max-w-xs mx-auto">
            Search for something and tap the bookmark icon on a result.
          </p>
          <Link to="/" className="btn-primary text-sm w-full sm:w-auto max-w-xs mx-auto">Search</Link>
        </div>
      ) : (
        <div className="card-flat !p-0 overflow-hidden">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-line/60 dark:border-line-dark last:border-0"
            >
              <div className="min-w-0 flex-1">
                <a
                  href={bookmark.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-ink dark:text-ink-dark hover:underline underline-offset-2 line-clamp-2 sm:truncate block"
                >
                  {bookmark.title || bookmark.url}
                </a>
                <p className="text-xs text-ink-faint truncate mt-0.5">{bookmark.url}</p>
              </div>
              <button
                onClick={() => handleRemove(bookmark.page_id)}
                className="btn-secondary text-xs flex-shrink-0 self-start sm:self-center py-2 px-3"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </AppPageLayout>
  );
}
