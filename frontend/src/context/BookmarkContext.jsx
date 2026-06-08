import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { bookmarkApi } from '../api/client';
import { useAuth } from './AuthContext';

const BookmarkContext = createContext();

export function BookmarkProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [bookmarkedIds, setBookmarkedIds] = useState(new Set());
  const [loading, setLoading] = useState(false);

  const refreshBookmarks = useCallback(async () => {
    if (!isAuthenticated) {
      setBookmarkedIds(new Set());
      return;
    }
    setLoading(true);
    try {
      const { data } = await bookmarkApi.getIds();
      setBookmarkedIds(new Set(data.data));
    } catch {
      setBookmarkedIds(new Set());
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshBookmarks();
  }, [refreshBookmarks]);

  const isBookmarked = useCallback(
    (pageId) => bookmarkedIds.has(pageId),
    [bookmarkedIds]
  );

  const toggleBookmark = useCallback(async (pageId) => {
    const wasBookmarked = bookmarkedIds.has(pageId);

    if (wasBookmarked) {
      setBookmarkedIds((prev) => {
        const next = new Set(prev);
        next.delete(pageId);
        return next;
      });
      try {
        await bookmarkApi.remove(pageId);
      } catch (err) {
        setBookmarkedIds((prev) => new Set(prev).add(pageId));
        throw err;
      }
    } else {
      setBookmarkedIds((prev) => new Set(prev).add(pageId));
      try {
        await bookmarkApi.add(pageId);
      } catch (err) {
        setBookmarkedIds((prev) => {
          const next = new Set(prev);
          next.delete(pageId);
          return next;
        });
        throw err;
      }
    }
  }, [bookmarkedIds]);

  return (
    <BookmarkContext.Provider value={{
      bookmarkedIds,
      isBookmarked,
      toggleBookmark,
      refreshBookmarks,
      loading,
    }}>
      {children}
    </BookmarkContext.Provider>
  );
}

export function useBookmarks() {
  const context = useContext(BookmarkContext);
  if (!context) throw new Error('useBookmarks must be used within BookmarkProvider');
  return context;
}
