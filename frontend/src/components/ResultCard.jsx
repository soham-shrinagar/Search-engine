import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';

export default function ResultCard({ result }) {
  const { isAuthenticated } = useAuth();
  const { isBookmarked, toggleBookmark } = useBookmarks();
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [bookmarkError, setBookmarkError] = useState(null);

  const bookmarked = isBookmarked(result.id);

  const handleBookmark = async () => {
    if (!isAuthenticated) return;
    setBookmarkLoading(true);
    setBookmarkError(null);
    try {
      await toggleBookmark(result.id);
    } catch (err) {
      setBookmarkError(err.message);
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <article className="card p-5 group">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-medium text-neutral-950 dark:text-neutral-50 hover:underline underline-offset-2 block leading-snug"
            dangerouslySetInnerHTML={{ __html: result.highlightedTitle || result.title }}
          />
          <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate mt-1">
            {result.url}
          </p>
          <p
            className="text-sm text-neutral-600 dark:text-neutral-400 mt-2.5 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: result.highlightedSnippet || result.snippet }}
          />
          {(result.score || result.matchedTerms?.length > 0) && (
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {result.score > 0 && (
                <span className="badge">{result.score}</span>
              )}
              {result.matchedTerms?.map((term) => (
                <span key={term} className="badge">{term}</span>
              ))}
            </div>
          )}
          {bookmarkError && (
            <p className="text-xs text-neutral-500 mt-2">{bookmarkError}</p>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            className="btn-ghost flex-shrink-0 sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100 transition-opacity"
            aria-label={bookmarked ? 'Remove bookmark' : 'Bookmark page'}
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              fill={bookmarked ? 'currentColor' : 'none'}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>
        )}
      </div>
    </article>
  );
}
