import { useState, useEffect } from 'react';
import { X, Pause, Play, Check } from 'lucide-react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { usePrayers, usePrayerHistory } from '@/hooks/usePrayers';
import { useToast } from '@/hooks/use-toast';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const PrayNow = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const useTimer = searchParams.get('timer') === 'true';
  const { prayers, loading, error } = usePrayers();
  const { addToHistory } = usePrayerHistory();
  const { toast } = useToast();

  const prayer = id ? prayers.find((p) => p.id === id) : undefined;

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(useTimer);
  const [fontSize, setFontSize] = useState(20);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (prayer) setTimeRemaining(prayer.duration * 60);
  }, [prayer]);

  useEffect(() => {
    if (!useTimer || !isRunning) return;

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          // Vibrate on completion (if supported)
          if (navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [useTimer, isRunning]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center text-white">
        <LoadingSpinner text="Carregando oração..." />
      </div>
    );
  }

  if (error || !prayer) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 flex items-center justify-center text-white">
        <div className="text-center px-4">
          <p className="text-lg mb-4">
            {error ? 'Não foi possível carregar a oração.' : 'Oração não encontrada.'}
          </p>
          <button
            onClick={() => navigate('/prayers')}
            className="text-accent hover:underline"
          >
            Voltar para orações
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleComplete = () => {
    const duration = Math.floor((Date.now() - startTime) / 1000 / 60);
    addToHistory(prayer, duration);

    toast({
      title: '🙏 Oração concluída!',
      description: 'Que Deus abençoe sua jornada espiritual.',
    });

    navigate('/prayers');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary via-primary to-primary/90 text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
          <span className="text-sm font-medium">Sair</span>
        </button>

        {useTimer && (
          <div className="text-2xl font-semibold font-mono">
            {formatTime(timeRemaining)}
          </div>
        )}

        <div className="w-20" />
      </div>

      {/* Prayer Content */}
      <div className="flex-1 flex items-center justify-center px-8 py-12 overflow-y-auto">
        <div className="max-w-2xl w-full animate-fade-in">
          <h2 className="text-2xl font-serif font-semibold text-center mb-8 text-accent">
            {prayer.title}
          </h2>
          <p
            className="font-serif leading-loose text-center whitespace-pre-line text-white/95"
            style={{ fontSize: `${fontSize}px` }}
          >
            {prayer.content}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-black/20 backdrop-blur-sm border-t border-white/10 p-6">
        <div className="max-w-md mx-auto space-y-4">
          {/* Font Size Control */}
          <div className="flex items-center justify-center gap-4 mb-4">
            <button
              onClick={() => setFontSize((prev) => Math.max(14, prev - 2))}
              className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              A-
            </button>
            <span className="text-sm text-white/60">Tamanho do texto</span>
            <button
              onClick={() => setFontSize((prev) => Math.min(28, prev + 2))}
              className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
            >
              A+
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            {useTimer && (
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="flex-1 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors flex items-center justify-center gap-2 font-medium"
              >
                {isRunning ? (
                  <>
                    <Pause className="w-5 h-5" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5" />
                    Continuar
                  </>
                )}
              </button>
            )}

            <button
              onClick={handleComplete}
              className="flex-1 py-3 bg-success rounded-xl hover:bg-success/90 transition-colors flex items-center justify-center gap-2 font-medium"
            >
              <Check className="w-5 h-5" />
              Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrayNow;
