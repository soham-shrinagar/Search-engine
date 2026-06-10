const jwt = require('jsonwebtoken');
const { query } = require('../config/database');
const { verifyOtp, normalizeEmail } = require('./otp');

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );
}

async function userExists(email) {
  const result = await query('SELECT id FROM users WHERE email = $1', [normalizeEmail(email)]);
  return result.rows.length > 0;
}

async function createUser(email) {
  const result = await query(
    'INSERT INTO users (email) VALUES ($1) RETURNING id, email, created_at',
    [normalizeEmail(email)]
  );
  return result.rows[0];
}

async function getUserByEmail(email) {
  const result = await query(
    'SELECT id, email, created_at FROM users WHERE email = $1',
    [normalizeEmail(email)]
  );
  return result.rows[0] || null;
}

async function verifySignupOtp(email, code) {
  const verifiedEmail = await verifyOtp(email, code, 'signup');

  if (await userExists(verifiedEmail)) {
    const err = new Error('Email already registered.');
    err.status = 409;
    throw err;
  }

  const user = await createUser(verifiedEmail);
  const token = generateToken(user);
  return { user: { id: user.id, email: user.email }, token, isNewUser: true };
}

async function verifyLoginOtp(email, code) {
  const verifiedEmail = await verifyOtp(email, code, 'login');

  const user = await getUserByEmail(verifiedEmail);
  if (!user) {
    const err = new Error('No account found for this email. Create an account first.');
    err.status = 404;
    throw err;
  }

  const token = generateToken(user);
  return { user: { id: user.id, email: user.email }, token, isNewUser: false };
}

async function getMe(userId) {
  const result = await query(
    'SELECT id, email, created_at FROM users WHERE id = $1',
    [userId]
  );

  if (result.rows.length === 0) {
    const err = new Error('User not found.');
    err.status = 401;
    throw err;
  }

  return { id: result.rows[0].id, email: result.rows[0].email };
}

async function getSearchHistory(userId, limit = 50) {
  const result = await query(
    `SELECT DISTINCT query, MAX(searched_at) AS last_searched, COUNT(*) AS search_count
     FROM search_logs
     WHERE user_id = $1
     GROUP BY query
     ORDER BY last_searched DESC
     LIMIT $2`,
    [userId, limit]
  );
  return result.rows;
}

async function saveSearch(userId, queryText) {
  const result = await query(
    'INSERT INTO saved_searches (user_id, query) VALUES ($1, $2) RETURNING id, query, created_at',
    [userId, queryText]
  );
  return result.rows[0];
}

async function getSavedSearches(userId) {
  const result = await query(
    'SELECT id, query, created_at FROM saved_searches WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
}

async function deleteSavedSearch(userId, savedId) {
  const result = await query(
    'DELETE FROM saved_searches WHERE id = $1 AND user_id = $2 RETURNING id',
    [savedId, userId]
  );
  if (result.rows.length === 0) {
    const err = new Error('Saved search not found.');
    err.status = 404;
    throw err;
  }
}

module.exports = {
  userExists,
  verifySignupOtp,
  verifyLoginOtp,
  getMe,
  getSearchHistory,
  saveSearch,
  getSavedSearches,
  deleteSavedSearch,
};
