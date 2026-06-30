export default function CrawlErrorPanel({ message }) {
  if (!message) return null;

  return (
    <div className="rounded-lg border border-red-500/30 bg-red-500/5 dark:bg-red-500/10 px-4 py-3 animate-fade-in" role="alert">
      <p className="text-sm text-ink-muted dark:text-ink-dark-muted break-words">
        {message}
      </p>
    </div>
  );
}
