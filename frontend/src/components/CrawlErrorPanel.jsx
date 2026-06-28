function getCrawlErrorHint(message) {
  if (!message) return null;
  const lower = message.toLowerCase();

  if (lower.includes('403') || lower.includes('blocked') || lower.includes('bot protection') || lower.includes('cloudflare')) {
    return 'Tip: Sites with login walls or bot protection (LeetCode, LinkedIn, etc.) usually cannot be crawled. Try Wikipedia, documentation sites, or blogs instead.';
  }
  if (lower.includes('timeout') || lower.includes('too long')) {
    return 'Tip: Large recursive crawls can time out on the free server tier. Try indexing a single page first, or reduce max pages.';
  }
  if (lower.includes('429') || lower.includes('rate-limit')) {
    return 'Tip: Wait a few minutes before trying this site again.';
  }
  if (lower.includes('robots.txt')) {
    return 'Tip: The site owner has asked crawlers not to access this URL. Try a different page on the same domain.';
  }
  if (lower.includes('internal server error')) {
    return 'Tip: The server hit an unexpected error. If this keeps happening, try a simpler URL or fewer pages.';
  }
  return null;
}

export default function CrawlErrorPanel({ message }) {
  if (!message) return null;

  const hint = getCrawlErrorHint(message);

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/5 dark:bg-red-500/10 px-4 py-3 animate-fade-in" role="alert">
      <p className="text-sm font-medium text-ink dark:text-ink-dark mb-1">
        Could not index this page
      </p>
      <p className="text-sm text-ink-muted dark:text-ink-dark-muted break-words leading-relaxed">
        {message}
      </p>
      {hint && (
        <p className="text-xs text-ink-faint dark:text-ink-dark-faint mt-3 leading-relaxed border-t border-red-500/20 pt-3">
          {hint}
        </p>
      )}
    </div>
  );
}
