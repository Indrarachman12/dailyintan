'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

const NAV_ITEMS = [
  { href: '/', icon: '⬡', label: 'Dashboard' },
  { href: '/history', icon: '◫', label: 'Riwayat' },
  { href: '/setlist', icon: '♬', label: 'Daftar Penampilan' },
  { href: '/stats', icon: '◈', label: 'Statistik' },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  // Close sidebar when clicking outside (mobile)
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Overlay for mobile */}
      <div
        className={`sidebar-overlay${isOpen ? ' visible' : ''}`}
        onClick={onClose}
      />

      <aside ref={sidebarRef} className={`sidebar${isOpen ? ' open' : ''}`} id="sidebar">
        <div className="sidebar-logo">
          <span className="logo-icon">✦</span>
          <span className="logo-text">DailyIntan</span>
        </div>

        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-item${pathname === item.href ? ' active' : ''}`}
              onClick={onClose}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="live-badge" id="live-badge">
            <span className="live-dot"></span>
            <span>LIVE</span>
          </div>
        </div>
      </aside>
    </>
  );
}
