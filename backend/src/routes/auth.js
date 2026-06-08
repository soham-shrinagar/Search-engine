const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const {
  register,
  login,
  getMe,
  getSearchHistory,
  saveSearch,
  getSavedSearches,
} = require('../services/auth');

const router = express.Router();

function validateEmail(email) {
  return typeof email === 'string' && email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password) {
  return typeof password === 'string' && password.length >= 8 && password.length <= 128;
}

router.post(
  '/register',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({ success: false, error: 'Password must be 8–128 characters.' });
    }

    const result = await register(email, password);
    res.status(201).json({ success: true, data: result });
  })
);

router.post(
  '/login',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required.' });
    }

    const result = await login(email, password);
    res.json({ success: true, data: result });
  })
);

router.get(
  '/me',
  authenticate,
  asyncHandler(async (req, res) => {
    const user = await getMe(req.user.id);
    res.json({ success: true, data: user });
  })
);

router.get(
  '/history',
  authenticate,
  asyncHandler(async (req, res) => {
    const history = await getSearchHistory(req.user.id);
    res.json({ success: true, data: history });
  })
);

router.post(
  '/saved',
  authenticate,
  asyncHandler(async (req, res) => {
    const { query: queryText } = req.body;
    if (!queryText || typeof queryText !== 'string') {
      return res.status(400).json({ success: false, error: 'Query is required.' });
    }
    const trimmed = queryText.trim().slice(0, 500);
    if (!trimmed) {
      return res.status(400).json({ success: false, error: 'Query is required.' });
    }
    const saved = await saveSearch(req.user.id, trimmed);
    res.status(201).json({ success: true, data: saved });
  })
);

router.get(
  '/saved',
  authenticate,
  asyncHandler(async (req, res) => {
    const saved = await getSavedSearches(req.user.id);
    res.json({ success: true, data: saved });
  })
);

module.exports = router;
