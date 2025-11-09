import { useState, useMemo } from 'react';
import { ArrowLeft, Search, Star, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { prayersData, categories, intentions } from '@/data/prayers';
import { useFavorites } from '@/hooks/usePrayers';

const Prayers = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todas');
  const { isFavorite, toggleFavorite } = useFavorites();

  const getCategoryIcon = (category: string) => {
    if (category.includes('Tradicionais')) return '✝️';
    if (category.includes('Marianas')) return '🌹';
    if (category.includes('Santos')) return '⭐';
    if (category.includes('Penitência')) return '🙏';
    return '📿';
  };

  const filteredPrayers = useMemo(() => {
    let filtered = prayersData;

    // Filter by category
    if (selectedCategory !== 'todas') {
      const categoryMap: { [key: string]: string } = {
        tradicionais: 'Tradicionais',
        marianas: 'Marianas',
        santos: 'Santos',
        penitencia: 'Penitência',
      };
      filtered = filtered.filter((p) =>
        p.category.includes(categoryMap[selectedCategory] || '')
      );
    }

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.title.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-secondary-bg rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-primary" />
          </button>
          <h1 className="text-xl font-serif font-semibold text-primary">Orações</h1>
          <div className="w-10" />
        </div>
      </header>

      {/* Search Bar */}
      <div className="px-4 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary" />
          <input
            type="text"
            placeholder="Buscar orações..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
        </div>
      </div>

      {/* Por Intenção */}
      <div className="px-4 mb-6">
        <h2 className="text-lg font-semibold text-primary mb-3">Por Intenção</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {intentions.map((intention) => (
            <button
              key={intention.id}
              className="flex-shrink-0 w-24 h-24 rounded-xl bg-gradient-to-br shadow-sm hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex flex-col items-center justify-center gap-1"
              style={{
                backgroundImage: `linear-gradient(to bottom right, ${intention.color})`,
              }}
            >
              <span className="text-3xl">{intention.icon}</span>
              <span className="text-xs font-medium text-primary">{intention.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Categorias */}
      <div className="px-4 mb-4">
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-accent text-primary'
                  : 'bg-secondary-bg text-secondary'
              }`}
            >
              <span className="mr-1.5">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Orações */}
      <div className="px-4 pb-20 space-y-3">
        {filteredPrayers.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-secondary text-lg">Nenhuma oração encontrada</p>
          </div>
        ) : (
          filteredPrayers.map((prayer) => (
            <button
              key={prayer.id}
              onClick={() => navigate(`/prayers/${prayer.id}`)}
              className="w-full bg-white border border-gray-200 rounded-2xl p-4 hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all text-left relative"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(prayer.id);
                }}
                className="absolute top-3 right-3 p-2 hover:bg-secondary-bg rounded-full transition-colors"
              >
                <Star
                  className={`w-5 h-5 ${
                    isFavorite(prayer.id)
                      ? 'fill-accent text-accent'
                      : 'text-gray-400'
                  }`}
                />
              </button>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-secondary-bg rounded-full flex items-center justify-center text-xl flex-shrink-0">
                  {getCategoryIcon(prayer.category)}
                </div>
                <div className="flex-1 min-w-0 pr-8">
                  <h3 className="font-semibold text-primary text-base mb-1">
                    {prayer.title}
                  </h3>
                  <p className="text-xs text-secondary mb-2">{prayer.category}</p>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-xs text-secondary bg-secondary-bg px-2 py-1 rounded-full">
                      <Clock className="w-3 h-3" />
                      {prayer.duration} min
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};

export default Prayers;
