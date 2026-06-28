const robotsParser = require('robots-parser');
const { query } = require('../config/database');
const { extractContent } = require('./extractor');
const { hashContent, indexPage, removePageFromIndex } = require('./indexer');
const { isValidUrl, normalizeUrl, resolveUrl, isSameDomain } = require('../utils/urlValidator');
const { applyCrawlError } = require('../utils/crawlErrors');

const CRAWL_TIMEOUT = 15000;
const MAX_RETRIES = 3;
const DEFAULT_MAX_DEPTH = 2;
const DEFAULT_MAX_PAGES = 50;
const ROBOTS_CACHE_TTL = 60 * 60 * 1000;

const robotsCache = new Map();

async function fetchWithTimeout(url, timeout = CRAWL_TIMEOUT) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'SearchSphereBot/1.0 (+https://searchsphere.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

async function getRobotsParser(url) {
  const parsed = new URL(url);
  const cacheKey = `${parsed.protocol}//${parsed.hostname}`;
  const cached = robotsCache.get(cacheKey);
  if (cached && Date.now() - cached.fetchedAt < ROBOTS_CACHE_TTL) {
    return cached.parser;
  }

  const robotsUrl = `${parsed.protocol}//${parsed.hostname}/robots.txt`;

  try {
    const response = await fetchWithTimeout(robotsUrl, 5000);
    const text = response.ok ? await response.text() : '';
    const parser = robotsParser(robotsUrl, text);
    robotsCache.set(cacheKey, { parser, fetchedAt: Date.now() });
    return parser;
  } catch {
    const parser = robotsParser(robotsUrl, '');
    robotsCache.set(cacheKey, { parser, fetchedAt: Date.now() });
    return parser;
  }
}

async function canCrawl(url) {
  try {
    const robots = await getRobotsParser(url);
    const allowed = robots.isAllowed(url, 'SearchSphereBot');
    return allowed !== false;
  } catch {
    return true;
  }
}

async function fetchPage(url, retries = MAX_RETRIES) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      const contentType = response.headers.get('content-type') || '';
      if (!contentType.includes('text/html')) {
        const err = new Error(`Unsupported content type: ${contentType}`);
        err.status = 415;
        throw err;
      }
      return await response.text();
    } catch (err) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000 * attempt));
    }
  }
}

function extractLinks(html, baseUrl) {
  const cheerio = require('cheerio');
  const $ = cheerio.load(html);
  const links = new Set();

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('javascript:')) {
      return;
    }
    const resolved = resolveUrl(baseUrl, href);
    if (resolved && isValidUrl(resolved)) {
      links.add(normalizeUrl(resolved));
    }
  });

  return [...links];
}

async function crawlSinglePage(url) {
  const normalizedUrl = normalizeUrl(url);

  if (!(await canCrawl(normalizedUrl))) {
    const err = new Error('Crawling disallowed by robots.txt');
    err.status = 403;
    throw err;
  }

  const upsertResult = await query(
    `INSERT INTO pages (url, crawl_status)
     VALUES ($1, 'crawling')
     ON CONFLICT (url) DO UPDATE
     SET crawl_status = 'crawling', updated_at = NOW()
     RETURNING id, content_hash`,
    [normalizedUrl]
  );

  const pageId = upsertResult.rows[0].id;
  const existingHash = upsertResult.rows[0].content_hash;

  try {
    const html = await fetchPage(normalizedUrl);
    const { title, content } = extractContent(html);
    const contentHash = hashContent(content);

    if (existingHash && existingHash === contentHash) {
      await query(
        `UPDATE pages SET crawl_status = 'indexed', last_crawled_at = NOW(), updated_at = NOW() WHERE id = $1`,
        [pageId]
      );
      await logCrawl(pageId, 'skipped', 'Content unchanged');
      return {
        pageId,
        url: normalizedUrl,
        title,
        status: 'skipped',
        message: 'Content unchanged',
        html,
      };
    }

    if (existingHash) {
      await removePageFromIndex(pageId);
    }

    await query(
      `UPDATE pages SET title = $1, content = $2, content_hash = $3,
       crawl_status = 'indexed', last_crawled_at = NOW(), updated_at = NOW()
       WHERE id = $4`,
      [title, content, contentHash, pageId]
    );

    const indexResult = await indexPage(pageId, title, content);
    await logCrawl(pageId, 'success');

    return {
      pageId,
      url: normalizedUrl,
      title,
      status: 'indexed',
      termCount: indexResult.termCount,
      html,
    };
  } catch (err) {
    await query(
      `UPDATE pages SET crawl_status = 'failed', updated_at = NOW() WHERE id = $1`,
      [pageId]
    );
    await logCrawl(pageId, 'failed', err.message);
    throw applyCrawlError(err);
  }
}

function summarizeCrawlResults(results) {
  return {
    total: results.length,
    indexed: results.filter((r) => r.status === 'indexed').length,
    skipped: results.filter((r) => r.status === 'skipped').length,
    failed: results.filter((r) => r.status === 'failed').length,
  };
}

async function crawlRecursive(startUrl, options = {}) {
  const {
    maxDepth = DEFAULT_MAX_DEPTH,
    maxPages = DEFAULT_MAX_PAGES,
    sameDomainOnly = true,
    delayMs = 0,
    shouldContinue = null,
  } = options;

  const startDomain = new URL(startUrl).hostname;
  const visited = new Set();
  const queue = [{ url: normalizeUrl(startUrl), depth: 0 }];
  const results = [];
  let successCount = 0;

  while (queue.length > 0 && successCount < maxPages) {
    if (shouldContinue) {
      const ok = await shouldContinue();
      if (!ok) break;
    }

    const { url, depth } = queue.shift();

    if (visited.has(url)) continue;
    visited.add(url);

    if (sameDomainOnly && !isSameDomain(url, startUrl)) continue;

    try {
      const result = await crawlSinglePage(url);
      results.push(result);

      if (result.status === 'indexed' || result.status === 'skipped') {
        successCount++;
      }

      if (depth < maxDepth && result.html && result.status !== 'failed') {
        const links = extractLinks(result.html, url);
        for (const link of links) {
          if (!visited.has(link)) {
            if (!sameDomainOnly || new URL(link).hostname === startDomain) {
              queue.push({ url: link, depth: depth + 1 });
            }
          }
        }
      }
    } catch (err) {
      applyCrawlError(err);
      results.push({ url, status: 'failed', error: err.message });
    }

    if (delayMs > 0) {
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  return { results, summary: summarizeCrawlResults(results) };
}

async function logCrawl(pageId, status, errorMessage = null) {
  await query(
    'INSERT INTO crawl_logs (page_id, status, error_message) VALUES ($1, $2, $3)',
    [pageId, status, errorMessage]
  );
}

async function getCrawlHistory(limit = 50) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 50), 200);
  const result = await query(
    `SELECT cl.id, cl.status, cl.error_message, cl.crawled_at,
            p.url, p.title
     FROM crawl_logs cl
     LEFT JOIN pages p ON cl.page_id = p.id
     ORDER BY cl.crawled_at DESC
     LIMIT $1`,
    [safeLimit]
  );
  return result.rows;
}

async function getPages(status = null, limit = 100, offset = 0) {
  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 100), 500);
  const safeOffset = Math.max(0, parseInt(offset, 10) || 0);

  let sql = 'SELECT id, url, title, crawl_status, last_crawled_at, created_at FROM pages';
  const params = [];

  if (status) {
    sql += ' WHERE crawl_status = $1';
    params.push(status);
  }

  sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
  params.push(safeLimit, safeOffset);

  const result = await query(sql, params);
  return result.rows;
}

module.exports = {
  crawlSinglePage,
  crawlRecursive,
  getCrawlHistory,
  getPages,
  fetchPage,
  extractLinks,
  summarizeCrawlResults,
};
