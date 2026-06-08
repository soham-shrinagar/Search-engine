const { query } = require('../config/database');
const { getIndexStats } = require('./indexer');

async function getDashboardMetrics() {
  const [indexStats, searchStats, crawlStats, pageCount] = await Promise.all([
    getIndexStats(),
    query(`
      SELECT
        COUNT(*) AS total_searches,
        COALESCE(AVG(response_time), 0) AS avg_response_time
      FROM search_logs
    `),
    query(`
      SELECT
        COUNT(*) FILTER (WHERE status = 'success' OR status = 'skipped') AS success_count,
        COUNT(*) FILTER (WHERE status = 'failed') AS failure_count,
        COUNT(*) AS total_crawls
      FROM crawl_logs
    `),
    query('SELECT COUNT(*) FROM pages'),
  ]);

  const search = searchStats.rows[0];
  const crawl = crawlStats.rows[0];
  const totalCrawls = parseInt(crawl.total_crawls, 10) || 1;

  return {
    totalIndexedPages: indexStats.indexedPages,
    totalTerms: indexStats.totalTerms,
    totalPostings: indexStats.totalPostings,
    totalPages: parseInt(pageCount.rows[0].count, 10),
    totalSearches: parseInt(search.total_searches, 10),
    avgResponseTime: Math.round(parseFloat(search.avg_response_time)),
    crawlSuccessRate: Math.round((parseInt(crawl.success_count, 10) / totalCrawls) * 100),
    crawlFailureRate: Math.round((parseInt(crawl.failure_count, 10) / totalCrawls) * 100),
  };
}

async function getSearchesOverTime(days = 30) {
  const result = await query(
    `SELECT DATE(searched_at) AS date, COUNT(*) AS count
     FROM search_logs
     WHERE searched_at >= NOW() - INTERVAL '1 day' * $1
     GROUP BY DATE(searched_at)
     ORDER BY date ASC`,
    [days]
  );
  return result.rows.map((r) => ({
    date: r.date,
    count: parseInt(r.count, 10),
  }));
}

async function getTopSearchedTerms(limit = 10) {
  const result = await query(
    `SELECT query, COUNT(*) AS count
     FROM search_logs
     GROUP BY query
     ORDER BY count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map((r) => ({
    query: r.query,
    count: parseInt(r.count, 10),
  }));
}

async function getMostVisitedDocuments(limit = 10) {
  const result = await query(
    `SELECT p.id, p.url, p.title, COUNT(b.id) AS bookmark_count
     FROM pages p
     LEFT JOIN bookmarked_pages b ON p.id = b.page_id
     GROUP BY p.id, p.url, p.title
     ORDER BY bookmark_count DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows.map((r) => ({
    id: r.id,
    url: r.url,
    title: r.title,
    bookmarkCount: parseInt(r.bookmark_count, 10),
  }));
}

async function getRecentErrors(limit = 20) {
  const result = await query(
    `SELECT cl.id, cl.error_message, cl.crawled_at, p.url
     FROM crawl_logs cl
     LEFT JOIN pages p ON cl.page_id = p.id
     WHERE cl.status = 'failed'
     ORDER BY cl.crawled_at DESC
     LIMIT $1`,
    [limit]
  );
  return result.rows;
}

module.exports = {
  getDashboardMetrics,
  getSearchesOverTime,
  getTopSearchedTerms,
  getMostVisitedDocuments,
  getRecentErrors,
};
