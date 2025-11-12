import { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownMessageProps {
  content: string;
  isAssistant?: boolean;
  enableTyping?: boolean;
}

const MarkdownMessage = ({ content, isAssistant = false, enableTyping = false }: MarkdownMessageProps) => {
  const [displayedContent, setDisplayedContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!enableTyping || !isAssistant) {
      setDisplayedContent(content);
      return;
    }

    // Efeito de digitação apenas para mensagens do assistente
    setIsTyping(true);
    setDisplayedContent('');
    
    let currentIndex = 0;
    const typingSpeed = 20; // ms por caractere

    const interval = setInterval(() => {
      if (currentIndex < content.length) {
        setDisplayedContent(content.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, typingSpeed);

    return () => clearInterval(interval);
  }, [content, isAssistant, enableTyping]);

  return (
    <div className={`prose ${isAssistant ? 'prose-invert' : ''} max-w-none`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customizar elementos do markdown
          p: ({ children }) => (
            <p className={`${isAssistant ? 'text-white/90' : 'text-white'} leading-relaxed font-body text-[15px] mb-3`}>
              {children}
            </p>
          ),
          h1: ({ children }) => (
            <h1 className={`${isAssistant ? 'text-white' : 'text-white'} text-xl font-heading font-semibold mb-3 mt-4`}>
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className={`${isAssistant ? 'text-white' : 'text-white'} text-lg font-heading font-semibold mb-2 mt-3`}>
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className={`${isAssistant ? 'text-white' : 'text-white'} text-base font-heading font-semibold mb-2 mt-3`}>
              {children}
            </h3>
          ),
          strong: ({ children }) => (
            <strong className={`${isAssistant ? 'text-white' : 'text-white'} font-semibold`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`${isAssistant ? 'text-white/80' : 'text-white/80'} italic`}>
              {children}
            </em>
          ),
          ul: ({ children }) => (
            <ul className={`${isAssistant ? 'text-white/90' : 'text-white'} list-disc pl-6 mb-3 space-y-1`}>
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className={`${isAssistant ? 'text-white/90' : 'text-white'} list-decimal pl-6 mb-3 space-y-1`}>
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className={`${isAssistant ? 'text-white/90' : 'text-white'} leading-relaxed font-body text-[15px]`}>
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className={`border-l-4 ${isAssistant ? 'border-accent/50 bg-white/5' : 'border-accent bg-gray-50'} pl-4 py-2 my-3 italic`}>
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className={`${isAssistant ? 'bg-white/10 text-accent-light' : 'bg-gray-100 text-accent-dark'} px-1.5 py-0.5 rounded text-sm font-mono`}>
                  {children}
                </code>
              );
            }
            return (
              <code className={`${isAssistant ? 'bg-white/5 text-white/90' : 'bg-gray-50 text-gray-900'} block p-3 rounded-lg text-sm font-mono overflow-x-auto`}>
                {children}
              </code>
            );
          },
          a: ({ children, href }) => (
            <a 
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${isAssistant ? 'text-accent-light hover:text-accent' : 'text-primary hover:text-primary-dark'} underline font-medium transition-colors`}
            >
              {children}
            </a>
          ),
        }}
      >
        {displayedContent}
      </ReactMarkdown>
      {isTyping && (
        <span className="inline-block w-1 h-4 bg-accent animate-pulse ml-0.5"></span>
      )}
    </div>
  );
};

export default MarkdownMessage;
