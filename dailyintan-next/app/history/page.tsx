'use client';

import { useState, useMemo } from 'react';
import { formatDate, HistoryEntry } from '@/lib/data';
import { useSearch } from '@/lib/SearchContext';
import { useData } from '@/lib/DataContext';

const PAGE_SIZE = 10;

type SortField = 'date' | 'name';
type FilterType = 'all' | 'show' | 'event' | 'others' | 'away';

function getPageRange(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

export default function HistoryPage() {
  const { searchQuery } = useSearch();
  const { history, loading } = useData();
  const [filter, setFilter]   = useState<FilterType>('all');
  const [page, setPage]       = useState(1);
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const filtered = useMemo(() => {
    let data = [...history];

    if (filter !== 'all') {
      data = data.filter((d) => d.category === filter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      data = data.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.venue.toLowerCase().includes(q) ||
          d.date.includes(q)
      );
    }

    data.sort((a, b) => {
      const va = sortField === 'date' ? new Date(a[sortField]).getTime() : a[sortField];
      const vb = sortField === 'date' ? new Date(b[sortField]).getTime() : b[sortField];
      if (va < vb) return sortAsc ? -1 : 1;
      if (va > vb) return sortAsc ?  1 : -1;
      return 0;
    });

    return data;
  }, [filter, searchQuery, sortField, sortAsc]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const startIdx   = (safePage - 1) * PAGE_SIZE;

  function handleFilter(type: FilterType) {
    setFilter(type);
    setPage(1);
  }

  function handleSort(field: SortField) {
    if (sortField === field) setSortAsc((a) => !a);
    else { setSortField(field); setSortAsc(false); }
  }

  function goPage(p: number) {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  }

  if (loading) {
    return (
      <div className="page-wrapper" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-muted)' }}>
        <p>Memuat riwayat...</p>
      </div>
    );
  }

  return (
    <div className="page-wrapper">
      <div className="glass-card table-card">
        <div className="card-header">
          <h3 className="card-title">Semua Riwayat Penampilan</h3>
          <div className="filter-tabs" id="filter-tabs">
            {(['all', 'show', 'event', 'away', 'others'] as FilterType[]).map((type) => (
              <button
                key={type}
                className={`filter-btn${filter === type ? ' active' : ''}`}
                onClick={() => handleFilter(type)}
              >
                {type === 'all' ? 'Semua' : type === 'show' ? 'Show' : type === 'event' ? 'Event' : type === 'away' ? 'Away' : 'Others'}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="data-table" id="history-table">
            <thead>
              <tr>
                <th>No.</th>
                <th className="sortable" onClick={() => handleSort('date')}>
                  Tanggal <span className="sort-icon">⇅</span>
                </th>
                <th>Kategori</th>
                <th className="sortable" onClick={() => handleSort('name')}>
                  Nama Event / Setlist <span className="sort-icon">⇅</span>
                </th>
                <th>Venue</th>
              </tr>
            </thead>
            <tbody id="history-tbody">
              {slice.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                    Tidak ada data ditemukan.
                  </td>
                </tr>
              ) : (
                slice.map((d, i) => (
                  <tr key={`${d.id || 'no-id'}-${i}`}>
                    <td>{startIdx + i + 1}</td>
                    <td>{formatDate(d.date)}</td>
                    <td>
                      {d.category === 'show'
                        ? <span className="badge-show">SHOW</span>
                        : d.category === 'event'
                          ? <span className="badge-event">EVENT</span>
                          : d.category === 'away'
                            ? <span className="badge-away">AWAY</span>
                            : <span className="badge-others">OTHERS</span>
                      }
                    </td>
                    <td>{d.name}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{d.venue}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="pagination" id="pagination">
          <span>
            Menampilkan{' '}
            <strong style={{ color: 'var(--text-primary)' }}>
              {startIdx + 1}–{Math.min(startIdx + PAGE_SIZE, filtered.length)}
            </strong>{' '}
            dari {filtered.length} data
          </span>
          <div className="page-btns">
            <button className="page-btn" onClick={() => goPage(safePage - 1)} disabled={safePage <= 1}>‹</button>
            {getPageRange(safePage, totalPages).map((p, i) =>
              p === '...' ? (
                <button key={`ellipsis-${i}`} className="page-btn" disabled>…</button>
              ) : (
                <button
                  key={p}
                  className={`page-btn${p === safePage ? ' active' : ''}`}
                  onClick={() => goPage(p as number)}
                >
                  {p}
                </button>
              )
            )}
            <button className="page-btn" onClick={() => goPage(safePage + 1)} disabled={safePage >= totalPages}>›</button>
          </div>
        </div>
      </div>
    </div>
  );
}
