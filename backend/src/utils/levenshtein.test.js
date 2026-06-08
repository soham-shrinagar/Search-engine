const { describe, it } = require('node:test');
const assert = require('node:assert');
const { levenshteinDistance, isFuzzyMatch } = require('./levenshtein');

describe('levenshtein', () => {
  it('returns 0 for identical strings', () => {
    assert.strictEqual(levenshteinDistance('javascript', 'javascript'), 0);
  });

  it('detects typos', () => {
    assert.strictEqual(levenshteinDistance('javscript', 'javascript'), 1);
  });

  it('matches fuzzy terms within threshold', () => {
    assert.strictEqual(isFuzzyMatch('javscript', 'javascript'), true);
    assert.strictEqual(isFuzzyMatch('python', 'javascript'), false);
  });
});
