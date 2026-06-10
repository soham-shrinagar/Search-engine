function MetricCard({ title, value, subtitle }) {
  return (
    <div className="card p-5">
      <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2">{title}</p>
      <p className="text-2xl font-semibold tracking-tight text-neutral-950 dark:text-neutral-50">
        {value ?? '—'}
      </p>
      {subtitle && (
        <p className="text-xs text-neutral-400 mt-1">{subtitle}</p>
      )}
    </div>
  );
}

function CardSkeleton() {
  return (
    <div className="card p-5 space-y-3">
      <div className="skeleton h-3 w-24" />
      <div className="skeleton h-8 w-16" />
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
    { title: 'Indexed pages', value: metrics.totalIndexedPages, subtitle: 'Ready to search' },
    { title: 'Total terms', value: metrics.totalTerms, subtitle: 'In the index' },
    { title: 'Total searches', value: metrics.totalSearches, subtitle: 'All time' },
    { title: 'Avg response time', value: `${metrics.avgResponseTime}ms`, subtitle: 'Search latency' },
    { title: 'Crawl success rate', value: `${metrics.crawlSuccessRate}%`, subtitle: 'Successful crawls' },
    { title: 'Crawl failure rate', value: `${metrics.crawlFailureRate}%`, subtitle: 'Failed crawls' },
    { title: 'Total pages', value: metrics.totalPages, subtitle: 'Submitted URLs' },
    { title: 'Index postings', value: metrics.totalPostings, subtitle: 'Term-document pairs' },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map((card) => (
        <MetricCard key={card.title} {...card} />
      ))}
    </div>
  );
}
