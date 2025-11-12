import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Star, Heart, Clock, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { prayersData } from '@/data/prayers';
import { useFavorites } from '@/hooks/usePrayers';
import { BottomNav } from '@/components/BottomNav';

const Prayers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todas' | 'manha' | 'tarde' | 'noite' | 'favoritas'>('todas');
  const { isFavorite, toggleFavorite } = useFavorites();

  const timeFilters = [
    { id: 'todas', name: 'Todas', icon: '📿', gradient: 'from-primary/10 to-primary/5' },
    { id: 'manha', name: 'Manhã', icon: '🌅', gradient: 'from-amber-500/20 to-orange-500/10' },
    { id: 'tarde', name: 'Tarde', icon: '☀️', gradient: 'from-sky-500/20 to-blue-500/10' },
    { id: 'noite', name: 'Noite', icon: '🌙', gradient: 'from-indigo-500/20 to-purple-500/10' },
    { id: 'favoritas', name: 'Favoritas', icon: '❤️', gradient: 'from-rose-500/20 to-pink-500/10' },
  ];

  const getCategoryIcon = (category: string) => {
    if (category.includes('Tradicionais')) return '✝️';
    if (category.includes('Marianas')) return '🌹';
    if (category.includes('Santos')) return '⭐';
    if (category.includes('Penitência')) return '🙏';
    return '📿';
  };

  const getPreviewText = (content: string, maxLength: number = 120) => {
    const text = content.replace(/\n/g, ' ').trim();
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const filteredPrayers = useMemo(() => {
    let filtered = prayersData;

    // Filter by time of day
    if (selectedFilter === 'manha') {
      filtered = filtered.filter(p => 
        p.tags.includes('diária') || 
        p.tags.includes('louvor') || 
        p.tags.includes('essencial')
      );
    } else if (selectedFilter === 'tarde') {
      filtered = filtered.filter(p => 
        p.tags.includes('intercessão') || 
        p.tags.includes('trabalho') || 
        p.tags.includes('paz')
      );
    } else if (selectedFilter === 'noite') {
      filtered = filtered.filter(p => 
        p.tags.includes('proteção') || 
        p.tags.includes('anjos') || 
        p.tags.includes('penitência') ||
        p.tags.includes('confissão')
      );
    } else if (selectedFilter === 'favoritas') {
      filtered = filtered.filter(p => isFavorite(p.id));
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.content.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedFilter, isFavorite]);

  return (
    <div className="min-h-screen bg-background-secondary pb-28">
      {/* Header with Gradient */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-primary to-primary-600 shadow-lg">
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-accent-light" />
            <h1 className="text-xl font-heading font-bold text-white">Orações</h1>
          </div>
          <div className="w-10" />
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar pelo título, categoria ou conteúdo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white rounded-2xl border-2 border-transparent focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all text-foreground placeholder:text-muted-foreground shadow-md"
            />
          </div>
        </div>
      </header>

      {/* Time Filters - Horizontal Scroll */}
      <div className="px-4 py-4 bg-card border-b border-border">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {timeFilters.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter.id as any)}
              className={`flex-shrink-0 px-5 py-3 rounded-2xl text-sm font-semibold transition-all ${
                selectedFilter === filter.id
                  ? `bg-gradient-to-r ${filter.gradient} border-2 border-primary shadow-md scale-105`
                  : 'bg-muted border-2 border-transparent hover:border-border'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">{filter.icon}</span>
                <span className={selectedFilter === filter.id ? 'text-primary' : 'text-muted-foreground'}>
                  {filter.name}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Counter */}
      {filteredPrayers.length > 0 && (
        <div className="px-4 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-primary">{filteredPrayers.length}</span>{' '}
            {filteredPrayers.length === 1 ? 'oração encontrada' : 'orações encontradas'}
          </p>
        </div>
      )}

      {/* Lista de Orações */}
      <div className="px-4 space-y-4">
        {filteredPrayers.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="w-32 h-32 mb-6 rounded-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
              <span className="text-6xl">🙏</span>
            </div>
            <h3 className="text-xl font-heading font-bold text-foreground mb-2 text-center">
              Nenhuma oração encontrada
            </h3>
            <p className="text-muted-foreground text-center mb-6 max-w-sm">
              {searchQuery 
                ? 'Tente buscar por outro termo ou limpe a busca'
                : selectedFilter === 'favoritas'
                ? 'Você ainda não tem orações favoritas. Toque no coração das orações para salvá-las aqui!'
                : 'Experimente alterar o filtro para ver mais orações'}
            </p>
            <div className="flex gap-3">
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition-colors"
                >
                  Limpar Busca
                </button>
              )}
              {selectedFilter !== 'todas' && (
                <button
                  onClick={() => setSelectedFilter('todas')}
                  className="px-5 py-2.5 bg-accent text-primary rounded-xl font-medium hover:bg-accent/90 transition-colors"
                >
                  Ver Todas
                </button>
              )}
            </div>
          </div>
        ) : (
          // Prayer Cards
          filteredPrayers.map((prayer) => (
            <div
              key={prayer.id}
              className="bg-card rounded-2xl border border-border shadow-sm hover:shadow-lg transition-all overflow-hidden group"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-110 transition-transform">
                      {getCategoryIcon(prayer.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-heading font-bold text-lg text-foreground mb-1 line-clamp-1">
                        {prayer.title}
                      </h3>
                      <p className="text-xs text-muted-foreground font-medium">
                        {prayer.category}
                      </p>
                    </div>
                  </div>
                  
                  {/* Favorite Button with Animation */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(prayer.id);
                    }}
                    className="flex-shrink-0 p-2 rounded-full hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors group/fav"
                    aria-label={isFavorite(prayer.id) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
                  >
                    <Heart
                      className={`w-6 h-6 transition-all ${
                        isFavorite(prayer.id)
                          ? 'fill-rose-500 text-rose-500 scale-110'
                          : 'text-muted-foreground group-hover/fav:text-rose-500 group-hover/fav:scale-110'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Card Body with Preview */}
              <button
                onClick={() => navigate(`/prayers/${prayer.id}`)}
                className="w-full text-left p-5 hover:bg-accent/5 transition-colors"
              >
                <p className="text-sm text-foreground/80 leading-relaxed mb-4 line-clamp-3">
                  {getPreviewText(prayer.content, 150)}
                </p>

                {/* Tags and Duration */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                    <Clock className="w-3.5 h-3.5" />
                    {prayer.duration} {prayer.duration === 1 ? 'minuto' : 'minutos'}
                  </span>
                  {prayer.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Read More */}
                <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                  <span>Ler oração completa</span>
                  <span className="text-lg">→</span>
                </div>
              </button>
            </div>
          ))
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Prayers;
