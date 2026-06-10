import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
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
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="page-header">
        <h1 className="page-title">Analytics Dashboard</h1>
        <p className="page-subtitle">
          Index health, search activity, crawl performance, and usage trends.
        </p>
      </div>

      {hasAnyError && (
        <div className="card p-4 mb-6 text-sm text-neutral-500">
          Some sections failed to load. Showing available data.
        </div>
      )}

      <div className="flex gap-8">
        <Sidebar />
        <div className="flex-1 min-w-0 space-y-6">
          {sectionErrors.metrics ? (
            <div className="card p-4 text-sm text-neutral-500">Metrics unavailable</div>
          ) : (
            <DashboardCards metrics={metrics} loading={loading} />
          )}

          <AnalyticsCharts
            searchesOverTime={searchesOverTime}
            topTerms={topTerms}
            topDocuments={topDocuments}
            loading={loading}
          />

          <div className="card p-5">
            <h2 className="section-title">Recent crawl history</h2>
            {sectionErrors.history ? (
              <p className="text-sm text-neutral-500">Could not load crawl history</p>
            ) : (
              <CrawlTable data={crawlHistory} loading={loading} emptyMessage="No crawls yet — add a page from the Crawl tab." />
            )}
          </div>

          <div className="card p-5">
            <h2 className="section-title">Recent errors</h2>
            {sectionErrors.errorLog ? (
              <p className="text-sm text-neutral-500">Could not load errors</p>
            ) : (
              <CrawlTable
                data={errors.map((e) => ({ ...e, status: 'failed' }))}
                loading={loading}
                emptyMessage="No crawl errors — looking good."
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
