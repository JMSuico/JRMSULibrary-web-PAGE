import { Bell, Menu, Search } from 'lucide-react';

interface AdminTopbarProps {
  pageTitle: string;
  onToggleSidebar: () => void;
}

export function AdminTopbar({ pageTitle, onToggleSidebar }: AdminTopbarProps) {
  return (
    <header className="admin-topbar" role="banner">
      <div className="admin-topbar__left">
        <button
          className="admin-topbar__toggle"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        <h1 className="admin-topbar__title">{pageTitle}</h1>
      </div>

      <div className="admin-topbar__right">
        <button
          className="admin-btn admin-btn--icon"
          aria-label="Search"
        >
          <Search size={18} />
        </button>
        <button
          className="admin-btn admin-btn--icon"
          aria-label="Notifications"
        >
          <Bell size={18} />
        </button>
        <div className="admin-topbar__avatar" aria-label="Admin user">
          A
        </div>
      </div>
    </header>
  );
}
