'use client';

import { getYearData, getSetlistCounts } from '@/lib/data';
import { useData } from '@/lib/DataContext';

export default function StatsPage() {
  const { history, loading } = useData();

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <p>Memuat statistik...</p>
      </div>
    );
  }

  // 1. Distribusi Kategori
  const shows = history.filter((d) => d.category === 'show').length;
  const events = history.filter((d) => d.category === 'event').length;
  const others = history.filter((d) => d.category === 'others').length;
  const away = history.filter((d) => d.category === 'away').length;
  const total = shows + events + others + away;

  const showPct = total === 0 ? 0 : Math.round((shows / total) * 100);
  const otherPct = total === 0 ? 0 : Math.round((others / total) * 100);
  const awayPct = total === 0 ? 0 : Math.round((away / total) * 100);
  // Pastikan sisa eventPct pas sampai 100
  const eventPct = total === 0 ? 0 : Math.max(0, 100 - showPct - otherPct - awayPct);

  // Perhitungan koordinat SVG Donut
  const r = 54, cx = 64, cy = 64, circ = 2 * Math.PI * r;
  const showDash = (shows / total) * circ;
  const otherDash = (others / total) * circ;
  const awayDash = (away / total) * circ;
  const eventDash = (events / total) * circ;

  const showOff = circ * 0.25;
  const otherOff = showOff - showDash;
  const awayOff = otherOff - otherDash;
  const eventOff = awayOff - awayDash;

  // 2. Tahun
  const yearData = getYearData(history);
  const maxYear = yearData.length > 0 ? Math.max(...yearData.map((d) => d.count)) : 1;
  const gradients = [
    'linear-gradient(90deg,#f43f5e,#fb7185)',
    'linear-gradient(90deg,#7c3aed,#a78bfa)',
    'linear-gradient(90deg,#0ea5e9,#7dd3fc)',
  ];

  // 3. Top 5 Aktivitas
  const setlistCounts = getSetlistCounts(history);
  const top5 = setlistCounts.slice(0, 5);
  const maxTopCount = top5.length > 0 ? top5[0][1] : 1;

  // 4. Aktivitas Hari dalam Seminggu
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const dayCounts = [0, 0, 0, 0, 0, 0, 0];
  history.forEach(d => {
    // getDay() mengembalikan 0 untuk Minggu, 1 untuk Senin, dst.
    const dayIndex = new Date(d.date).getDay();
    if (!isNaN(dayIndex)) {
      dayCounts[dayIndex]++;
    }
  });
  const maxDayCount = Math.max(...dayCounts) || 1;

  return (
    <div className="page-wrapper">
      <div className="stats-detail-grid">

        {/* Donut Chart - Distribusi Kategori */}
        <div className="glass-card stat-detail-card">
          <h3 className="card-title">Distribusi Kategori</h3>
          <div className="donut-chart-wrap" style={{ display: 'flex', gap: '32px' }}>
            <svg className="donut-svg" width="128" height="128" viewBox="0 0 128 128">
              <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(124,58,237,0.08)" strokeWidth="14" />
              {shows > 0 && <circle
                cx={cx} cy={cy} r={r} fill="none" stroke="#7c3aed" strokeWidth="14"
                strokeDasharray={`${showDash} ${circ}`} strokeDashoffset={showOff} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
              />}
              {others > 0 && <circle
                cx={cx} cy={cy} r={r} fill="none" stroke="#f43f5e" strokeWidth="14"
                strokeDasharray={`${otherDash} ${circ}`} strokeDashoffset={otherOff} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
              />}
              {away > 0 && <circle
                cx={cx} cy={cy} r={r} fill="none" stroke="#f59e0b" strokeWidth="14"
                strokeDasharray={`${awayDash} ${circ}`} strokeDashoffset={awayOff} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
              />}
              {events > 0 && <circle
                cx={cx} cy={cy} r={r} fill="none" stroke="#0ea5e9" strokeWidth="14"
                strokeDasharray={`${eventDash} ${circ}`} strokeDashoffset={eventOff} strokeLinecap="round"
                transform={`rotate(-90 ${cx} ${cy})`}
              />}
              <text x={cx} y={cy} textAnchor="middle" dy="0.35em" fill="#1e1b4b"
                fontFamily="JetBrains Mono,monospace" fontSize="18" fontWeight="700">{total}</text>
              <text x={cx} y={cy + 16} textAnchor="middle" fill="#9497be"
                fontFamily="Outfit,sans-serif" fontSize="9">TOTAL</text>
            </svg>
            <div className="donut-legend" style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="donut-legend-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="donut-dot" style={{ background: '#7c3aed' }}></span><span className="donut-label" style={{ fontSize: '11px' }}>Show</span>
                </div>
                <span className="donut-pct" style={{ marginLeft: 0, paddingLeft: 0, fontSize: '14px' }}>{showPct}%</span>
              </div>
              <div className="donut-legend-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="donut-dot" style={{ background: '#0ea5e9' }}></span><span className="donut-label" style={{ fontSize: '11px' }}>Event</span>
                </div>
                <span className="donut-pct" style={{ marginLeft: 0, paddingLeft: 0, fontSize: '14px' }}>{eventPct}%</span>
              </div>
              <div className="donut-legend-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="donut-dot" style={{ background: '#f59e0b' }}></span><span className="donut-label" style={{ fontSize: '11px' }}>Away</span>
                </div>
                <span className="donut-pct" style={{ marginLeft: 0, paddingLeft: 0, fontSize: '14px' }}>{awayPct}%</span>
              </div>
              <div className="donut-legend-item" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '2px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span className="donut-dot" style={{ background: '#f43f5e' }}></span><span className="donut-label" style={{ fontSize: '11px' }}>Others</span>
                </div>
                <span className="donut-pct" style={{ marginLeft: 0, paddingLeft: 0, fontSize: '14px' }}>{otherPct}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Year Bars */}
        <div className="glass-card stat-detail-card">
          <h3 className="card-title">Penampilan per Tahun</h3>
          <div className="year-bars" id="year-bars">
            {yearData.map((d, i) => {
              const pct = Math.round((d.count / maxYear) * 100);
              return (
                <div key={d.year} className="year-bar-row">
                  <span className="year-label">{d.year}</span>
                  <div className="year-bar-track">
                    <div
                      className="year-bar-fill"
                      style={{ width: `${pct}%`, background: gradients[i % gradients.length] }}
                    />
                  </div>
                  <span className="year-val">{d.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 Aktivitas */}
        <div className="glass-card stat-detail-card">
          <h3 className="card-title">Top 5 Penampilan</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '16px' }}>
            {top5.map(([name, count], index) => {
              const pct = Math.round((count / maxTopCount) * 100);
              return (
                <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '20px', fontSize: '12px', fontWeight: '700', color: 'var(--text-muted)' }}>#{index + 1}</div>
                  <div style={{ flex: 1, overflow: 'hidden' }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', color: 'var(--text-primary)', marginBottom: '4px' }} title={name}>
                      {name}
                    </div>
                    <div style={{ height: '6px', background: 'rgba(124,58,237,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct}%`, height: '100%', background: 'linear-gradient(90deg, var(--rose), var(--violet))', borderRadius: '3px', transition: 'width 1s ease' }} />
                    </div>
                  </div>
                  <div style={{ fontWeight: '800', fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--violet-dark)' }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Penampilan per Hari */}
        <div className="glass-card stat-detail-card">
          <h3 className="card-title" style={{ marginBottom: '24px' }}>Penampilan per Hari</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '130px', padding: '0 8px' }}>
            {dayCounts.map((count, i) => {
              const pct = Math.round((count / maxDayCount) * 100);
              return (
                <div key={dayNames[i]} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>{count > 0 ? count : ''}</span>
                  <div style={{ width: '18px', height: '90px', background: 'rgba(124,58,237,0.05)', borderRadius: '6px 6px 4px 4px', position: 'relative', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: `${pct}%`, background: 'linear-gradient(0deg, var(--sky-light), var(--sky))', borderRadius: '6px 6px 4px 4px', transition: 'height 1s ease' }} />
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: '600', color: 'var(--text-secondary)' }}>{dayNames[i]}</span>
                </div>
              )
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
