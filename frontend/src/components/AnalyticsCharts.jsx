function formatChartDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = String(dateStr).split('T')[0].split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString();
}

function BarChart({ data, labelKey, valueKey, title }) {
  if (!data?.length) {
    return (
      <div className="card p-5">
        <h3 className="section-title">{title}</h3>
        <p className="text-xs text-neutral-400 text-center py-10">Nothing here yet</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d[valueKey]));

  return (
    <div className="card p-5">
      <h3 className="section-title">{title}</h3>
      <div className="space-y-3">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-neutral-500 dark:text-neutral-400 w-28 truncate flex-shrink-0">
              {item[labelKey]}
            </span>
            <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-neutral-950 dark:bg-neutral-50 h-full rounded-full transition-all duration-500"
                style={{ width: `${max > 0 ? (item[valueKey] / max) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs text-neutral-400 w-6 text-right tabular-nums">
              {item[valueKey]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function LineChart({ data, title }) {
  if (!data?.length) {
    return (
      <div className="card p-5">
        <h3 className="section-title">{title}</h3>
        <p className="text-xs text-neutral-400 text-center py-10">Nothing here yet</p>
      </div>
    );
  }

  const max = Math.max(...data.map((d) => d.count));
  const width = 100;
  const height = 48;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1 || 1)) * width;
    const y = height - (d.count / (max || 1)) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="card p-5">
      <h3 className="section-title">{title}</h3>
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-24 mt-2" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="text-neutral-950 dark:text-neutral-50"
          points={points}
        />
      </svg>
      <div className="flex justify-between text-[10px] text-neutral-400 mt-3">
        <span>{formatChartDate(data[0]?.date)}</span>
        <span>{formatChartDate(data[data.length - 1]?.date)}</span>
      </div>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="card p-5">
      <div className="skeleton h-3 w-28 mb-4" />
      <div className="skeleton h-24 w-full" />
    </div>
  );
}

export default function AnalyticsCharts({ searchesOverTime, topTerms, topDocuments, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {[...Array(3)].map((_, i) => <ChartSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      <LineChart data={searchesOverTime} title="Searches over time" />
      <BarChart data={topTerms} labelKey="query" valueKey="count" title="Top queries" />
      <BarChart
        data={topDocuments?.map((d) => ({ query: d.title || d.url, count: d.bookmarkCount }))}
        labelKey="query"
        valueKey="count"
        title="Most saved pages"
      />
    </div>
  );
}
