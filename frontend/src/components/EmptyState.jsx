import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="card-flat empty-state animate-fade-in">
      <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-surface dark:bg-surface-dark-hover border border-line/60 dark:border-line-dark flex items-center justify-center">
        <svg className="w-5 h-5 text-ink-faint" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-ink dark:text-ink-dark mb-2">
        {title}
      </p>
      <p className="text-sm text-ink-muted dark:text-ink-dark-muted leading-relaxed max-w-sm mx-auto">
        {description}
      </p>
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary text-sm mt-6 inline-flex">
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && (
        <button type="button" onClick={onAction} className="btn-primary text-sm mt-6">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
