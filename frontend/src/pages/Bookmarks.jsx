import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';
import Sidebar from '../components/Sidebar';
import { bookmarkApi } from '../api/client';

export default function Bookmarks() {
  const { isAuthenticated } = useAuth();
  const { refreshBookmarks } = useBookmarks();
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) return;
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
  }, [isAuthenticated]);

  const handleRemove = async (pageId) => {
    try {
      await bookmarkApi.remove(pageId);
      setBookmarks((prev) => prev.filter((b) => b.page_id !== pageId));
      await refreshBookmarks();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-sm mx-auto text-center py-24 px-5">
        <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-5">
          Sign in to see your saved pages.
        </p>
        <button
          onClick={() => navigate('/login', { state: { from: '/bookmarks' } })}
          className="btn-primary"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="page-header">
        <h1 className="page-title">Bookmarks</h1>
        <p className="page-subtitle">Pages you&apos;ve saved from search results.</p>
      </div>

      <div className="flex gap-10">
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
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-4">
                Nothing saved yet. Bookmark a result while searching.
              </p>
              <Link to="/" className="btn-secondary text-sm">Go search</Link>
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
