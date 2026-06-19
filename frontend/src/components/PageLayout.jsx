export default function PageLayout({ title, subtitle, children, maxWidth = 'max-w-md' }) {
  return (
    <div className={`${maxWidth} mx-auto px-5 sm:px-6 py-12 sm:py-16`}>
      {(title || subtitle) && (
        <div className="page-header text-center">
          {title && <h1 className="page-title">{title}</h1>}
          {subtitle && <p className="page-subtitle mx-auto">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
}
