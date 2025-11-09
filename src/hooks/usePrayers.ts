import { useState, useEffect } from 'react';
import { Prayer, PrayerHistory } from '@/data/prayers';

const FAVORITES_KEY = 'fides_favorite_prayers';
const HISTORY_KEY = 'fides_prayer_history';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(FAVORITES_KEY);
    if (stored) {
      setFavorites(JSON.parse(stored));
    }
  }, []);

  const toggleFavorite = (prayerId: string) => {
    setFavorites((prev) => {
      const newFavorites = prev.includes(prayerId)
        ? prev.filter((id) => id !== prayerId)
        : [...prev, prayerId];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return newFavorites;
    });
  };

  const isFavorite = (prayerId: string) => favorites.includes(prayerId);

  return { favorites, toggleFavorite, isFavorite };
};

export const usePrayerHistory = () => {
  const [history, setHistory] = useState<PrayerHistory[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(HISTORY_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      setHistory(
        parsed.map((item: any) => ({
          ...item,
          prayedAt: new Date(item.prayedAt),
        }))
      );
    }
  }, []);

  const addToHistory = (prayer: Prayer, duration?: number) => {
    const entry: PrayerHistory = {
      prayerId: prayer.id,
      prayerTitle: prayer.title,
      prayedAt: new Date(),
      duration,
    };

    setHistory((prev) => {
      const newHistory = [entry, ...prev].slice(0, 100); // Keep last 100
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const getRecentPrayers = (limit: number = 3) => {
    return history.slice(0, limit);
  };

  const getPrayerCount = () => history.length;

  return { history, addToHistory, getRecentPrayers, getPrayerCount };
};
