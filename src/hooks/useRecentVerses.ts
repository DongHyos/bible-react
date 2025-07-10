import { useState, useCallback, useEffect } from 'react';
import type { UseRecentVersesResult, RecentVerse } from '../types/bible';

const STORAGE_KEY = 'recentVerses';
const MAX_RECENT_VERSES = 10;

const getRecentVerses = (): RecentVerse[] => {
  try {
    const item = window.localStorage.getItem(STORAGE_KEY);
    return item ? JSON.parse(item) : [];
  } catch (error) {
    console.error("Error reading from localStorage", error);
    return [];
  }
};

export function useRecentVerses(): UseRecentVersesResult {
  const [recentVerses, setRecentVerses] = useState<RecentVerse[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? (JSON.parse(stored) as RecentVerse[]) : [];
    } catch {
      return [];
    }
  });

  const addRecentVerse = (verse: RecentVerse) => {
    setRecentVerses(prev => {
      // 중복 제거 (같은 구절이 있으면 삭제 후 맨 앞으로)
      const filtered = prev.filter(v => !(v.bookId === verse.bookId && v.chapter === verse.chapter && v.verse === verse.verse));
      const updated = [verse, ...filtered].slice(0, MAX_RECENT_VERSES); // 최대 10개만 유지
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      }
      return updated;
    });
  };

  return { recentVerses, addRecentVerse };
} 