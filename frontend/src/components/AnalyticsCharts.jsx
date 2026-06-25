function BarChart({ data, labelKey, valueKey, title, description }) {
  const max = data?.length ? Math.max(...data.map((d) => d[valueKey])) : 1;

  return (
    <div className="card-flat">
      <h3 className="section-title !mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-ink-muted dark:text-ink-dark-muted mb-4 leading-relaxed">{description}</p>
      )}
      {!data?.length ? (
        <p className="text-xs text-ink-faint text-center py-8">No data yet — run some searches first.</p>
      ) : (
        <div className="space-y-3">
          {data.slice(0, 8).map((item, i) => (
            <div key={i} className="space-y-1 sm:space-y-0 sm:flex sm:items-center sm:gap-3">
              <span className="text-xs text-ink-muted dark:text-ink-dark-muted sm:w-28 sm:truncate sm:flex-shrink-0 block">
                {item[labelKey]}
              </span>
              <div className="flex items-center gap-2 sm:flex-1">
                <div className="flex-1 h-1.5 bg-surface dark:bg-surface-dark-hover rounded-full overflow-hidden">
                  <div
                    className="bg-ink dark:bg-ink-dark h-full rounded-full transition-all duration-500"
                    style={{ width: `${(item[valueKey] / max) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-ink-faint w-6 text-right tabular-nums flex-shrink-0">
                  {item[valueKey]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LineChart({ data, title, description }) {
  return (
    <div className="card-flat">
      <h3 className="section-title !mb-1">{title}</h3>
      {description && (
        <p className="text-xs text-ink-muted dark:text-ink-dark-muted mb-4 leading-relaxed">{description}</p>
      )}
      {!data?.length ? (
        <p className="text-xs text-ink-faint text-center py-8">No searches yet — try searching from the home page.</p>
      ) : (
        <>
          <svg viewBox="0 0 100 40" className="w-full h-20 sm:h-24 mt-1" preserveAspectRatio="none">
            <polyline
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-ink dark:text-ink-dark"
              points={data.map((d, i) => {
                const x = (i / (data.length - 1 || 1)) * 100;
                const y = 40 - (d.count / (Math.max(...data.map((x) => x.count)) || 1)) * 36;
                return `${x},${y}`;
              }).join(' ')}
            />
          </svg>
          <div className="flex justify-between text-[10px] text-ink-faint mt-2 gap-2">
            <span className="truncate">{formatChartDate(data[0]?.date)}</span>
            <span className="truncate text-right">{formatChartDate(data[data.length - 1]?.date)}</span>
          </div>
        </>
      )}
    </div>
  );
}

function formatChartDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = String(dateStr).split('T')[0].split('-');
  return new Date(Number(year), Number(month) - 1, Number(day)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function ChartSkeleton() {
  return (
    <div className="card-flat">
      <div className="skeleton h-2.5 w-28 mb-5" />
      <div className="skeleton h-20 sm:h-24 w-full" />
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
      <LineChart
        data={searchesOverTime}
        title="Searches over time"
        description="Shows user search activity day by day."
      />
      <BarChart
        data={topTerms}
        labelKey="query"
        valueKey="count"
        title="Top queries"
        description="Most frequently searched terms."
      />
      <BarChart
        data={topDocuments?.map((d) => ({ query: d.title || d.url, count: d.bookmarkCount }))}
        labelKey="query"
        valueKey="count"
        title="Indexed pages growth"
        description="Most bookmarked searchable pages in your index."
      />
    </div>
  );
}
