const { query } = require('../config/database');

const BYTES_PER_MB = 1024 * 1024;

function getNeonLimitMb() {
  return parseInt(process.env.NEON_STORAGE_LIMIT_MB, 10) || 512;
}

function getMaxFillPercent() {
  const pct = parseInt(process.env.SEED_MAX_FILL_PERCENT, 10) || 83;
  return Math.min(Math.max(pct, 50), 95);
}

function getCapBytes() {
  const limitMb = getNeonLimitMb();
  const fillPercent = getMaxFillPercent();
  return Math.floor(limitMb * BYTES_PER_MB * (fillPercent / 100));
}

async function getDatabaseSizeBytes() {
  const result = await query(
    'SELECT pg_database_size(current_database())::bigint AS bytes'
  );
  return BigInt(result.rows[0].bytes);
}

async function getStorageStats() {
  const bytes = await getDatabaseSizeBytes();
  const capBytes = BigInt(getCapBytes());
  const neonLimitMb = getNeonLimitMb();
  const maxFillPercent = getMaxFillPercent();
  const usedMb = Number(bytes) / BYTES_PER_MB;
  const capMb = Number(capBytes) / BYTES_PER_MB;
  const percentOfNeonLimit = (usedMb / neonLimitMb) * 100;
  const percentOfCap = capMb > 0 ? (usedMb / capMb) * 100 : 100;
  const atCap = bytes >= capBytes;
  const headroomMb = Math.max(0, capMb - usedMb);

  return {
    bytes,
    capBytes,
    usedMb,
    capMb,
    neonLimitMb,
    maxFillPercent,
    percentOfNeonLimit,
    percentOfCap,
    headroomMb,
    atCap,
  };
}

function formatStorageLine(stats) {
  return (
    `Storage: ${stats.usedMb.toFixed(1)} MB / ${stats.capMb.toFixed(1)} MB cap ` +
    `(${stats.maxFillPercent}% of ${stats.neonLimitMb} MB Neon limit, ` +
    `${stats.percentOfCap.toFixed(1)}% full, ${stats.headroomMb.toFixed(1)} MB headroom)`
  );
}

async function assertUnderCap() {
  const stats = await getStorageStats();
  if (stats.atCap) {
    const err = new Error(
      `Neon storage cap reached (${stats.usedMb.toFixed(1)} MB ≥ ${stats.capMb.toFixed(1)} MB). Stop seeding.`
    );
    err.code = 'STORAGE_CAP';
    throw err;
  }
  return stats;
}

module.exports = {
  getNeonLimitMb,
  getMaxFillPercent,
  getCapBytes,
  getStorageStats,
  formatStorageLine,
  assertUnderCap,
};
