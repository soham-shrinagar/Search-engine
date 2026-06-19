export default function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, page - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav className="flex items-center justify-center gap-1 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-line/80 dark:border-line-dark" aria-label="Pagination">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="btn-ghost text-xs disabled:opacity-30 px-3 py-2.5 min-h-[44px]"
      >
        Prev
      </button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`min-w-[44px] h-11 sm:h-9 rounded-md text-xs transition-colors ${
            p === page
              ? 'bg-ink text-page dark:bg-ink-dark dark:text-page-dark font-medium'
              : 'text-ink-muted hover:bg-surface dark:hover:bg-surface-dark'
          }`}
        >
          {p}
        </button>
      ))}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-ghost text-xs disabled:opacity-30 px-3 py-2.5 min-h-[44px]"
      >
        Next
      </button>
    </nav>
  );
}
