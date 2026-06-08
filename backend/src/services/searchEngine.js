const { query } = require('../config/database');
const { tokenizeAndFilter } = require('../utils/tokenizer');
const { isFuzzyMatch } = require('../utils/levenshtein');
const { generateSnippet, highlightTerms } = require('./extractor');
const {
  calculateIdf,
  calculateTfIdf,
  boostTitleMatch,
  boostExactMatch,
  boostRecency,
  calculateFinalScore,
} = require('./ranking');

function parseQuery(rawQuery) {
  const trimmed = rawQuery.trim();
  if (!trimmed) return { type: 'empty', terms: [], phrases: [], raw: '' };

  const phraseMatch = trimmed.match(/"([^"]+)"/g);
  const phrases = phraseMatch ? phraseMatch.map((p) => p.slice(1, -1).toLowerCase()) : [];

  let remaining = trimmed;
  for (const p of phraseMatch || []) {
    remaining = remaining.replace(p, '');
  }

  const upperRemaining = remaining.toUpperCase();
  const hasAnd = upperRemaining.includes(' AND ');
  const hasOr = upperRemaining.includes(' OR ');
  const hasNot = upperRemaining.includes(' NOT ');

  if (hasAnd || hasOr || hasNot) {
    const parts = remaining.split(/\s+(AND|OR|NOT)\s+/i);
    const booleanTerms = [];
    const operators = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        const terms = tokenizeAndFilter(parts[i], { removeStops: false });
        booleanTerms.push(terms);
      } else {
        operators.push(parts[i].toUpperCase());
      }
    }
    return { type: 'boolean', terms: booleanTerms, operators, phrases, raw: trimmed };
  }

  const terms = tokenizeAndFilter(remaining.trim(), { removeStops: true });

  if (phrases.length > 0 && terms.length > 0) {
    return { type: 'mixed', terms, phrases, raw: trimmed };
  }

  if (phrases.length > 0) {
    return { type: 'phrase', terms: [], phrases, raw: trimmed };
  }

  return { type: 'standard', terms, phrases: [], raw: trimmed };
}

async function getTotalDocuments() {
  const result = await query(
    "SELECT COUNT(*) FROM pages WHERE crawl_status = 'indexed'"
  );
  return parseInt(result.rows[0].count, 10);
}

function termMatchesPage(term, matchedTermsSet) {
  return matchedTermsSet.has(term) ||
    [...matchedTermsSet].some((mt) => isFuzzyMatch(term, mt));
}

function pageContainsPhrase(page, phrase) {
  const haystack = `${page.title || ''} ${page.content || ''}`.toLowerCase();
  return haystack.includes(phrase);
}

async function findMatchingTerms(searchTerms, fuzzy = false) {
  const matchedTerms = new Map();

  for (const term of searchTerms) {
    const exact = await query(
      'SELECT id, term, document_frequency FROM terms WHERE term = $1',
      [term]
    );
    if (exact.rows.length > 0) {
      matchedTerms.set(exact.rows[0].term, exact.rows[0]);
      continue;
    }

    if (fuzzy && term.length >= 3) {
      const prefix = await query(
        'SELECT id, term, document_frequency FROM terms WHERE term LIKE $1 LIMIT 10',
        [`${term.slice(0, 3)}%`]
      );
      for (const row of prefix.rows) {
        if (isFuzzyMatch(term, row.term)) {
          matchedTerms.set(row.term, row);
        }
      }
    }
  }

  return matchedTerms;
}

async function searchPages(parsedQuery, { fuzzy = false } = {}) {
  const totalDocs = await getTotalDocuments();
  if (totalDocs === 0) return [];

  let searchTerms = [];
  if (parsedQuery.type === 'boolean') {
    searchTerms = parsedQuery.terms.flat();
  } else {
    searchTerms = parsedQuery.terms || [];
  }

  if (searchTerms.length === 0 && parsedQuery.phrases.length === 0) return [];

  const matchedTerms = searchTerms.length > 0
    ? await findMatchingTerms(searchTerms, fuzzy)
    : new Map();

  if (searchTerms.length > 0 && matchedTerms.size === 0 && parsedQuery.phrases.length === 0) {
    return [];
  }

  let results = [];

  if (matchedTerms.size > 0) {
    const termIds = [...matchedTerms.values()].map((t) => t.id);
    const postings = await query(
      `SELECT p.page_id, p.term_id, p.frequency, p.tf_score,
              t.term, t.document_frequency,
              pg.url, pg.title, pg.content, pg.pagerank_score, pg.last_crawled_at
       FROM postings p
       JOIN terms t ON p.term_id = t.id
       JOIN pages pg ON p.page_id = pg.id
       WHERE p.term_id = ANY($1) AND pg.crawl_status = 'indexed'`,
      [termIds]
    );

    const pageScores = new Map();

    for (const row of postings.rows) {
      if (!pageScores.has(row.page_id)) {
        pageScores.set(row.page_id, {
          pageId: row.page_id,
          url: row.url,
          title: row.title || '',
          content: row.content || '',
          pagerankScore: row.pagerank_score || 0,
          lastCrawledAt: row.last_crawled_at,
          tfIdfScore: 0,
          matchedTerms: new Set(),
        });
      }

      const page = pageScores.get(row.page_id);
      const idf = calculateIdf(row.document_frequency, totalDocs);
      const tfIdf = calculateTfIdf(row.tf_score, idf);
      page.tfIdfScore += tfIdf;
      page.matchedTerms.add(row.term);
    }

    results = [...pageScores.values()];
  }

  if (parsedQuery.type === 'boolean') {
    results = applyBooleanFilter(results, parsedQuery);
  }

  if (parsedQuery.phrases.length > 0) {
    if (results.length === 0 && searchTerms.length === 0) {
      const allPages = await query(
        `SELECT id, url, title, content, pagerank_score, last_crawled_at
         FROM pages WHERE crawl_status = 'indexed'`
      );
      results = allPages.rows.map((row) => ({
        pageId: row.id,
        url: row.url,
        title: row.title || '',
        content: row.content || '',
        pagerankScore: row.pagerank_score || 0,
        lastCrawledAt: row.last_crawled_at,
        tfIdfScore: 0,
        matchedTerms: new Set(),
      }));
    }

    results = results.filter((page) =>
      parsedQuery.phrases.every((phrase) => pageContainsPhrase(page, phrase))
    );
  }

  if (parsedQuery.type === 'mixed' && searchTerms.length > 0) {
    results = results.filter((page) =>
      searchTerms.every((t) => termMatchesPage(t, page.matchedTerms))
    );
  }

  const queryTerms = [
    ...searchTerms,
    ...parsedQuery.phrases.flatMap((p) => tokenizeAndFilter(p, { removeStops: true })),
  ];

  results = results.map((page) => {
    const titleBoost = boostTitleMatch(page.title, queryTerms);
    const exactBoost = boostExactMatch(page.content, parsedQuery.raw);
    const recencyBoost = boostRecency(page.lastCrawledAt);
    const score = calculateFinalScore({
      tfIdfScore: page.tfIdfScore,
      pagerankScore: page.pagerankScore,
      titleBoost,
      exactBoost,
      recencyBoost,
    });

    const snippet = generateSnippet(page.content, queryTerms);
    const highlightedSnippet = highlightTerms(snippet, queryTerms);
    const highlightedTitle = highlightTerms(page.title, queryTerms);

    return {
      id: page.pageId,
      url: page.url,
      title: page.title,
      highlightedTitle,
      snippet,
      highlightedSnippet,
      score: Math.round(score * 1000) / 1000,
      matchedTerms: [...page.matchedTerms],
    };
  });

  results.sort((a, b) => b.score - a.score);
  return results;
}

function applyBooleanFilter(results, parsedQuery) {
  const { terms, operators } = parsedQuery;
  if (terms.length === 0) return results;

  const matchesGroup = (page, group) =>
    group.every((t) => termMatchesPage(t, page.matchedTerms));

  let filtered = results.filter((page) => matchesGroup(page, terms[0]));

  for (let i = 0; i < operators.length; i++) {
    const op = operators[i];
    const nextTerms = terms[i + 1] || [];

    if (op === 'AND') {
      filtered = filtered.filter((page) => matchesGroup(page, nextTerms));
    } else if (op === 'OR') {
      const orPages = results.filter((page) =>
        nextTerms.some((t) => termMatchesPage(t, page.matchedTerms))
      );
      const ids = new Set(filtered.map((p) => p.pageId));
      for (const page of orPages) {
        if (!ids.has(page.pageId)) filtered.push(page);
      }
    } else if (op === 'NOT') {
      filtered = filtered.filter((page) =>
        !nextTerms.some((t) => termMatchesPage(t, page.matchedTerms))
      );
    }
  }

  return filtered;
}

async function autocomplete(prefix, limit = 10) {
  if (!prefix || prefix.length < 2) return [];

  const safeLimit = Math.min(Math.max(1, parseInt(limit, 10) || 10), 20);
  const result = await query(
    `SELECT term, document_frequency
     FROM terms
     WHERE term LIKE $1
     ORDER BY document_frequency DESC
     LIMIT $2`,
    [`${prefix.toLowerCase()}%`, safeLimit]
  );

  return result.rows.map((r) => ({
    term: r.term,
    documentFrequency: r.document_frequency,
  }));
}

async function logSearch(queryText, responseTime, resultCount, userId = null) {
  await query(
    'INSERT INTO search_logs (query, response_time, result_count, user_id) VALUES ($1, $2, $3, $4)',
    [queryText, responseTime, resultCount, userId]
  );
}

module.exports = {
  parseQuery,
  searchPages,
  autocomplete,
  logSearch,
  getTotalDocuments,
};
