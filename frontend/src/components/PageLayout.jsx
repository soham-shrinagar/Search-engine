export default function PageLayout({ title, subtitle, children, maxWidth = 'max-w-2xl' }) {
  return (
    <div className={`${maxWidth} mx-auto px-5 py-10`}>
      {(title || subtitle) && (
        <div className="page-header">
          {title && <h1 className="page-title">{title}</h1>}
          {subtitle && <p className="page-subtitle">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
