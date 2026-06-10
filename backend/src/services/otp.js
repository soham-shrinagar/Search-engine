const crypto = require('crypto');
const { query } = require('../config/database');
const { sendOtpEmail } = require('./email');

const OTP_TTL_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const RESEND_COOLDOWN_MS = 60 * 1000;

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function generateCode() {
  return crypto.randomInt(100000, 999999).toString();
}

function hashCode(code) {
  const secret = process.env.JWT_SECRET || 'otp-fallback-secret';
  return crypto.createHash('sha256').update(`${code}:${secret}`).digest('hex');
}

async function getRecentOtp(email, purpose) {
  const result = await query(
    `SELECT id, code_hash, attempts, expires_at, created_at
     FROM email_otps
     WHERE email = $1 AND purpose = $2 AND used_at IS NULL
     ORDER BY created_at DESC
     LIMIT 1`,
    [normalizeEmail(email), purpose]
  );
  return result.rows[0] || null;
}

async function sendOtp(email, purpose) {
  const normalized = normalizeEmail(email);

  const recent = await getRecentOtp(normalized, purpose);
  if (recent) {
    const age = Date.now() - new Date(recent.created_at).getTime();
    if (age < RESEND_COOLDOWN_MS) {
      const err = new Error('Please wait a minute before requesting another code.');
      err.status = 429;
      throw err;
    }
  }

  await query(
    'UPDATE email_otps SET used_at = NOW() WHERE email = $1 AND purpose = $2 AND used_at IS NULL',
    [normalized, purpose]
  );

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS);

  await query(
    `INSERT INTO email_otps (email, code_hash, purpose, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [normalized, hashCode(code), purpose, expiresAt]
  );

  await sendOtpEmail(normalized, code, purpose);
  return { expiresInSeconds: OTP_TTL_MS / 1000 };
}

async function verifyOtp(email, code, purpose) {
  const normalized = normalizeEmail(email);
  const record = await getRecentOtp(normalized, purpose);

  if (!record) {
    const err = new Error('No verification code found. Request a new one.');
    err.status = 400;
    throw err;
  }

  if (new Date(record.expires_at) < new Date()) {
    const err = new Error('Verification code expired. Request a new one.');
    err.status = 400;
    throw err;
  }

  if (record.attempts >= MAX_ATTEMPTS) {
    const err = new Error('Too many attempts. Request a new code.');
    err.status = 400;
    throw err;
  }

  const valid = hashCode(code) === record.code_hash;
  if (!valid) {
    await query('UPDATE email_otps SET attempts = attempts + 1 WHERE id = $1', [record.id]);
    const err = new Error('Invalid verification code.');
    err.status = 400;
    throw err;
  }

  await query('UPDATE email_otps SET used_at = NOW() WHERE id = $1', [record.id]);
  return normalized;
}

module.exports = { sendOtp, verifyOtp, normalizeEmail };
