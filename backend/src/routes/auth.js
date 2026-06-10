const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const { authLimiter } = require('../middleware/rateLimiter');
const { authenticate } = require('../middleware/auth');
const { sendOtp } = require('../services/otp');
const {
  userExists,
  verifySignupOtp,
  verifyLoginOtp,
  getMe,
  getSearchHistory,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
} = require('../services/auth');

const router = express.Router();

function validateEmail(email) {
  return typeof email === 'string' && email.length <= 255 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateOtp(code) {
  return typeof code === 'string' && /^\d{6}$/.test(code);
}

router.post(
  '/signup/send-otp',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }

    if (await userExists(email)) {
      return res.status(409).json({ success: false, error: 'Email already registered. Sign in instead.' });
    }

    const result = await sendOtp(email, 'signup');
    res.json({ success: true, data: result });
  })
);

router.post(
  '/signup/verify',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }
    if (!validateOtp(code)) {
      return res.status(400).json({ success: false, error: 'Enter the 6-digit verification code.' });
    }

    const result = await verifySignupOtp(email, code);
    res.status(201).json({ success: true, data: result });
  })
);

router.post(
  '/login/send-otp',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }

    if (!(await userExists(email))) {
      return res.status(404).json({ success: false, error: 'No account found. Create an account first.' });
    }

    const result = await sendOtp(email, 'login');
    res.json({ success: true, data: result });
  })
);

router.post(
  '/login/verify',
  authLimiter,
  asyncHandler(async (req, res) => {
    const { email, code } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Valid email is required.' });
    }
    if (!validateOtp(code)) {
      return res.status(400).json({ success: false, error: 'Enter the 6-digit verification code.' });
    }

    const result = await verifyLoginOtp(email, code);
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

router.delete(
  '/saved/:id',
  authenticate,
  asyncHandler(async (req, res) => {
    const savedId = parseInt(req.params.id, 10);
    if (!savedId) {
      return res.status(400).json({ success: false, error: 'Invalid saved search id.' });
    }
    await deleteSavedSearch(req.user.id, savedId);
    res.json({ success: true });
  })
);

module.exports = router;
