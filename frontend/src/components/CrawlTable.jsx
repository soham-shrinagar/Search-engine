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
            ? 'text-neutral-950 dark:text-neutral-50 border-neutral-950 dark:border-neutral-50'
            : ''
      }`}
    >
      {label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-2">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="skeleton h-10 w-full" />
      ))}
    </div>
  );
}

export default function CrawlTable({ data, loading, emptyMessage = 'No crawl data available' }) {
  if (loading) return <TableSkeleton />;

  if (!data?.length) {
    return (
      <p className="text-sm text-neutral-400 text-center py-8">{emptyMessage}</p>
    );
  }

  return (
    <div className="overflow-x-auto -mx-1">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-100 dark:border-neutral-900">
            <th className="text-left py-2.5 px-3 text-xs font-medium text-neutral-400">URL</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-neutral-400">Status</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-neutral-400 hidden md:table-cell">Error</th>
            <th className="text-left py-2.5 px-3 text-xs font-medium text-neutral-400">Date</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row) => (
            <tr
              key={row.id}
              className="border-b border-neutral-50 dark:border-neutral-900/50 last:border-0 hover:bg-neutral-50 dark:hover:bg-neutral-900/30 transition-colors"
            >
              <td className="py-2.5 px-3 max-w-xs">
                <a
                  href={row.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-neutral-950 dark:text-neutral-50 hover:underline underline-offset-2 truncate block text-[13px]"
                >
                  {row.title || row.url}
                </a>
              </td>
              <td className="py-2.5 px-3">
                <StatusBadge status={row.status || row.crawl_status} />
              </td>
              <td className="py-2.5 px-3 text-xs text-neutral-400 hidden md:table-cell max-w-xs truncate">
                {row.error_message || '—'}
              </td>
              <td className="py-2.5 px-3 text-xs text-neutral-400 whitespace-nowrap tabular-nums">
                {new Date(row.crawled_at || row.last_crawled_at || row.created_at).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
