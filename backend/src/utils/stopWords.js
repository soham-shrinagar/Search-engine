const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'as', 'is', 'was', 'are', 'were', 'be',
  'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
  'would', 'could', 'should', 'may', 'might', 'must', 'shall', 'can',
  'this', 'that', 'these', 'those', 'it', 'its', 'they', 'them', 'their',
  'we', 'our', 'you', 'your', 'he', 'she', 'his', 'her', 'him', 'i', 'me',
  'my', 'not', 'no', 'so', 'if', 'then', 'than', 'too', 'very', 'just',
  'about', 'above', 'after', 'again', 'all', 'also', 'am', 'any', 'because',
  'before', 'between', 'both', 'each', 'few', 'how', 'into', 'more', 'most',
  'other', 'out', 'over', 'own', 'same', 'some', 'such', 'through', 'under',
  'until', 'up', 'what', 'when', 'where', 'which', 'while', 'who', 'whom',
  'why', 'here', 'there', 'once', 'only', 'own', 'now', 'new', 'get', 'got',
]);

function isStopWord(term) {
  return STOP_WORDS.has(term);
}

function removeStopWords(tokens) {
  return tokens.filter((t) => !isStopWord(t));
}

module.exports = { STOP_WORDS, isStopWord, removeStopWords };
