const { removeStopWords } = require('./stopWords');

const MAX_TERM_LENGTH = 255;

function tokenize(text) {
  if (!text || typeof text !== 'string') return [];

  return text
    .toLowerCase()
    .replace(/['-]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && t.length <= MAX_TERM_LENGTH);
}

function tokenizeAndFilter(text, { removeStops = true } = {}) {
  const tokens = tokenize(text);
  return removeStops ? removeStopWords(tokens) : tokens;
}

function calculateTermFrequencies(tokens) {
  const frequencies = new Map();
  for (const token of tokens) {
    frequencies.set(token, (frequencies.get(token) || 0) + 1);
  }
  return frequencies;
}

module.exports = { tokenize, tokenizeAndFilter, calculateTermFrequencies, MAX_TERM_LENGTH };
