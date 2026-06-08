const { query } = require('../config/database');

async function addBookmark(userId, pageId) {
  const page = await query('SELECT id FROM pages WHERE id = $1', [pageId]);
  if (page.rows.length === 0) {
    const err = new Error('Page not found.');
    err.status = 404;
    throw err;
  }

  const existing = await query(
    'SELECT id FROM bookmarked_pages WHERE user_id = $1 AND page_id = $2',
    [userId, pageId]
  );

  if (existing.rows.length > 0) {
    return { id: existing.rows[0].id, pageId, alreadyExists: true };
  }

  const result = await query(
    `INSERT INTO bookmarked_pages (user_id, page_id)
     VALUES ($1, $2)
     RETURNING id, page_id, created_at`,
    [userId, pageId]
  );

  const row = result.rows[0];
  return { id: row.id, pageId: row.page_id, createdAt: row.created_at };
}

async function removeBookmark(userId, pageId) {
  const result = await query(
    'DELETE FROM bookmarked_pages WHERE user_id = $1 AND page_id = $2',
    [userId, pageId]
  );

  if (result.rowCount === 0) {
    const err = new Error('Bookmark not found.');
    err.status = 404;
    throw err;
  }
}

async function getBookmarks(userId) {
  const result = await query(
    `SELECT b.id, b.created_at, p.id AS page_id, p.url, p.title
     FROM bookmarked_pages b
     JOIN pages p ON b.page_id = p.id
     WHERE b.user_id = $1
     ORDER BY b.created_at DESC`,
    [userId]
  );
  return result.rows;
}

async function getBookmarkedPageIds(userId) {
  const result = await query(
    'SELECT page_id FROM bookmarked_pages WHERE user_id = $1',
    [userId]
  );
  return result.rows.map((r) => r.page_id);
}

module.exports = { addBookmark, removeBookmark, getBookmarks, getBookmarkedPageIds };
