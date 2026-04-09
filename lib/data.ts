// =============================================
//  DATA – DailyIntan
//  Ganti dengan data dari database nanti
// =============================================

export interface HistoryEntry {
  id: number;
  date: string;
  category: 'show' | 'event' | 'others' | 'away';
  name: string;
}

export interface ChartEntry {
  label: string;
  show: number;
  event: number;
}

export interface Milestone {
  icon: string;
  title: string;
  val: string;
  sub: string;
}

export interface YearEntry {
  year: string;
  count: number;
}

export interface Member {
  name: string;
  team: string;
  gen: string;
  role: string;
  avatar: string;
  lastUpdate: string;
}

export const CHART_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export function getChartData(data: HistoryEntry[]): ChartEntry[] {
  const map = new Map<string, ChartEntry>();

  data.forEach((d) => {
    const date = new Date(d.date);
    const m = CHART_MONTHS[date.getMonth()];
    const y = date.getFullYear().toString().slice(-2);
    const label = `${m} ${y}`;

    if (!map.has(label)) {
      map.set(label, { label, show: 0, event: 0 });
    }

    const entry = map.get(label)!;
    if (d.category === 'show') entry.show += 1;
    else entry.event += 1;
  });

  return Array.from(map.values()).sort((a, b) => {
    const [ma, ya] = a.label.split(' ');
    const [mb, yb] = b.label.split(' ');
    if (ya !== yb) return parseInt(ya) - parseInt(yb);
    return CHART_MONTHS.indexOf(ma) - CHART_MONTHS.indexOf(mb);
  });
}

export function getYearData(data: HistoryEntry[]): YearEntry[] {
  const map = new Map<string, number>();
  data.forEach((d) => {
    const y = new Date(d.date).getFullYear().toString();
    map.set(y, (map.get(y) || 0) + 1);
  });
  return Array.from(map.entries())
    .map(([year, count]) => ({ year, count }))
    .sort((a, b) => parseInt(a.year) - parseInt(b.year));
}

// ---- HELPERS ----
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: '2-digit' });
}

export function cleanNameForGrouping(name: string): string {
  return name.replace(/\s*\(.*?\)\s*/g, '').trim();
}

export function getSetlistCounts(data: HistoryEntry[]): [string, number][] {
  const counts: Record<string, number> = {};
  data.forEach((d) => {
    const cleanName = cleanNameForGrouping(d.name);
    counts[cleanName] = (counts[cleanName] || 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

export function isMainlyShow(name: string, data: HistoryEntry[]): boolean {
  const entries = data.filter((d) => cleanNameForGrouping(d.name) === name);
  const shows = entries.filter((d) => d.category === 'show').length;
  return shows >= entries.length / 2;
}
