'use client';

import { useState, useCallback } from 'react';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Sidebar from '@/components/Sidebar';
import Topbar from '@/components/Topbar';
import Toast from '@/components/Toast';
import { SearchProvider } from '@/lib/SearchContext';
import { DataProvider } from '@/lib/DataContext';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500'],
});

function LayoutInner({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = useCallback(() => setSidebarOpen((v) => !v), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <>
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <main className="main-content">
        <Topbar onMenuToggle={toggleSidebar} />
        {children}
      </main>
      <Toast />
    </>
  );
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" className={`${outfit.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta charSet="UTF-8" />
        <title>DailyIntan – Show Tracker &amp; Analytics</title>
        <meta name="description" content="Tracker penampilan dan analytics untuk Intan – idol tracker dashboard modern." />
      </head>
      <body>
        <DataProvider>
          <SearchProvider>
            <LayoutInner>{children}</LayoutInner>
          </SearchProvider>
        </DataProvider>
      </body>
    </html>
  );
}
