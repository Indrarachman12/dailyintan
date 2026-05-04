'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSetlistCounts, getChartData, formatDate, isMainlyShow, HistoryEntry } from '@/lib/data';
import { useData } from '@/lib/DataContext';
import { showToast } from '@/components/Toast';

const PAGE_SIZE = 89; // total shows

/* ---- Counter hook ---- */
function useCounter(target: number, active = true) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      setCount(current);
      if (current >= target) clearInterval(timer);
    }, 20);
    return () => clearInterval(timer);
  }, [target, active]);
  return count;
}

export default function DashboardPage() {
  const router = useRouter();
  const { member, history, loading } = useData();

  const totalShowsCount = history.filter(d => d.category === 'show').length;
  const totalEventsCount = history.filter(d => d.category === 'event').length;

  const totalShows = useCounter(totalShowsCount);
  const totalEvents = useCounter(totalEventsCount);
  const topSetlist = getSetlistCounts(history);
  const topName = topSetlist[0]?.[0] ?? '–';

  const sortedShows = history
    .filter(d => d.category === 'show' || d.name.toLowerCase().includes('back dancer'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const lastShow = sortedShows[0];

  const lastShowTheater = history
    .filter(d => d.category === 'show' && !d.name.toLowerCase().includes('back dancer'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  const lastOther = history
    .filter(d => d.category !== 'show' || d.name.toLowerCase().includes('back dancer'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

  // Hitung jumlah show & event bulan ini
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Lebih dari 30 hari = tidak "sedang aktif"
  const isRecentlyActive = lastShow && (now.getTime() - new Date(lastShow.date).getTime()) < 30 * 24 * 60 * 60 * 1000;

  const showsThisMonth = history.filter(d => {
    const date = new Date(d.date);
    return d.category === 'show' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  const eventsThisMonth = history.filter(d => {
    const date = new Date(d.date);
    return d.category === 'event' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <p>Memuat data...</p>
      </div>
    );
  }

  // Fallback for member if not found in db
  const mem = member || { name: 'Nur Intan', avatar: '/intun.jpg' };

  return (
    <div className="page-wrapper">
      {/* PROFILE CARD */}
      <div className="profile-card glass-card">
        <div className="profile-avatar-wrap">
          <div className="avatar-ring">
            <Image
              src={mem.avatar || '/intun.jpg'}
              alt={mem.name || 'Intan'}
              width={82}
              height={82}
              className="avatar-img"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://api.dicebear.com/7.x/avataaars/svg?seed=Intan&backgroundColor=b6e3f4';
              }}
            />
          </div>
          <div className="avatar-status online"></div>
        </div>

        <div className="profile-info">
          <h2 className="profile-name">{mem.name}</h2>
          <p className="profile-sub"></p>
          <div className="profile-tags">
            <span className="tag tag-primary">Trainee</span>
            <span className="tag tag-accent">Gen 13</span>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="btn-live"
            id="btn-live-tracker"
            onClick={() => showToast('🔴 Live Tracker akan segera tersedia!')}
          >
            <span className="pulse-ring"></span>
            Live Tracker
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-grid">
        <div className="stat-card glass-card" id="stat-total">
          <div className="stat-icon-wrap icon-purple">🎭</div>
          <div className="stat-body">
            <p className="stat-label">Show Theater</p>
            <p className="stat-value">{totalShows}</p>
          </div>
          <div className={`stat-trend ${showsThisMonth > 0 ? 'up' : 'neutral'}`}>
            {showsThisMonth > 0 ? `↑ ${showsThisMonth} bulan ini` : '— Belum ada bulan ini'}
          </div>
        </div>

        <div className="stat-card glass-card" id="stat-setlist">
          <div className="stat-icon-wrap icon-cyan">♪</div>
          <div className="stat-body">
            <p className="stat-label">Top Setlist</p>
            <p className="stat-value text-sm" id="top-setlist-name">
              {topName.length > 20 ? topName.slice(0, 20) + '...' : topName}
            </p>
          </div>
          <div className="stat-trend neutral">⭐ Paling sering</div>
        </div>

        <div className="stat-card glass-card" id="stat-last">
          <div className="stat-icon-wrap icon-pink">📅</div>
          <div className="stat-body">
            <p className="stat-label">Penampilan Terakhir</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', textTransform: 'uppercase' }}>Show</span>
                <span className="stat-value" style={{ fontSize: 14 }}>{lastShowTheater ? formatDate(lastShowTheater.date) : '–'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase' }}>Other</span>
                <span className="stat-value" style={{ fontSize: 14 }}>{lastOther ? formatDate(lastOther.date) : '–'}</span>
              </div>
            </div>
          </div>
          <div className={`stat-trend ${isRecentlyActive ? 'up' : 'neutral'}`}>
            {isRecentlyActive ? '↑ Sedang aktif' : '— Belum tampil lagi'}
          </div>
        </div>

        <div className="stat-card glass-card" id="stat-events">
          <div className="stat-icon-wrap icon-gold">⚡</div>
          <div className="stat-body">
            <p className="stat-label">Total Event</p>
            <p className="stat-value">{totalEvents}</p>
          </div>
          <div className={`stat-trend ${eventsThisMonth > 0 ? 'up' : 'neutral'}`}>
            {eventsThisMonth > 0 ? `↑ ${eventsThisMonth} bulan ini` : '— Belum ada bulan ini'}
          </div>
        </div>
      </div>

      {/* CHART + QUICK SETLIST */}
      <div className="content-grid">
        <BarChartCard history={history} />
        <QuickSetlistCard onSeeAll={() => router.push('/setlist')} history={history} />
      </div>
    </div>
  );
}

/* ---- Bar Chart ---- */
function BarChartCard({ history }: { history: HistoryEntry[] }) {
  const chartData = getChartData(history);
  const maxVal = Math.max(...chartData.map((d) => d.show + d.event), 1);
  const H = 180;

  return (
    <div className="chart-card glass-card">
      <div className="card-header">
        <h3 className="card-title">Grafik Penampilan per Bulan</h3>
        <div className="chart-legend">
          <span className="legend-dot purple"></span><span>Show</span>
          <span className="legend-dot cyan" style={{ marginLeft: 12 }}></span><span>Event</span>
        </div>
      </div>
      <div className="chart-container" id="chart-container">
        {chartData.map((d) => {
          const showH = Math.round((d.show / maxVal) * H);
          const eventH = Math.round((d.event / maxVal) * H);
          return (
            <div key={d.label} className="chart-col">
              <div className="bar-wrap">
                <div className="bar show-bar" style={{ height: showH }}>
                  <div className="bar-tooltip">Show: {d.show}</div>
                </div>
                <div className="bar event-bar" style={{ height: eventH }}>
                  <div className="bar-tooltip">Event: {d.event}</div>
                </div>
              </div>
              <span className="chart-label">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ---- Quick Setlist ---- */
function QuickSetlistCard({ onSeeAll, history }: { onSeeAll: () => void, history: HistoryEntry[] }) {
  const all = getSetlistCounts(history);

  const showItems = all.filter(([name]) => isMainlyShow(name, history));
  const othersItems = all.filter(([name]) => !isMainlyShow(name, history));

  const topShows = showItems.slice(0, 4);
  const topOthers = othersItems.slice(0, 3);

  return (
    <div className="setlist-card glass-card">
      <div className="card-header">
        <h3 className="card-title">Penampilan Populer</h3>
        <button className="btn-text" onClick={onSeeAll}>Lihat semua →</button>
      </div>
      <div className="setlist-list" id="quick-setlist">
        {/* Show Theater */}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--purple)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
          🎭 Show Theater
        </div>
        {topShows.map(([name, count]) => (
          <div key={name} className="setlist-item">
            <span className="setlist-name" title={name}>{name}</span>
            <span className="setlist-count" style={{ background: 'var(--purple)', color: '#fff' }}>{count}x</span>
          </div>
        ))}

        {/* Divider */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', margin: '8px 0' }} />

        {/* Others / Back Dancer */}
        <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--cyan)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
          💃 Event / Back Dancer
        </div>
        {topOthers.map(([name, count]) => (
          <div key={name} className="setlist-item">
            <span className="setlist-name" title={name}>{name}</span>
            <span className="setlist-count" style={{ background: 'var(--cyan)', color: '#fff' }}>{count}x</span>
          </div>
        ))}
      </div>
    </div>
  );
}
