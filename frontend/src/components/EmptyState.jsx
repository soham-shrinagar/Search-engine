import { Link } from 'react-router-dom';

export default function EmptyState({ title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="card p-10 text-center">
      <p className="text-sm font-medium text-neutral-950 dark:text-neutral-50 mb-2">
        {title}
      </p>
      <p className="text-sm text-neutral-500 dark:text-neutral-400 leading-relaxed max-w-sm mx-auto">
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
