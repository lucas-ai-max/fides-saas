import { useState, useEffect } from 'react';
import { ExameStorage } from '@/data/exameConsciencia';

const STORAGE_KEY = 'fides_exame_meta';

export const useExame = () => {
  const [storage, setStorage] = useState<ExameStorage>({
    lastExamDate: null,
    lastConfessionDate: null,
    examsCompleted: 0,
  });

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setStorage(JSON.parse(stored));
    }
  }, []);

  const completeExam = () => {
    const newStorage: ExameStorage = {
      lastExamDate: new Date().toISOString(),
      lastConfessionDate: storage.lastConfessionDate,
      examsCompleted: storage.examsCompleted + 1,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStorage));
    setStorage(newStorage);
  };

  const updateConfessionDate = (date: string) => {
    const newStorage: ExameStorage = {
      ...storage,
      lastConfessionDate: date,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newStorage));
    setStorage(newStorage);
  };

  const getDaysSinceLastExam = (): number | null => {
    if (!storage.lastExamDate) return null;
    const lastDate = new Date(storage.lastExamDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - lastDate.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return {
    storage,
    completeExam,
    updateConfessionDate,
    getDaysSinceLastExam,
  };
};
