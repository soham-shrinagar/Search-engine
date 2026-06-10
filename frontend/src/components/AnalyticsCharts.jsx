function formatChartDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = String(dateStr).split('T')[0].split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString();
}

function BarChart({ data, labelKey, valueKey, title }) {
  return (
    <div className="card p-5">
      <h3 className="section-title">{title}</h3>
      {!data?.length ? (
        <p className="text-xs text-neutral-400 text-center py-10">No data yet — run some searches first.</p>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 8).map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xs text-neutral-500 dark:text-neutral-400 w-32 truncate flex-shrink-0">
                {item[labelKey]}
              </span>
              <div className="flex-1 bg-neutral-100 dark:bg-neutral-900 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-neutral-950 dark:bg-neutral-50 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(item[valueKey] / Math.max(...data.map((d) => d[valueKey]))) * 100}%` }}
                />
              </div>
              <span className="text-xs text-neutral-400 w-8 text-right tabular-nums">
                {item[valueKey]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LineChart({ data, title }) {
  return (
    <div className="card p-5">
      <h3 className="section-title">{title}</h3>
      {!data?.length ? (
        <p className="text-xs text-neutral-400 text-center py-10">No searches recorded yet.</p>
      ) : (
        <>
          <svg viewBox="0 0 100 48" className="w-full h-28 mt-2" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-neutral-950 dark:text-neutral-50"
              points={data.map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 100;
                const y = 48 - (d.count / (Math.max(...data.map((x) => x.count)) || 1)) * 48;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
          <div className="flex justify-between text-[10px] text-neutral-400 mt-3">
            <span>{formatChartDate(data[0]?.date)}</span>
            <span>{formatChartDate(data[data.length - 1]?.date)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="card p-5">
      <div className="skeleton h-3 w-32 mb-4" />
      <div className="skeleton h-28 w-full" />
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
      <BarChart data={topTerms} labelKey="query" valueKey="count" title="Top searched terms" />
      <BarChart
        data={topDocuments?.map((d) => ({ query: d.title || d.url, count: d.bookmarkCount }))}
        labelKey="query"
        valueKey="count"
        title="Most bookmarked pages"
      />
    </div>
  );
}
