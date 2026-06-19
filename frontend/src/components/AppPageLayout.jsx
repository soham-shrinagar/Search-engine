import Sidebar, { MobileTabNav } from '../components/Sidebar';

export default function AppPageLayout({ title, subtitle, children, headerExtra }) {
  return (
    <div className="page-shell">
      <div className="page-header">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
        {headerExtra}
      </div>

      <MobileTabNav />

      <div className="lg:flex lg:gap-10">
        <Sidebar />
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
