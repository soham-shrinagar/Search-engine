const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticate } = require('../middleware/auth');
const {
  addBookmark,
  removeBookmark,
  getBookmarks,
  getBookmarkedPageIds,
} = require('../services/bookmarks');

const router = express.Router();

function parsePageId(value) {
  const id = parseInt(value, 10);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

router.get(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const bookmarks = await getBookmarks(req.user.id);
    res.json({ success: true, data: bookmarks });
  })
);

router.get(
  '/ids',
  authenticate,
  asyncHandler(async (req, res) => {
    const pageIds = await getBookmarkedPageIds(req.user.id);
    res.json({ success: true, data: pageIds });
  })
);

router.post(
  '/',
  authenticate,
  asyncHandler(async (req, res) => {
    const pageId = parsePageId(req.body.pageId);
    if (!pageId) {
      return res.status(400).json({ success: false, error: 'Valid pageId is required.' });
    }
    const bookmark = await addBookmark(req.user.id, pageId);
    res.status(201).json({ success: true, data: bookmark });
  })
);

router.delete(
  '/:pageId',
  authenticate,
  asyncHandler(async (req, res) => {
    const pageId = parsePageId(req.params.pageId);
    if (!pageId) {
      return res.status(400).json({ success: false, error: 'Valid pageId is required.' });
    }
    await removeBookmark(req.user.id, pageId);
    res.json({ success: true, data: { removed: true } });
  })
);

module.exports = router;
