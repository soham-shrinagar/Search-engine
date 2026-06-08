const cheerio = require('cheerio');

function extractContent(html) {
  const $ = cheerio.load(html);

  $('script, style, noscript, meta, link, comment').remove();

  const title = $('title').first().text().trim() || '';

  const headings = [];
  $('h1, h2, h3, h4, h5, h6').each((_, el) => {
    const text = $(el).text().trim();
    if (text) headings.push(text);
  });

  const paragraphs = [];
  $('p').each((_, el) => {
    const text = $(el).text().trim();
    if (text) paragraphs.push(text);
  });

  const content = [
    title,
    ...headings,
    ...paragraphs,
  ].join('\n');

  return { title, headings, paragraphs, content };
}

function generateSnippet(content, queryTerms, maxLength = 200) {
  if (!content) return '';

  const lowerContent = content.toLowerCase();
  let bestStart = 0;

  for (const term of queryTerms) {
    const idx = lowerContent.indexOf(term.toLowerCase());
    if (idx !== -1) {
      bestStart = Math.max(0, idx - 50);
      break;
    }
  }

  let snippet = content.slice(bestStart, bestStart + maxLength).trim();
  if (bestStart > 0) snippet = '...' + snippet;
  if (bestStart + maxLength < content.length) snippet += '...';

  return snippet;
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlightTerms(text, terms) {
  if (!text || !terms.length) return escapeHtml(text || '');

  let result = escapeHtml(text);
  for (const term of terms) {
    if (!term) continue;
    const regex = new RegExp(`(${escapeRegex(term)})`, 'gi');
    result = result.replace(regex, '<mark>$1</mark>');
  }
  return result;
}

module.exports = { extractContent, generateSnippet, highlightTerms, escapeHtml };
