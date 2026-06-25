import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useBookmarks } from '../context/BookmarkContext';

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

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

  const indexedLabel = formatDate(result.lastIndexed);

  return (
    <article className="result-card group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[15px] font-medium text-ink dark:text-ink-dark hover:underline underline-offset-2 block leading-snug result-title"
            dangerouslySetInnerHTML={{ __html: result.highlightedTitle || result.title }}
          />
          <p className="text-xs text-ink-faint dark:text-ink-dark-faint truncate mt-1">
            {result.url}
          </p>
          <p
            className="text-sm text-ink-muted dark:text-ink-dark-muted mt-2.5 leading-relaxed line-clamp-3 result-snippet"
            dangerouslySetInnerHTML={{ __html: result.highlightedSnippet || result.snippet }}
          />

          <dl className="flex flex-wrap gap-x-4 gap-y-2 mt-3.5 text-[11px]">
            {result.score > 0 && (
              <div>
                <dt className="text-ink-faint uppercase tracking-wide">Relevance</dt>
                <dd className="text-ink dark:text-ink-dark font-medium tabular-nums mt-0.5">{result.score}</dd>
              </div>
            )}
            {result.matchedTerms?.length > 0 && (
              <div className="min-w-0 flex-1">
                <dt className="text-ink-faint uppercase tracking-wide mb-1">Matched keywords</dt>
                <dd className="flex flex-wrap gap-1">
                  {result.matchedTerms.map((term) => (
                    <span key={term} className="badge-key">{term}</span>
                  ))}
                </dd>
              </div>
            )}
            {indexedLabel && (
              <div>
                <dt className="text-ink-faint uppercase tracking-wide">Last indexed</dt>
                <dd className="text-ink-muted dark:text-ink-dark-muted mt-0.5">{indexedLabel}</dd>
              </div>
            )}
          </dl>

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
