'use client';

import { useMemo } from 'react';
import { getSetlistCounts, isMainlyShow } from '@/lib/data';
import { useSearch } from '@/lib/SearchContext';
import { useData } from '@/lib/DataContext';

export default function SetlistPage() {
  const { searchQuery } = useSearch();
  const { history, loading } = useData();

  const data = useMemo(() => {
    let counts = getSetlistCounts(history);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      counts = counts.filter(([name]) => name.toLowerCase().includes(q));
    }
    return counts;
  }, [searchQuery, history]);

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <p>Memuat setlist...</p>
      </div>
    );
  }

  const dataSetlist: [string, number][] = [];
  const backDancerList: [string, number][] = [];
  const awayList: [string, number][] = [];
  const eventList: [string, number][] = [];

  data.forEach(item => {
    const nameLower = item[0].toLowerCase();
    if (nameLower.includes('back dancer')) {
      backDancerList.push(item);
    } else if (nameLower.includes('pajama drive') || nameLower.includes('aitakatta') || nameLower.includes('kira kira girls')) {
      dataSetlist.push(item);
    } else if (nameLower.includes('offair') || nameLower.includes('off air') || nameLower.includes('on air') || nameLower.includes('away')) {
      awayList.push(item);
    } else {
      eventList.push(item);
    }
  });

  const renderSection = (title: string, list: [string, number][], themeClass: string) => {
    if (list.length === 0) return null;
    return (
      <div className="setlist-full glass-card">
        <div className="card-header">
          <h3 className="card-title">{title}</h3>
          <span className="badge-count" id={`badge-${title.toLowerCase().replace(/\s+/g, '-')}`}>{list.length} data</span>
        </div>
        <div className="setlist-grid">
          {list.map(([name, count]) => {
            return (
              <div key={name} className={`setlist-card-item ${themeClass}`}>
                <div>
                  <p className="setlist-card-name" title={name}>{name.length > 28 ? name.slice(0, 25) + '...' : name}</p>
                </div>
                <span className="setlist-card-num">{count}</span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="page-wrapper">
      {renderSection('Data Setlist', dataSetlist, 'card-theme-show')}
      {renderSection('Back Dancer', backDancerList, 'card-theme-backdancer')}
      {renderSection('Away', awayList, 'card-theme-away')}
      {renderSection('Event', eventList, 'card-theme-event')}
    </div>
  );
}
