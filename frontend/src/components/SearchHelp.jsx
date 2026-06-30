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

function Example({ query, note }) {
  return (
    <div className="mt-3 first:mt-0">
      <code className="text-xs font-mono bg-page dark:bg-page-dark border border-line/60 dark:border-line-dark px-2 py-1 rounded-md text-ink dark:text-ink-dark">
        {query}
      </code>
      <p className="text-xs mt-1.5 leading-relaxed">{note}</p>
    </div>
  );
}

export default function SearchHelp() {
  return (
    <div className="space-y-2">
      <p className="text-xs text-ink-faint dark:text-ink-dark-faint mb-3">
        Advanced search options — expand to learn more.
      </p>

      <HelpSection title="Boolean search">
        <p className="text-xs mb-2">Combine keywords with AND, OR, and NOT.</p>
        <Example query="react AND node" note="Pages must contain both words." />
        <Example query="react OR vue" note="Pages can contain either word." />
        <Example query="react NOT angular" note="Pages with react but not angular." />
      </HelpSection>

      <HelpSection title="Phrase search">
        <Example
          query='"machine learning"'
          note="Returns pages where this exact phrase appears, in order."
        />
      </HelpSection>

      <HelpSection title="Fuzzy search">
        <p className="text-xs leading-relaxed mb-3">
          Minor typos are corrected automatically when no exact match is found.
        </p>
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <span className="px-2 py-1 rounded-md border border-line/60 dark:border-line-dark">javscript</span>
          <span className="text-ink-faint">→</span>
          <span className="text-ink-faint">Did you mean</span>
          <span className="px-2 py-1 rounded-md bg-surface dark:bg-surface-dark-hover font-medium text-ink dark:text-ink-dark">
            javascript
          </span>
        </div>
      </HelpSection>
    </div>
  );
}
