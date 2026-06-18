require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { query } = require('./config/database');
const { generalLimiter } = require('./middleware/rateLimiter');
const { errorHandler } = require('./middleware/errorHandler');

const crawlRoutes = require('./routes/crawl');
const searchRoutes = require('./routes/search');
const analyticsRoutes = require('./routes/analytics');
const authRoutes = require('./routes/auth');
const bookmarkRoutes = require('./routes/bookmarks');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
  console.error('FATAL: JWT_SECRET must be set and at least 16 characters.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('FATAL: DATABASE_URL is not set.');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

app.use(helmet());
app.use(compression());
app.use(generalLimiter);
function getAllowedOrigins() {
  const raw = process.env.CORS_ORIGIN || 'http://localhost:5173';
  return raw.split(',').map((o) => o.trim()).filter(Boolean);
}

const allowedOrigins = getAllowedOrigins();
const allowVercelPreviews = process.env.ALLOW_VERCEL_PREVIEWS !== 'false';

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    if (allowVercelPreviews && /^https:\/\/[\w-]+\.vercel\.app$/.test(origin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
}));
app.use(express.json({ limit: '1mb' }));

app.get('/api/health', async (req, res) => {
  try {
    await query('SELECT 1');
    const tables = await query(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public'
         AND table_name IN ('pages', 'terms', 'postings', 'users', 'email_otps')`
    );
    const found = tables.rows.map((r) => r.table_name);
    const required = ['pages', 'terms', 'postings', 'users', 'email_otps'];
    const missing = required.filter((t) => !found.includes(t));
    const ok = missing.length === 0;

    res.status(ok ? 200 : 503).json({
      success: ok,
      data: {
        status: ok ? 'ok' : 'schema_incomplete',
        database: 'connected',
        tables: found,
        ...(missing.length > 0 && { missingTables: missing, hint: 'Run npm run migrate with this DATABASE_URL' }),
      },
    });
  } catch (err) {
    res.status(503).json({ success: false, error: 'Database unavailable.', detail: err.message });
  }
});

app.use('/api/crawl', crawlRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/bookmarks', bookmarkRoutes);

app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`SearchSphere API running on port ${PORT}`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  if (allowVercelPreviews) console.log('CORS: *.vercel.app preview URLs allowed');
});

module.exports = app;
