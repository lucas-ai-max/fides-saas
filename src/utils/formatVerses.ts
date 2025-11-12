/**
 * Formata versículos bíblicos com numeração correta
 * Converte números normais em superscript e adiciona espaçamento
 */
export function formatBiblicalText(text: string): string {
  if (!text) return '';
  
  // Regex para capturar números no início de frases (versículos)
  // Captura: número(s) seguido de letra maiúscula
  const versePattern = /(\d+)([A-ZÀÁÂÃÉÊÍÓÔÕÚÇ])/g;
  
  // Substitui número + letra por número superscript + espaço + letra
  const formatted = text.replace(versePattern, (match, number, letter) => {
    const superscriptNumber = toSuperscript(number);
    return `${superscriptNumber} ${letter}`;
  });
  
  return formatted;
}

/**
 * Converte números normais em caracteres superscript (Unicode)
 */
function toSuperscript(num: string): string {
  const superscriptMap: { [key: string]: string } = {
    '0': '⁰',
    '1': '¹',
    '2': '²',
    '3': '³',
    '4': '⁴',
    '5': '⁵',
    '6': '⁶',
    '7': '⁷',
    '8': '⁸',
    '9': '⁹',
  };
  
  return num
    .split('')
    .map(digit => superscriptMap[digit] || digit)
    .join('');
}
