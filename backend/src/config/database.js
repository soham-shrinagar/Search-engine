const { Pool } = require('pg');

function getSslConfig() {
  const url = process.env.DATABASE_URL || '';
  const needsSsl =
    process.env.NODE_ENV === 'production' ||
    url.includes('neon.tech') ||
    url.includes('sslmode=require');

  return needsSsl ? { rejectUnauthorized: false } : false;
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: getSslConfig(),
  max: 10,
  idleTimeoutMillis: 60000,
  connectionTimeoutMillis: 15000,
  keepAlive: true,
});

pool.on('error', (err) => {
  console.error('Database pool error (will reconnect on next query):', err.message);
});

pool.on('connect', (client) => {
  client.on('error', (err) => {
    console.error('Database client error (will reconnect on next query):', err.message);
  });
});

const RETRYABLE = /Connection terminated|ECONNRESET|ECONNREFUSED|ETIMEDOUT|connection timeout|Client has encountered|socket hang up|Connection lost/i;

async function query(text, params, retries = 5) {
  const start = Date.now();
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await pool.query(text, params);
      const duration = Date.now() - start;
      if (process.env.NODE_ENV === 'development' && duration > 100) {
        console.warn(`Slow query (${duration}ms):`, text.slice(0, 80));
      }
      return result;
    } catch (err) {
      if (attempt < retries && RETRYABLE.test(err.message)) {
        console.warn(`DB query retry ${attempt}/${retries - 1}: ${err.message}`);
        await new Promise((r) => setTimeout(r, 1000 * attempt));
        continue;
      }
      throw err;
    }
  }
}

module.exports = { pool, query };
