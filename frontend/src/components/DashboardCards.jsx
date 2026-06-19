function MetricCard({ title, value, subtitle }) {
  return (
    <div className="card-flat !p-3 sm:!p-5">
      <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint mb-1.5 sm:mb-2">
        {title}
      </p>
      <p className="text-lg sm:text-2xl font-semibold tracking-tight text-ink dark:text-ink-dark tabular-nums">
        {value ?? '—'}
      </p>
      {subtitle && (
        <p className="text-[11px] sm:text-xs text-ink-muted dark:text-ink-dark-muted mt-0.5 sm:mt-1 hidden sm:block">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card-flat !p-3 sm:!p-5 space-y-2 sm:space-y-3">
      <div className="skeleton h-2.5 w-16 sm:w-20" />
      <div className="skeleton h-6 sm:h-7 w-12 sm:w-14" />
    </div>
  );
}

export default function DashboardCards({ metrics, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
        {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    { title: 'Indexed', value: metrics.totalIndexedPages, subtitle: 'searchable pages' },
    { title: 'Terms', value: metrics.totalTerms, subtitle: 'in index' },
    { title: 'Searches', value: metrics.totalSearches, subtitle: 'all time' },
    { title: 'Latency', value: `${metrics.avgResponseTime}ms`, subtitle: 'avg response' },
    { title: 'Crawl OK', value: `${metrics.crawlSuccessRate}%`, subtitle: 'success rate' },
    { title: 'Crawl fail', value: `${metrics.crawlFailureRate}%`, subtitle: 'failure rate' },
    { title: 'Pages', value: metrics.totalPages, subtitle: 'submitted' },
    { title: 'Postings', value: metrics.totalPostings, subtitle: 'term-doc pairs' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
