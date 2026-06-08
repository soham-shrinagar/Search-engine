function calculateTf(termFreq, totalTerms) {
  if (totalTerms === 0) return 0;
  return termFreq / totalTerms;
}

function calculateIdf(documentFrequency, totalDocuments) {
  if (documentFrequency === 0 || totalDocuments === 0) return 0;
  return Math.log((totalDocuments + 1) / (documentFrequency + 1)) + 1;
}

function calculateTfIdf(tf, idf) {
  return tf * idf;
}

function boostTitleMatch(title, queryTerms) {
  if (!title) return 0;
  const lowerTitle = title.toLowerCase();
  let boost = 0;
  for (const term of queryTerms) {
    if (lowerTitle.includes(term.toLowerCase())) {
      boost += 2.0;
    }
  }
  return boost;
}

function boostExactMatch(content, query) {
  if (!content || !query) return 0;
  return content.toLowerCase().includes(query.toLowerCase()) ? 1.5 : 0;
}

function boostRecency(lastCrawledAt) {
  if (!lastCrawledAt) return 0;
  const daysSince = (Date.now() - new Date(lastCrawledAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysSince < 7) return 1.0;
  if (daysSince < 30) return 0.5;
  return 0;
}

function calculateFinalScore({
  tfIdfScore,
  pagerankScore = 0,
  titleBoost = 0,
  exactBoost = 0,
  recencyBoost = 0,
}) {
  return tfIdfScore + pagerankScore * 0.3 + titleBoost + exactBoost + recencyBoost;
}

module.exports = {
  calculateTf,
  calculateIdf,
  calculateTfIdf,
  boostTitleMatch,
  boostExactMatch,
  boostRecency,
  calculateFinalScore,
};
