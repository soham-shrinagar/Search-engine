const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { crawlLimiter } = require('../middleware/rateLimiter');
const { isValidUrl, normalizeUrl } = require('../utils/urlValidator');
const { applyCrawlError } = require('../utils/crawlErrors');
const {
  crawlSinglePage,
  crawlRecursive,
  getCrawlHistory,
  getPages,
} = require('../services/crawler');

const router = express.Router();

router.post(
  '/submit',
  crawlLimiter,
  asyncHandler(async (req, res) => {
    const { url, recursive, maxDepth, maxPages, sameDomainOnly } = req.body;

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'URL is required.' });
    }

    if (!isValidUrl(url)) {
      return res.status(400).json({ success: false, error: 'Invalid URL format.' });
    }

    const normalizedUrl = normalizeUrl(url);

    try {
      if (recursive) {
        const { results, summary } = await crawlRecursive(normalizedUrl, {
          maxDepth: Math.min(parseInt(maxDepth, 10) || 2, 5),
          maxPages: Math.min(parseInt(maxPages, 10) || 50, 100),
          sameDomainOnly: sameDomainOnly !== false,
        });
        return res.json({ success: true, data: { results, summary } });
      }

      const result = await crawlSinglePage(normalizedUrl);
      const { html, ...safeResult } = result;
      res.json({ success: true, data: safeResult });
    } catch (err) {
      throw applyCrawlError(err);
    }
  })
);

router.get(
  '/pages',
  asyncHandler(async (req, res) => {
    const { status } = req.query;
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 100), 500);
    const offset = Math.max(0, parseInt(req.query.offset, 10) || 0);
    const pages = await getPages(status || null, limit, offset);
    res.json({ success: true, data: pages });
  })
);

router.get(
  '/history',
  asyncHandler(async (req, res) => {
    const limit = Math.min(Math.max(1, parseInt(req.query.limit, 10) || 50), 200);
    const history = await getCrawlHistory(limit);
    res.json({ success: true, data: history });
  })
);

module.exports = router;
