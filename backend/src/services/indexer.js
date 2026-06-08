const crypto = require('crypto');
const { pool, query } = require('../config/database');
const { tokenizeAndFilter, calculateTermFrequencies } = require('../utils/tokenizer');
const { calculateTf } = require('./ranking');

function hashContent(content) {
  return crypto.createHash('sha256').update(content).digest('hex');
}

async function decrementTermsForPage(client, pageId) {
  const postings = await client.query(
    'SELECT term_id FROM postings WHERE page_id = $1',
    [pageId]
  );

  for (const row of postings.rows) {
    await client.query(
      'UPDATE terms SET document_frequency = GREATEST(document_frequency - 1, 0) WHERE id = $1',
      [row.term_id]
    );
    await client.query(
      'DELETE FROM terms WHERE id = $1 AND document_frequency = 0',
      [row.term_id]
    );
  }

  await client.query('DELETE FROM postings WHERE page_id = $1', [pageId]);
}

async function indexPage(pageId, title, content) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    await decrementTermsForPage(client, pageId);

    const fullText = content || '';
    const tokens = tokenizeAndFilter(fullText);
    const termFrequencies = calculateTermFrequencies(tokens);
    const totalTerms = tokens.length;

    for (const [term, frequency] of termFrequencies) {
      const termResult = await client.query(
        `INSERT INTO terms (term, document_frequency)
         VALUES ($1, 1)
         ON CONFLICT (term) DO UPDATE SET document_frequency = terms.document_frequency + 1
         RETURNING id`,
        [term]
      );
      const termId = termResult.rows[0].id;
      const tfScore = calculateTf(frequency, totalTerms);

      await client.query(
        `INSERT INTO postings (term_id, page_id, frequency, tf_score)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (term_id, page_id) DO UPDATE
         SET frequency = $3, tf_score = $4`,
        [termId, pageId, frequency, tfScore]
      );
    }

    await client.query('COMMIT');
    return { termCount: termFrequencies.size, totalTokens: totalTerms };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function removePageFromIndex(pageId) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await decrementTermsForPage(client, pageId);
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getIndexStats() {
  const [pages, terms, postings] = await Promise.all([
    query('SELECT COUNT(*) FROM pages WHERE crawl_status = $1', ['indexed']),
    query('SELECT COUNT(*) FROM terms'),
    query('SELECT COUNT(*) FROM postings'),
  ]);

  return {
    indexedPages: parseInt(pages.rows[0].count, 10),
    totalTerms: parseInt(terms.rows[0].count, 10),
    totalPostings: parseInt(postings.rows[0].count, 10),
  };
}

module.exports = { hashContent, indexPage, removePageFromIndex, getIndexStats };
