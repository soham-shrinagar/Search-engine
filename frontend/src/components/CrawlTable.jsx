const STATUS_LABELS = {
  indexed: 'Indexed',
  success: 'Success',
  skipped: 'Skipped',
  crawling: 'Crawling',
  pending: 'Pending',
  failed: 'Failed',
};

function StatusBadge({ status }) {
  const label = STATUS_LABELS[status] || status;
  const isActive = status === 'indexed' || status === 'success' || status === 'skipped';
  const isFailed = status === 'failed';

  return (
    <span
      className={`badge ${
        isActive
          ? 'badge-active'
          : isFailed
            ? 'text-ink dark:text-ink-dark border-ink/30 dark:border-ink-dark/30'
            : ''
      }`}
    >
      {label}
    </span>
  );
}

function formatDate(row) {
  return new Date(row.crawled_at || row.last_crawled_at || row.created_at).toLocaleString(undefined, {
    dateStyle: 'short',
    timeStyle: 'short',
  });
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton h-16 sm:h-9 w-full" />
      ))}
    </div>
  );
}

function MobileRow({ row }) {
  return (
    <div className="py-3.5 border-b border-line/50 dark:border-line-dark/80 last:border-0">
      <div className="flex items-start justify-between gap-3">
        <a
          href={row.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-ink dark:text-ink-dark hover:underline underline-offset-2 line-clamp-2 min-w-0 flex-1"
        >
          {row.title || row.url}
        </a>
        <StatusBadge status={row.status || row.crawl_status} />
      </div>
      <p className="text-xs text-ink-faint truncate mt-1">{row.url}</p>
      {row.error_message && (
        <p className="text-xs text-ink-muted mt-1.5 line-clamp-2">{row.error_message}</p>
      )}
      <p className="text-[11px] text-ink-faint mt-1.5 tabular-nums">{formatDate(row)}</p>
    </div>
  );
}

export default function CrawlTable({ data, loading, emptyMessage = 'No data' }) {
  if (loading) return <TableSkeleton />;

  if (!data?.length) {
    return (
      <p className="text-sm text-ink-faint text-center py-8 sm:py-10">{emptyMessage}</p>
    );
  }

  return (
    <>
      {/* Mobile: card list */}
      <div className="md:hidden -mx-1">
        {data.map((row) => (
          <MobileRow key={row.id} row={row} />
        ))}
      </div>

      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto -mx-1">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line dark:border-line-dark">
              <th className="text-left py-2 px-3 text-[11px] font-medium uppercase tracking-wide text-ink-faint">URL</th>
              <th className="text-left py-2 px-3 text-[11px] font-medium uppercase tracking-wide text-ink-faint">Status</th>
              <th className="text-left py-2 px-3 text-[11px] font-medium uppercase tracking-wide text-ink-faint">Error</th>
              <th className="text-left py-2 px-3 text-[11px] font-medium uppercase tracking-wide text-ink-faint">Date</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr
                key={row.id}
                className="border-b border-line/50 dark:border-line-dark/80 last:border-0 hover:bg-surface/50 dark:hover:bg-surface-dark/50 transition-colors"
              >
                <td className="py-2.5 px-3 max-w-xs">
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-ink dark:text-ink-dark hover:underline underline-offset-2 truncate block text-[13px]"
                  >
                    {row.title || row.url}
                  </a>
                </td>
                <td className="py-2.5 px-3">
                  <StatusBadge status={row.status || row.crawl_status} />
                </td>
                <td className="py-2.5 px-3 text-xs text-ink-faint max-w-xs truncate">
                  {row.error_message || '—'}
                </td>
                <td className="py-2.5 px-3 text-xs text-ink-faint whitespace-nowrap tabular-nums">
                  {formatDate(row)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
