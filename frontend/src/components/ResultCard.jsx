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
    <article className="result-item group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-medium text-ink dark:text-ink-dark hover:underline underline-offset-2 block leading-snug"
            dangerouslySetInnerHTML={{ __html: result.highlightedTitle || result.title }}
          />
          <p className="text-xs text-ink-faint dark:text-ink-dark-faint truncate mt-0.5">
            {result.url}
          </p>
          <p
            className="text-sm text-ink-muted dark:text-ink-dark-muted mt-2 leading-relaxed line-clamp-3"
            dangerouslySetInnerHTML={{ __html: result.highlightedSnippet || result.snippet }}
          />
          {(result.score > 0 || result.matchedTerms?.length > 0) && (
            <div className="flex items-center gap-1.5 mt-2.5 flex-wrap">
              {result.score > 0 && (
                <span className="badge" title="Relevance score">
                  {result.score}
                </span>
              )}
              {result.matchedTerms?.map((term) => (
                <span key={term} className="badge">{term}</span>
              ))}
            </div>
          )}
          {bookmarkError && (
            <p className="text-xs text-ink-muted mt-2">{bookmarkError}</p>
          )}
        </div>

        {isAuthenticated && (
          <button
            onClick={handleBookmark}
            disabled={bookmarkLoading}
            title={bookmarked ? 'Remove bookmark' : 'Bookmark'}
            className={`btn-ghost flex-shrink-0 p-2.5 rounded-lg touch-target ${
              bookmarked ? 'text-ink dark:text-ink-dark' : 'opacity-70 sm:opacity-50 sm:group-hover:opacity-100'
            }`}
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
