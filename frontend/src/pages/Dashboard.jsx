import { useState, useEffect } from 'react';
import AppPageLayout from '../components/AppPageLayout';
import DashboardCards from '../components/DashboardCards';
import AnalyticsCharts from '../components/AnalyticsCharts';
import CrawlTable from '../components/CrawlTable';
import { analyticsApi, crawlApi } from '../api/client';

async function fetchSettled(promise) {
  try {
    const res = await promise;
    return res.data.data;
  } catch (err) {
    return { error: err.message };
  }
}

export default function Dashboard() {
  const [metrics, setMetrics] = useState(null);
  const [searchesOverTime, setSearchesOverTime] = useState([]);
  const [topTerms, setTopTerms] = useState([]);
  const [topDocuments, setTopDocuments] = useState([]);
  const [errors, setErrors] = useState([]);
  const [crawlHistory, setCrawlHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sectionErrors, setSectionErrors] = useState({});

  useEffect(() => {
    async function loadDashboard() {
      setLoading(true);
      setSectionErrors({});

      const [
        metricsData,
        searchesData,
        termsData,
        docsData,
        errorsData,
        historyData,
      ] = await Promise.all([
        fetchSettled(analyticsApi.getDashboard()),
        fetchSettled(analyticsApi.getSearchesOverTime()),
        fetchSettled(analyticsApi.getTopTerms()),
        fetchSettled(analyticsApi.getTopDocuments()),
        fetchSettled(analyticsApi.getErrors()),
        fetchSettled(crawlApi.getHistory(20)),
      ]);

      const errs = {};

      if (metricsData?.error) errs.metrics = metricsData.error;
      else setMetrics(metricsData);

      if (searchesData?.error) errs.searches = searchesData.error;
      else setSearchesOverTime(searchesData || []);

      if (termsData?.error) errs.terms = termsData.error;
      else setTopTerms(termsData || []);

      if (docsData?.error) errs.documents = docsData.error;
      else setTopDocuments(docsData || []);

      if (errorsData?.error) errs.errorLog = errorsData.error;
      else setErrors(errorsData || []);

      if (historyData?.error) errs.history = historyData.error;
      else setCrawlHistory(historyData || []);

      setSectionErrors(errs);
      setLoading(false);
    }
    loadDashboard();
  }, []);

  const hasAnyError = Object.keys(sectionErrors).length > 0;

  return (
    <AppPageLayout
      title="Dashboard"
      subtitle="Index stats, search activity, and crawl logs."
    >
      {hasAnyError && (
        <div className="card-flat mb-4 sm:mb-6 text-sm text-ink-muted dark:text-ink-dark-muted">
          Some sections couldn&apos;t load. Showing what&apos;s available.
        </div>
      )}

      <div className="space-y-4 sm:space-y-6">
        {sectionErrors.metrics ? (
          <div className="card-flat text-sm text-ink-muted">Metrics unavailable</div>
        ) : (
          <DashboardCards metrics={metrics} loading={loading} />
        )}

        <AnalyticsCharts
          searchesOverTime={searchesOverTime}
          topTerms={topTerms}
          topDocuments={topDocuments}
          loading={loading}
        />

        <div className="card-flat">
          <h2 className="section-title">Recent crawls</h2>
          {sectionErrors.history ? (
            <p className="text-sm text-ink-muted">Couldn&apos;t load history</p>
          ) : (
            <CrawlTable data={crawlHistory} loading={loading} emptyMessage="No crawls yet." />
          )}
        </div>

        <div className="card-flat">
          <h2 className="section-title">Errors</h2>
          {sectionErrors.errorLog ? (
            <p className="text-sm text-ink-muted">Couldn&apos;t load errors</p>
          ) : (
            <CrawlTable
              data={errors.map((e) => ({ ...e, status: 'failed' }))}
              loading={loading}
              emptyMessage="No errors."
            />
          )}
        </div>
      </div>
    </AppPageLayout>
  );
}
