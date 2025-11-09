import { ArrowLeft, Star, Share2, Clock, Play } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { prayersData } from '@/data/prayers';
import { useFavorites } from '@/hooks/usePrayers';
import { useToast } from '@/hooks/use-toast';

const PrayerDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { toast } = useToast();

  const prayer = prayersData.find((p) => p.id === id);

  if (!prayer) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-secondary text-lg mb-4">Oração não encontrada</p>
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary-bg rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 hover:bg-secondary-bg rounded-full transition-colors"
            >
              <Share2 className="w-6 h-6 text-primary" />
            </button>
            <button
              onClick={() => toggleFavorite(prayer.id)}
              className="p-2 hover:bg-secondary-bg rounded-full transition-colors"
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
            <h1 className="text-3xl font-serif font-semibold text-primary mb-3">
              {prayer.title}
            </h1>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 text-sm text-secondary bg-secondary-bg px-3 py-1 rounded-full">
                {prayer.category}
              </span>
              <span className="inline-flex items-center gap-1 text-sm text-secondary bg-secondary-bg px-3 py-1 rounded-full">
                <Clock className="w-4 h-4" />
                {prayer.duration} min
              </span>
            </div>
          </div>

          {/* Prayer Text */}
          <div className="bg-gradient-to-b from-white to-secondary-bg rounded-3xl p-8 mb-6">
            <p className="text-lg font-serif text-primary leading-loose text-center whitespace-pre-line">
              {prayer.content}
            </p>
          </div>

          {/* Tags */}
          {prayer.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center mb-6">
              {prayer.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs text-secondary bg-secondary-bg px-3 py-1 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-3">
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
