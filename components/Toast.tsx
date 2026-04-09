'use client';

import { useEffect, useState } from 'react';

export interface ToastItem {
  id: number;
  msg: string;
  icon: string;
}

// Global event emitter pattern
const listeners: Set<(item: ToastItem) => void> = new Set();

export function showToast(msg: string, icon = '✦') {
  const item: ToastItem = { id: Date.now(), msg, icon };
  listeners.forEach((fn) => fn(item));
}

export default function Toast() {
  const [items, setItems] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (item: ToastItem) => {
      setItems((prev) => [...prev, item]);
      setTimeout(() => {
        setItems((prev) => prev.filter((t) => t.id !== item.id));
      }, 3100);
    };
    listeners.add(handler);
    return () => { listeners.delete(handler); };
  }, []);

  return (
    <div className="toast-container" id="toast-container">
      {items.map((item) => (
        <div key={item.id} className="toast">
          <span>{item.icon}</span>
          <span>{item.msg}</span>
        </div>
      ))}
    </div>
  );
}
