function StatCard({ label, value, loading, small }) {
  return (
    <div className="card-flat !p-3 sm:!p-4 text-center sm:text-left">
      <p className="text-[10px] uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint mb-1">
        {label}
      </p>
      {loading ? (
        <div className="skeleton h-6 w-12 mx-auto sm:mx-0" />
      ) : (
        <p className={`font-semibold text-ink dark:text-ink-dark tabular-nums ${small ? 'text-xs sm:text-sm leading-snug' : 'text-lg'}`}>
          {value ?? '—'}
        </p>
      )}
    </div>
  );
}

export default function IndexStatsBar({ metrics, lastCrawl, loading }) {
  const lastCrawlLabel = lastCrawl
    ? new Date(lastCrawl).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })
    : 'No crawls yet';

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 animate-fade-in">
      <StatCard label="Indexed pages" value={metrics?.totalIndexedPages ?? 0} loading={loading} />
      <StatCard label="Documents" value={metrics?.totalPages ?? 0} loading={loading} />
      <StatCard label="Terms" value={metrics?.totalTerms ?? 0} loading={loading} />
      <StatCard label="Last crawl" value={lastCrawlLabel} loading={loading} small />
    </div>
  );
}
