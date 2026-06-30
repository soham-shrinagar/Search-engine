import { useState } from 'react';

function HelpSection({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="card-flat !p-0 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-3 px-4 py-3.5 sm:px-5 text-left hover:bg-surface/50 dark:hover:bg-surface-dark-hover/50 transition-colors"
        aria-expanded={open}
      >
        <span className="text-sm font-medium text-ink dark:text-ink-dark">{title}</span>
        <svg
          className={`w-4 h-4 text-ink-faint flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-sm text-ink-muted dark:text-ink-dark-muted border-t border-line/50 dark:border-line-dark animate-fade-in">
          {children}
        </div>
      )}
    </div>
  );
}

function Example({ query }) {
  return (
    <div className="mt-2 first:mt-0">
      <code className="text-xs font-mono bg-page dark:bg-page-dark border border-line/60 dark:border-line-dark px-2 py-1 rounded-md text-ink dark:text-ink-dark">
        {query}
      </code>
    </div>
  );
}

export default function SearchHelp() {
  return (
    <div className="space-y-2">
      <HelpSection title="Boolean search">
        <Example query="react AND node" />
        <Example query="react OR vue" />
        <Example query="react NOT angular" />
      </HelpSection>

      <HelpSection title="Phrase search">
        <Example query='"machine learning"' />
      </HelpSection>

      <HelpSection title="Fuzzy search">
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono mt-2">
          <span className="px-2 py-1 rounded-md border border-line/60 dark:border-line-dark">javscript</span>
          <span className="text-ink-faint">→</span>
          <span className="px-2 py-1 rounded-md bg-surface dark:bg-surface-dark-hover font-medium text-ink dark:text-ink-dark">
            javascript
          </span>
        </div>
      </HelpSection>
    </div>
  );
}
