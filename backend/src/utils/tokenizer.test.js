const { describe, it } = require('node:test');
const assert = require('node:assert');
const { tokenize, tokenizeAndFilter, calculateTermFrequencies } = require('./tokenizer');

describe('tokenizer', () => {
  it('lowercases and removes punctuation', () => {
    const tokens = tokenize('Hello, World! Search-Engine.');
    assert.deepStrictEqual(tokens, ['hello', 'world', 'search', 'engine']);
  });

  it('removes stop words when filtering', () => {
    const tokens = tokenizeAndFilter('the quick brown fox is a test');
    assert.ok(!tokens.includes('the'));
    assert.ok(!tokens.includes('is'));
    assert.ok(tokens.includes('quick'));
  });

  it('calculates term frequencies', () => {
    const freqs = calculateTermFrequencies(['search', 'engine', 'search']);
    assert.strictEqual(freqs.get('search'), 2);
    assert.strictEqual(freqs.get('engine'), 1);
  });
});
