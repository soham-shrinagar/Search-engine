require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { pool } = require('../config/database');

const PATCHES = [
  'ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL',
];

async function migrate() {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  try {
    await pool.query(schema);

    for (const patch of PATCHES) {
      try {
        await pool.query(patch);
      } catch (err) {
        if (!err.message.includes('does not exist') && !err.message.includes('already')) {
          console.warn(`Patch skipped: ${err.message}`);
        }
      }
    }

    console.log('Database migration completed successfully.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrate();
