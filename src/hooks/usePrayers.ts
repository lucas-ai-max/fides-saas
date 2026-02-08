import { useState, useEffect } from 'react';
import { Prayer, PrayerHistory } from '@/data/prayers';
import { supabase } from '@/integrations/supabase/client';

const FAVORITES_KEY = 'fides_favorite_prayers';
const HISTORY_KEY = 'fides_prayer_history';

type PrayerRow = {
  id: string;
  title: string;
  category: string;
  content: string;
  duration: number;
  tags: string[] | null;
};

function rowToPrayer(row: PrayerRow, isFavorite?: boolean): Prayer {
  return {
    id: row.id,
    title: row.title,
    category: row.category,
    content: row.content,
    duration: row.duration,
    tags: row.tags ?? [],
    isFavorite,
  };
}

/** Busca orações da tabela prayers do Supabase. Mantém busca e categorias no cliente. */
export const usePrayers = () => {
  const [prayers, setPrayers] = useState<Prayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchPrayers() {
      setLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from('prayers')
        .select('id, title, category, content, duration, tags')
        .order('title');

      if (cancelled) return;
      if (err) {
        setError(err as Error);
        setPrayers([]);
        setLoading(false);
        return;
      }
      setPrayers((data ?? []).map((row) => rowToPrayer(row as PrayerRow)));
      setLoading(false);
    }

    fetchPrayers();
    return () => { cancelled = true; };
  }, []);

  return { prayers, loading, error };
};

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
