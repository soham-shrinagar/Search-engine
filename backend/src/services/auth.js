const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { query } = require('../config/database');

const SALT_ROUNDS = 12;

async function register(email, password) {
  const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length > 0) {
    const err = new Error('Email already registered.');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const result = await query(
    'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
    [email.toLowerCase(), passwordHash]
  );

  const user = result.rows[0];
  const token = generateToken(user);
  return { user: { id: user.id, email: user.email }, token };
}

async function login(email, password) {
  const result = await query(
    'SELECT id, email, password_hash FROM users WHERE email = $1',
    [email.toLowerCase()]
  );

  if (result.rows.length === 0) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const err = new Error('Invalid email or password.');
    err.status = 401;
    throw err;
  }

  const token = generateToken(user);
  return { user: { id: user.id, email: user.email }, token };
}

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d', algorithm: 'HS256' }
  );
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

module.exports = {
  register,
  login,
  getMe,
  getSearchHistory,
  saveSearch,
  getSavedSearches,
};
