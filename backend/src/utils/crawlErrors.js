function friendlyCrawlMessage(err) {
  const msg = err.message || '';

  if (err.name === 'AbortError' || /aborted|timeout/i.test(msg)) {
    return {
      status: 408,
      message:
        'This page took too long to respond. The site may be slow or blocking crawlers. Try again with fewer pages or a simpler URL.',
      expose: true,
    };
  }

  const httpMatch = msg.match(/HTTP (\d+)/);
  if (httpMatch) {
    const code = parseInt(httpMatch[1], 10);
    if (code === 403) {
      return {
        status: 403,
        message:
          'This website blocked the crawler (HTTP 403). Sites like LeetCode use bot protection (Cloudflare) and usually cannot be indexed.',
        expose: true,
      };
    }
    if (code === 404) {
      return {
        status: 404,
        message: 'Page not found (HTTP 404). Check that the URL is correct and publicly accessible.',
        expose: true,
      };
    }
    if (code === 429) {
      return {
        status: 429,
        message: 'Too many requests (HTTP 429). This site is rate-limiting the crawler — wait a few minutes and try again.',
        expose: true,
      };
    }
    if (code >= 500) {
      return {
        status: 502,
        message: `The website returned a server error (HTTP ${code}). It may be temporarily down — try again later.`,
        expose: true,
      };
    }
    return {
      status: code,
      message: `Could not fetch this page (HTTP ${code}).`,
      expose: true,
    };
  }

  if (/Unsupported content type/i.test(msg)) {
    return {
      status: 415,
      message: 'This URL is not an HTML page (PDF, image, etc.). Only web pages with readable text can be indexed.',
      expose: true,
    };
  }

  if (/robots\.txt/i.test(msg)) {
    return {
      status: 403,
      message: 'Crawling is disallowed by this site\'s robots.txt.',
      expose: true,
    };
  }

  if (/fetch failed|ECONNREFUSED|ENOTFOUND|getaddrinfo/i.test(msg)) {
    return {
      status: 502,
      message: 'Could not reach this website. Check the URL or try again later.',
      expose: true,
    };
  }

  return null;
}

function applyCrawlError(err) {
  const mapped = friendlyCrawlMessage(err);
  if (mapped) {
    err.status = mapped.status;
    err.message = mapped.message;
    err.expose = mapped.expose;
  } else if (!err.status) {
    err.status = 500;
  }
  return err;
}

module.exports = { friendlyCrawlMessage, applyCrawlError };
