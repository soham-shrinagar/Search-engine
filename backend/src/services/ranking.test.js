const { describe, it } = require('node:test');
const assert = require('node:assert');
const {
  calculateTf,
  calculateIdf,
  calculateTfIdf,
  calculateFinalScore,
} = require('./ranking');

describe('ranking', () => {
  it('calculates TF correctly', () => {
    assert.strictEqual(calculateTf(3, 10), 0.3);
  });

  it('calculates IDF correctly', () => {
    const idf = calculateIdf(5, 100);
    assert.ok(idf > 0);
  });

  it('combines TF-IDF', () => {
    const score = calculateTfIdf(0.5, 2.0);
    assert.strictEqual(score, 1.0);
  });

  it('calculates final score with boosts', () => {
    const score = calculateFinalScore({
      tfIdfScore: 5,
      pagerankScore: 1,
      titleBoost: 2,
      exactBoost: 1.5,
      recencyBoost: 0.5,
    });
    assert.ok(score > 5);
  });
});
