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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

pool.on('error', (err) => {
  console.error('Unexpected database pool error:', err);
});

async function query(text, params) {
  const start = Date.now();
  const result = await pool.query(text, params);
  const duration = Date.now() - start;
  if (process.env.NODE_ENV === 'development' && duration > 100) {
    console.warn(`Slow query (${duration}ms):`, text.slice(0, 80));
  }
  return result;
}

module.exports = { pool, query };
