function MetricCard({ title, value }) {
  return (
    <div className="card-flat !p-3 sm:!p-5">
      <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-ink-faint dark:text-ink-dark-faint mb-1.5 sm:mb-2">
        {title}
      </p>
      <p className="text-lg sm:text-2xl font-semibold tracking-tight text-ink dark:text-ink-dark tabular-nums">
        {value ?? '—'}
      </p>
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
    { title: 'Indexed pages', value: metrics.totalIndexedPages },
    { title: 'Search terms', value: metrics.totalTerms },
    { title: 'Total searches', value: metrics.totalSearches },
    { title: 'Avg response', value: `${metrics.avgResponseTime}ms` },
    { title: 'Crawl success', value: `${metrics.crawlSuccessRate}%` },
    { title: 'Crawl failures', value: `${metrics.crawlFailureRate}%` },
    { title: 'Submitted URLs', value: metrics.totalPages },
    { title: 'Index entries', value: metrics.totalPostings },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
