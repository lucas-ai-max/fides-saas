import { useState, useEffect, useCallback } from 'react';
import { Prayer, PrayerHistory } from '@/data/prayers';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

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

/** Favoritos: Supabase user_favorites quando autenticado, senão localStorage. */
export const useFavorites = () => {
  const { isAuthenticated } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loadingFavorites, setLoadingFavorites] = useState(true);

  // Buscar favoritos: Supabase (autenticado) ou localStorage (anon)
  useEffect(() => {
    let cancelled = false;

    if (isAuthenticated) {
      setLoadingFavorites(true);
      supabase
        .from('user_favorites')
        .select('prayer_id')
        .then(({ data, error }) => {
          if (cancelled) return;
          if (error) {
            setFavorites([]);
            setLoadingFavorites(false);
            return;
          }
          setFavorites((data ?? []).map((r) => r.prayer_id));
          setLoadingFavorites(false);
        });
    } else {
      const stored = localStorage.getItem(FAVORITES_KEY);
      setFavorites(stored ? JSON.parse(stored) : []);
      setLoadingFavorites(false);
    }

    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const toggleFavorite = useCallback(
    async (prayerId: string) => {
      if (isAuthenticated) {
        const isFav = favorites.includes(prayerId);
        if (isFav) {
          await supabase.from('user_favorites').delete().eq('prayer_id', prayerId);
          setFavorites((prev) => prev.filter((id) => id !== prayerId));
        } else {
          await supabase.from('user_favorites').insert({ prayer_id: prayerId });
          setFavorites((prev) => [...prev, prayerId]);
        }
      } else {
        setFavorites((prev) => {
          const newFavorites = prev.includes(prayerId)
            ? prev.filter((id) => id !== prayerId)
            : [...prev, prayerId];
          localStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
          return newFavorites;
        });
      }
    },
    [isAuthenticated, favorites]
  );

  const isFavorite = useCallback(
    (prayerId: string) => favorites.includes(prayerId),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite, loadingFavorites };
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
