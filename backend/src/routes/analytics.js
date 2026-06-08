const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getDashboardMetrics,
  getSearchesOverTime,
  getTopSearchedTerms,
  getMostVisitedDocuments,
  getRecentErrors,
} = require('../services/analytics');

const router = express.Router();

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    const metrics = await getDashboardMetrics();
    res.json({ success: true, data: metrics });
  })
);

router.get(
  '/searches-over-time',
  asyncHandler(async (req, res) => {
    const days = parseInt(req.query.days, 10) || 30;
    const data = await getSearchesOverTime(days);
    res.json({ success: true, data });
  })
);

router.get(
  '/top-terms',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await getTopSearchedTerms(limit);
    res.json({ success: true, data });
  })
);

router.get(
  '/top-documents',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 10;
    const data = await getMostVisitedDocuments(limit);
    res.json({ success: true, data });
  })
);

router.get(
  '/errors',
  asyncHandler(async (req, res) => {
    const limit = parseInt(req.query.limit, 10) || 20;
    const data = await getRecentErrors(limit);
    res.json({ success: true, data });
  })
);

module.exports = router;
