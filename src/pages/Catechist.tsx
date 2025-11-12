import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles } from 'lucide-react';
import { conversationService, Message } from '@/services/conversationService';
import MarkdownMessage from '@/components/MarkdownMessage';
import { BottomNav } from '@/components/BottomNav';

const Catechist = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      const { supabase } = await import('@/integrations/supabase/client');

      const { data, error } = await supabase.functions.invoke('chat-catechist', {
        body: { 
          message: messageToSend,
          threadId: currentThreadId 
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.content,
        timestamp: new Date(),
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);

      setCurrentThreadId(data.threadId);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (prompt: string) => {
    setInput(prompt.replace(/^[✝️📿🍞🙏]\s*/, ''));
  };

  const suggestedPrompts = [
    '✝️ O que é a Santíssima Trindade?',
    '📿 Como rezar o Santo Rosário?',
    '🍞 Explique o significado da Eucaristia',
    '🙏 Qual a importância da confissão?',
  ];

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Fixed Header with AI Avatar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary via-primary-600 to-primary-700 border-b border-primary-400/20 shadow-lg">
        <div className="px-4 py-4 flex items-center gap-3">
          {/* AI Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-white/95 shadow-lg flex items-center justify-center">
              <span className="text-2xl">✝️</span>
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-success rounded-full border-2 border-primary-700" />
          </div>
          
          {/* Title */}
          <div className="flex-1">
            <h1 className="text-white font-heading font-semibold text-lg leading-tight">
              Catequista IA
            </h1>
            <p className="text-primary-100 text-xs">
              Sempre disponível para você
            </p>
          </div>

          {/* Sparkle Icon */}
          <div className="p-2 rounded-full bg-white/10">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
        </div>
      </header>

      {/* Messages Area with top padding for fixed header */}
      <div className="flex-1 overflow-y-auto pt-[76px] pb-[140px]">
        {messages.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mb-6 shadow-lg">
              <span className="text-5xl">✝️</span>
            </div>
            
            <h2 className="text-2xl font-heading font-bold text-foreground mb-3 text-center">
              Bem-vindo ao Catequista IA
            </h2>
            
            <p className="text-muted-foreground text-center max-w-sm mb-8 text-sm leading-relaxed">
              Alimentado pela sabedoria do Catecismo, Bíblia e ensinamentos dos Santos. Escolha uma pergunta ou faça a sua:
            </p>

            {/* Suggested Prompts as Cards */}
            <div className="w-full max-w-md space-y-3">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="w-full text-left p-4 rounded-2xl bg-card hover:bg-accent/5 border border-border hover:border-primary/30 transition-all duration-200 shadow-sm hover:shadow-md group"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl group-hover:scale-110 transition-transform">
                      {prompt.charAt(0)}
                    </span>
                    <span className="text-sm font-medium text-foreground flex-1">
                      {prompt.replace(/^[✝️📿🍞🙏]\s*/, '')}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Messages with Bubbles
          <div className="px-4 py-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shadow-md ${
                    message.role === 'user' 
                      ? 'bg-gradient-to-br from-primary to-primary-600' 
                      : 'bg-white dark:bg-gray-800'
                  }`}>
                    {message.role === 'user' ? (
                      <span className="text-white text-sm font-semibold">V</span>
                    ) : (
                      <span className="text-xl">✝️</span>
                    )}
                  </div>
                </div>

                {/* Message Bubble */}
                <div className={`flex-1 max-w-[85%] ${
                  message.role === 'user' ? 'items-end' : 'items-start'
                }`}>
                  <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                    message.role === 'user'
                      ? 'bg-gradient-to-br from-primary to-primary-600 text-white rounded-tr-sm'
                      : 'bg-card border border-border rounded-tl-sm'
                  }`}>
                    <MarkdownMessage 
                      content={message.content}
                      isAssistant={message.role === 'assistant'}
                      enableTyping={message.role === 'assistant' && messages[messages.length - 1]?.id === message.id}
                    />
                  </div>

                  {/* Sources */}
                  {message.sources && message.sources.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {message.sources.map((source, idx) => (
                        <div
                          key={idx}
                          className="text-xs bg-muted/50 border border-border rounded-lg px-3 py-2 flex items-center gap-2"
                        >
                          <span>📖</span>
                          <span className="text-muted-foreground">{source.reference}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex-shrink-0">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center shadow-md">
                    <span className="text-xl">✝️</span>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="bg-card border border-border rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm inline-block">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                      <span className="text-xs text-muted-foreground">Pensando...</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Input Area */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-background via-background to-background/95 border-t border-border pb-20">
        <div className="px-4 py-4">
          <div className="relative bg-card rounded-3xl border-2 border-border focus-within:border-primary transition-all shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Faça sua pergunta..."
              disabled={isLoading}
              className="w-full bg-transparent text-foreground placeholder-muted-foreground px-5 py-4 pr-14 focus:outline-none resize-none max-h-32 disabled:opacity-50 font-body text-[15px] leading-relaxed"
              rows={1}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 bottom-2 p-2.5 rounded-full transition-all shadow-md ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-primary to-primary-600 text-white hover:shadow-lg hover:scale-105'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-muted-foreground/60 text-center mt-2">
            O Catequista IA pode cometer erros. Verifique informações importantes.
          </p>
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default Catechist;
