import { ArrowLeft, Star, Share2, Clock, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { usePrayers, useFavorites } from '@/hooks/usePrayers';
import { useToast } from '@/hooks/use-toast';
import { useFontSize } from '@/hooks/useFontSize';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import FontSizeControl from '@/components/FontSizeControl';

const PrayerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { prayers, loading, error } = usePrayers();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();
  const { fontSize, setFontSize } = useFontSize();

  const prayer = id ? prayers.find((p) => p.id === id) : undefined;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner text="Carregando oração..." />
      </div>
    );
  }

  if (error || !prayer) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <p className="text-secondary text-lg mb-4">
            {error ? 'Não foi possível carregar a oração.' : 'Oração não encontrada.'}
          </p>
          <button
            onClick={() => navigate('/prayers')}
            className="text-primary hover:underline"
          >
            Voltar para orações
          </button>
        </div>
      </div>
    );
  }

  const getCategoryIcon = (category: string) => {
    if (category.includes('Tradicionais')) return '✝️';
    if (category.includes('Marianas')) return '🌹';
    if (category.includes('Santos')) return '⭐';
    if (category.includes('Penitência')) return '🙏';
    return '📿';
  };

  const handleShare = async () => {
    const shareData = {
      title: prayer.title,
      text: prayer.content,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(prayer.content);
      toast({
        title: 'Oração copiada!',
        description: 'O texto foi copiado para a área de transferência.',
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      {/* Header - interface sans-serif */}
      <header className="sticky top-0 z-10 bg-background dark:bg-card border-b border-border px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-muted rounded-full transition-colors shrink-0"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <div className="flex-1 flex justify-center min-w-0">
            <FontSizeControl currentSize={fontSize} onChange={setFontSize} />
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-background-secondary rounded-full transition-colors"
            >
              <Share2 className="w-6 h-6 text-primary" />
            </button>
            <button
              onClick={() => toggleFavorite(prayer.id)}
              className="p-2 hover:bg-background-secondary rounded-full transition-colors"
            >
              <Star
                className={`w-6 h-6 ${
                  isFavorite(prayer.id) ? 'fill-accent text-accent' : 'text-primary'
                }`}
              />
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24">
        <div className="px-6 py-8">
          {/* Icon and Title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-accent/20 rounded-full mb-4">
              <span className="text-4xl">{getCategoryIcon(prayer.category)}</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-semibold text-foreground mb-3">
              {prayer.title}
            </h1>
            <div className="flex items-center justify-center gap-2 flex-wrap font-sans">
              <span className="inline-flex items-center gap-1 text-sm text-secondary bg-background-secondary px-3 py-1 rounded-full">
                {prayer.category}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-secondary bg-background-secondary px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                {prayer.duration} min
              </span>
            </div>
          </div>

          {/* Prayer Text - tamanho controlado por useFontSize (var --reading-font-size) */}
          <div
            className="bg-card rounded-3xl p-8 mb-6"
            style={{
              fontSize: 'var(--reading-font-size, 18px)',
              lineHeight: 'var(--reading-line-height, 1.9)',
            }}
          >
            <p className="font-serif text-foreground text-center whitespace-pre-line leading-loose">
              {prayer.content}
            </p>
          </div>

          {/* Tags */}
          {prayer.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {prayer.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-secondary bg-background-secondary px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons - interface sans-serif */}
      <div className="fixed bottom-0 left-0 right-0 bg-background dark:bg-card border-t border-border p-4 space-y-3">
        <button
          onClick={() => navigate(`/pray/${prayer.id}`)}
          className="w-full bg-accent text-primary font-semibold py-4 rounded-xl hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
        >
          <span className="text-xl">🙏</span>
          Rezar Agora
        </button>
        <button
          onClick={() => navigate(`/pray/${prayer.id}?timer=true`)}
          className="w-full border-2 border-accent text-primary font-semibold py-4 rounded-xl hover:bg-accent/5 transition-colors flex items-center justify-center gap-2"
        >
          <Play className="w-5 h-5" />
          Iniciar Timer
        </button>
      </div>
    </div>
  );
};

export default PrayerDetail;
