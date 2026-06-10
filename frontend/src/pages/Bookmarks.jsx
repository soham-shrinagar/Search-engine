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
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="page-header">
        <h1 className="page-title">Bookmarks</h1>
        <p className="page-subtitle">Pages you&apos;ve saved from search results.</p>
      </div>

      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="card p-4">
                  <div className="skeleton h-4 w-3/4 mb-2" />
                  <div className="skeleton h-3 w-1/2" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="card p-4 text-sm text-neutral-500">{error}</div>
          ) : bookmarks.length === 0 ? (
            <div className="card p-10 text-center">
              <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-2">
                No bookmarks yet
              </p>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">
                Search for something, then click the bookmark icon on any result to save it here.
              </p>
              <Link to="/" className="btn-primary text-sm">Go to search</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {bookmarks.map((bookmark) => (
                <div key={bookmark.id} className="card p-4 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <a
                      href={bookmark.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-neutral-950 dark:text-neutral-50 hover:underline underline-offset-2 block truncate"
                    >
                      {bookmark.title || bookmark.url}
                    </a>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">{bookmark.url}</p>
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
