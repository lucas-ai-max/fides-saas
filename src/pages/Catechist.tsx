import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Sparkles, Menu, PenSquare } from 'lucide-react';
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
    setInput(prompt);
  };

  const suggestedPrompts = [
    'O que é a Santíssima Trindade?',
    'Como rezar o Santo Rosário?',
    'Explique o significado da Eucaristia',
    'Qual a importância da confissão?',
  ];

  return (
    <div className="flex flex-col h-screen bg-[#1a1a1a] dark:bg-[#1a1a1a]">
      {/* Fixed Header - ChatGPT Style */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#1a1a1a] border-b border-white/10">
        <div className="px-4 py-3 flex items-center justify-between">
          {/* Menu Button */}
          <button className="p-2 hover:bg-white/5 rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-white/70" />
          </button>
          
          {/* Title */}
          <h1 className="text-white font-medium text-base">
            Catequista IA
          </h1>

          {/* New Chat Button */}
          <button 
            onClick={() => {
              setMessages([]);
              setCurrentThreadId(null);
            }}
            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
          >
            <PenSquare className="w-5 h-5 text-white/70" />
          </button>
        </div>
      </header>

      {/* Messages Area with top padding for fixed header */}
      <div className="flex-1 overflow-y-auto pt-[52px] pb-[140px]">
        {messages.length === 0 ? (
          // Empty State - ChatGPT Style
          <div className="flex flex-col items-center justify-center min-h-full px-4 py-12">
            {/* Loading Icon */}
            <div className="w-16 h-16 mb-8 flex items-center justify-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-white/10 border-t-white/30 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl">✝️</span>
                </div>
              </div>
            </div>

            {/* Suggested Prompts - ChatGPT Style */}
            <div className="w-full max-w-2xl space-y-2 px-2">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(prompt)}
                  className="w-full text-left px-4 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all duration-200"
                >
                  <p className="text-sm text-white/90 font-medium leading-relaxed">
                    {prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Messages - ChatGPT Style
          <div className="py-6 space-y-6 max-w-3xl mx-auto w-full">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`px-4 ${
                  message.role === 'assistant' ? 'bg-white/[0.02]' : ''
                }`}
              >
                <div className="max-w-3xl mx-auto py-5">
                  <div className="flex gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-white/5">
                      {message.role === 'user' ? (
                        <span className="text-white text-sm font-semibold">V</span>
                      ) : (
                        <span className="text-lg">✝️</span>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="text-white/90 leading-7">
                        <MarkdownMessage 
                          content={message.content}
                          isAssistant={message.role === 'assistant'}
                          enableTyping={message.role === 'assistant' && messages[messages.length - 1]?.id === message.id}
                        />
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-3 space-y-1.5">
                          {message.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="text-xs bg-white/5 border border-white/10 rounded-lg px-3 py-2 flex items-center gap-2"
                            >
                              <span>📖</span>
                              <span className="text-white/60">{source.reference}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator - ChatGPT Style */}
            {isLoading && (
              <div className="px-4 bg-white/[0.02]">
                <div className="max-w-3xl mx-auto py-5">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-white/5">
                      <span className="text-lg">✝️</span>
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Fixed Input Area - ChatGPT Style */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#1a1a1a] via-[#1a1a1a] to-[#1a1a1a]/95 pb-20">
        <div className="px-4 py-4 max-w-3xl mx-auto">
          <div className="relative bg-[#2f2f2f] rounded-3xl border border-white/10 focus-within:border-white/20 transition-all shadow-lg">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Mensagem Catequista IA"
              disabled={isLoading}
              className="w-full bg-transparent text-white placeholder-white/40 px-5 py-4 pr-14 focus:outline-none resize-none max-h-32 disabled:opacity-50 text-[15px] leading-relaxed"
              rows={1}
            />
            
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className={`absolute right-2 bottom-2 p-2.5 rounded-full transition-all ${
                input.trim() && !isLoading
                  ? 'bg-white text-[#1a1a1a] hover:bg-white/90'
                  : 'bg-white/10 text-white/30 cursor-not-allowed'
              }`}
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>

          <p className="text-[11px] text-white/40 text-center mt-2.5">
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
