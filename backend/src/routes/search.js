const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { searchLimiter } = require('../middleware/rateLimiter');
const { optionalAuth } = require('../middleware/auth');
const {
  parseQuery,
  searchPages,
  autocomplete,
  logSearch,
} = require('../services/searchEngine');

const router = express.Router();
const RESULTS_PER_PAGE = 10;

router.get(
  '/',
  searchLimiter,
  optionalAuth,
  asyncHandler(async (req, res) => {
    const { q, page = 1, fuzzy } = req.query;

    if (!q || typeof q !== 'string' || q.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Search query is required.' });
    }

    if (q.length > 500) {
      return res.status(400).json({ success: false, error: 'Query too long.' });
    }

    const sanitized = q.trim().slice(0, 500);
    const startTime = Date.now();

    const parsed = parseQuery(sanitized);
    const allResults = await searchPages(parsed, { fuzzy: fuzzy === 'true' });

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const totalResults = allResults.length;
    const totalPages = Math.ceil(totalResults / RESULTS_PER_PAGE);
    const offset = (pageNum - 1) * RESULTS_PER_PAGE;
    const results = allResults.slice(offset, offset + RESULTS_PER_PAGE);

    const responseTime = Date.now() - startTime;
    await logSearch(sanitized, responseTime, totalResults, req.user?.id || null);

    res.json({
      success: true,
      data: {
        query: sanitized,
        results,
        pagination: {
          page: pageNum,
          perPage: RESULTS_PER_PAGE,
          totalResults,
          totalPages,
        },
        responseTime,
      },
    });
  })
);

router.get(
  '/autocomplete',
  searchLimiter,
  asyncHandler(async (req, res) => {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ success: true, data: [] });
    }

    const suggestions = await autocomplete(q.slice(0, 50));
    res.json({ success: true, data: suggestions });
  })
);

module.exports = router;
