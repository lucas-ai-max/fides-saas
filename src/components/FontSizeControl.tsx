import { Type, Minus, Plus } from 'lucide-react';
import { FontSize } from '@/types/liturgia';

interface FontSizeControlProps {
  currentSize: FontSize;
  onChange: (size: FontSize) => void;
}

const FontSizeControl = ({ currentSize, onChange }: FontSizeControlProps) => {
  const sizes: FontSize[] = ['small', 'medium', 'large', 'xlarge'];
  const currentIndex = sizes.indexOf(currentSize);

  const handleDecrease = () => {
    if (currentIndex > 0) {
      onChange(sizes[currentIndex - 1]);
    }
  };

  const handleIncrease = () => {
    if (currentIndex < sizes.length - 1) {
      onChange(sizes[currentIndex + 1]);
    }
  };

  return (
    <div className="flex items-center gap-2 bg-card border border-gray-light rounded-xl p-2 shadow-sm">
      {/* Label */}
      <div className="flex items-center gap-1.5 pl-1">
        <Type className="w-4 h-4 text-gray-text" />
        <span className="text-xs font-medium text-gray-text">Tamanho</span>
      </div>

      {/* Divider */}
      <div className="w-px h-6 bg-gray-light"></div>

      {/* Controles */}
      <div className="flex items-center gap-1">
        {/* Botão Diminuir */}
        <button
          onClick={handleDecrease}
          disabled={currentIndex === 0}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-light disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          aria-label="Diminuir fonte"
        >
          <Minus className="w-4 h-4 text-text-primary" />
        </button>

        {/* Indicador Visual */}
        <div className="flex items-center gap-0.5 px-2">
          {sizes.map((size, index) => (
            <div
              key={size}
              className={`h-1.5 rounded-full transition-all ${
                index <= currentIndex
                  ? 'bg-primary w-2'
                  : 'bg-gray-light w-1.5'
              }`}
            />
          ))}
        </div>

        {/* Botão Aumentar */}
        <button
          onClick={handleIncrease}
          disabled={currentIndex === sizes.length - 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-light disabled:opacity-40 disabled:hover:bg-transparent transition-colors"
          aria-label="Aumentar fonte"
        >
          <Plus className="w-4 h-4 text-text-primary" />
        </button>
      </div>
    </div>
  );
};

export default FontSizeControl;
