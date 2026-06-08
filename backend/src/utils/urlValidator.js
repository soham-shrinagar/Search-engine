function isValidUrl(urlString) {
  try {
    const url = new URL(urlString);
    return ['http:', 'https:'].includes(url.protocol);
  } catch {
    return false;
  }
}

function normalizeUrl(urlString) {
  const url = new URL(urlString);
  url.hash = '';

  if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
    url.pathname = url.pathname.slice(0, -1);
  }

  let normalized = url.href;
  if (normalized.endsWith('/') && url.pathname === '/') {
    normalized = normalized.slice(0, -1);
  }
  return normalized;
}

function getDomain(urlString) {
  return new URL(urlString).hostname;
}

function isSameDomain(url1, url2) {
  return getDomain(url1) === getDomain(url2);
}

function resolveUrl(base, relative) {
  try {
    return new URL(relative, base).href;
  } catch {
    return null;
  }
}

module.exports = { isValidUrl, normalizeUrl, getDomain, isSameDomain, resolveUrl };
