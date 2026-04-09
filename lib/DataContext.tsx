'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { HistoryEntry, Member, Milestone } from '@/lib/data';

interface DataContextProps {
  member: Member | null;
  history: HistoryEntry[];
  milestones: Milestone[];
  loading: boolean;
  error: string | null;
}

const DataContext = createContext<DataContextProps>({
  member: null,
  history: [],
  milestones: [],
  loading: true,
  error: null,
});

export const useData = () => useContext(DataContext);

// --- HELPER UNTUK MENGUBAH TANGGAL INDONESIA KE FORMAT STANDAR ISO ---
function parseIndonesianDate(dateString: string): string {
  if (!dateString) return new Date().toISOString();

  const monthMap: Record<string, string> = {
    Januari: '01', Februari: '02', Maret: '03', April: '04',
    Mei: '05', Juni: '06', Juli: '07', Agustus: '08',
    September: '09', Oktober: '10', November: '11', Desember: '12'
  };

  const parts = dateString.split(' ');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0'); // Ubah '5' jadi '05'
    const month = monthMap[parts[1]]; // Terjemahkan bulan
    const year = parts[2];

    if (month) {
      return `${year}-${month}-${day}`; // Hasil: 2025-01-26
    }
  }
  return dateString; // Fallback jika format sudah aman
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [member, setMember] = useState<Member | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchData() {
      try {
        setLoading(true);

        const { data: historyData, error: hisError } = await supabase
          .from('datafix')
          .select('*')
          .order('tanggal', { ascending: false });

        console.log("ERROR DARI SUPABASE:", hisError);
        console.log("DATA DARI SUPABASE:", historyData);

        if (isMounted && !hisError && historyData) {

          const mappedHistory: HistoryEntry[] = historyData.map((row: any) => {
            let cat = row.Kategori ? row.Kategori.toLowerCase() : 'show';
            const eventName = (row['Nama Event'] || '').toLowerCase();

            if (eventName.includes('offair') || eventName.includes('on air')) {
              cat = 'away';
            }

            if (cat !== 'show' && cat !== 'event' && cat !== 'others' && cat !== 'away') cat = 'others';

            return {
              id: row.No, // ✅ FIX
              date: parseIndonesianDate(row.tanggal), // ini sudah benar
              category: cat as 'show' | 'event' | 'others' | 'away',
              name: row['Nama Event'] || 'Unknown', // ✅ FIX (pakai bracket)
            };
          });

          setHistory(mappedHistory);
        } else if (hisError) {
          console.warn("Could not fetch history:", hisError.message);
        }

        // ... Fetch Member dan Milestones biarkan kosong dulu atau pakai try catch seperti bawaan Anda
        // Supaya fokus ke history (DailyIntan)

      } catch (err: any) {
        if (isMounted) {
          console.error("Unknown error in DataContext fetch:", err);
          setError(err.message || "Failed to fetch data");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => { isMounted = false; };
  }, []);

  return (
    <DataContext.Provider value={{ member, history, milestones, loading, error }}>
      {children}
    </DataContext.Provider>
  );
}