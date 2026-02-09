

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
  // Function to format text highlighting verse numbers
  const formatText = (content: string) => {
    // Regex matches numbers at start of line or preceded by space, optionally followed by space
    // Also handles numbers stuck to words (common in some liturgical texts)
    // Capture group 1: the number
    const parts = content.split(/(\d+)/g);

    return parts.map((part, index) => {
      // Check if this part is a number and is likely a verse number (1-176 roughly for Psalms)
      const isNumber = /^\d+$/.test(part);

      if (isNumber) {
        return (
          <span
            key={index}
            className="text-[0.6em] font-bold text-muted-foreground align-top mr-1 ml-0.5 select-none"
            style={{ position: 'relative', top: '-0.2em' }}
          >
            {part}
          </span>
        );
      }

      return <span key={index}>{part}</span>;
    });
  };

  const formattedText = formatText(text);

  return (
    <p
      className={`font-serif texto-biblico whitespace-pre-line text-foreground ${className}`}
      style={{ fontSize, lineHeight }}
    >
      {formattedText}
    </p>
  );
}

