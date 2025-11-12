import { formatBiblicalText } from '@/utils/formatVerses';

interface BiblicalTextProps {
  text: string;
  fontSize?: string;
  lineHeight?: string;
  className?: string;
}

export function BiblicalText({ 
  text, 
  fontSize = '18px', 
  lineHeight = '1.9',
  className = ''
}: BiblicalTextProps) {
  const formattedText = formatBiblicalText(text);
  
  return (
    <p 
      className={`font-serif texto-biblico whitespace-pre-line ${className}`}
      style={{ fontSize, lineHeight }}
    >
      {formattedText}
    </p>
  );
}
