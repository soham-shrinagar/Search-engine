function MetricCard({ title, value }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{title}</p>
      <p className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
        {value ?? '—'}
      </p>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-3 w-20" />
      <div className="skeleton h-7 w-14" />
    </div>
  );
}

export default function DashboardCards({ metrics, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[...Array(8)].map((_, i) => <CardSkeleton key={i} />)}
      </div>
    );
  }

  if (!metrics) return null;

  const cards = [
    { title: 'Indexed pages', value: metrics.totalIndexedPages },
    { title: 'Total terms', value: metrics.totalTerms },
    { title: 'Total searches', value: metrics.totalSearches },
    { title: 'Avg response', value: `${metrics.avgResponseTime}ms` },
    { title: 'Crawl success', value: `${metrics.crawlSuccessRate}%` },
    { title: 'Crawl failures', value: `${metrics.crawlFailureRate}%` },
    { title: 'All pages', value: metrics.totalPages },
    { title: 'Index postings', value: metrics.totalPostings },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
