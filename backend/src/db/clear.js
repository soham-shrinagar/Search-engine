require('dotenv').config();
const { pool } = require('../config/database');

const TABLES = [
  'bookmarked_pages',
  'saved_searches',
  'search_logs',
  'crawl_logs',
  'postings',
  'pages',
  'terms',
  'email_otps',
  'users',
];

async function clearDatabase() {
  try {
    await pool.query(`TRUNCATE TABLE ${TABLES.join(', ')} RESTART IDENTITY CASCADE`);
    console.log('Database cleared. All table data removed.');
  } catch (err) {
    console.error('Clear failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

clearDatabase();
