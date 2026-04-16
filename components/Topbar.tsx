'use client';

import { useSearch } from '@/lib/SearchContext';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const PAGE_TITLES: Record<string, string> = {
  '/':        'Dashboard',
  '/history': 'Riwayat Penampilan',
  '/setlist': 'Daftar Penampilan',
  '/stats':   'Statistik',
};

interface TopbarProps {
  onMenuToggle: () => void;
}

export default function Topbar({ onMenuToggle }: TopbarProps) {
  const pathname = usePathname();
  const { searchQuery, setSearchQuery } = useSearch();
  const [lastUpdate, setLastUpdate] = useState('');

  useEffect(() => {
    const now = new Date();
    setLastUpdate(
      `Last update: ${now.toLocaleString('id-ID', {
        day: '2-digit', month: 'short', year: '2-digit',
        hour: '2-digit', minute: '2-digit', hour12: false,
      })} WIB`
    );
  }, []);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="menu-toggle" id="menu-toggle" onClick={onMenuToggle}>☰</button>
        <div className="page-title-area">
          <h1 className="page-heading">{PAGE_TITLES[pathname] ?? 'Dashboard'}</h1>
          <p className="last-update" id="last-update">{lastUpdate}</p>
        </div>
      </div>
      <div className="topbar-right">
        <div className="search-bar">
          <span className="search-icon">⌕</span>
          <input
            type="text"
            placeholder="Cari penampilan..."
            id="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="notif-btn" title="Notifikasi">🔔</div>
      </div>
    </header>
  );
}
