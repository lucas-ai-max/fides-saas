import { useState, useEffect } from 'react';
import { FontSize, fontSizeConfig } from '@/types/liturgia';

export const useFontSize = () => {
  const [fontSize, setFontSize] = useState<FontSize>(() => {
    const saved = localStorage.getItem('fides_font_size');
    return (saved as FontSize) || 'medium';
  });

  useEffect(() => {
    localStorage.setItem('fides_font_size', fontSize);
    
    // Aplicar globalmente
    const config = fontSizeConfig[fontSize];
    document.documentElement.style.setProperty('--reading-font-size', config.body);
    document.documentElement.style.setProperty('--reading-line-height', config.lineHeight);
  }, [fontSize]);

  const config = fontSizeConfig[fontSize];

  return { fontSize, setFontSize, config };
};
