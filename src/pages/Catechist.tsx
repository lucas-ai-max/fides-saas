import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Menu, Plus, Cross, Sparkles, Bird, MessageSquare, Trash2 } from 'lucide-react';
import { conversationService, Message, Conversation } from '@/services/conversationService';
import MarkdownMessage from '@/components/MarkdownMessage';
import { BottomNav } from '@/components/BottomNav';

const Catechist = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load conversations on mount
  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = () => {
    const loaded = conversationService.getConversations();
    setConversations(loaded);

    // Check if there is an active conversation maintained by service
    const currentConvId = conversationService.getCurrentConversationId();
    if (currentConvId) {
      const currentConv = loaded.find(conv => conv.id === currentConvId);
      if (currentConv) {
        setMessages(currentConv.messages);
        setCurrentThreadId(currentConv.threadId);
        setActiveConversationId(currentConv.id);
      } else {
        conversationService.setCurrentConversation(null);
      }
    }
  };

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

  const handleCreateNewChat = () => {
    setMessages([]);
    setCurrentThreadId(null);
    setActiveConversationId(null);
    conversationService.setCurrentConversation(null);
    setIsSidebarOpen(false);
  };

  const handleSelectConversation = (conv: Conversation) => {
    setMessages(conv.messages);
    setCurrentThreadId(conv.threadId);
    setActiveConversationId(conv.id);
    conversationService.setCurrentConversation(conv.id);
    setIsSidebarOpen(false);
  };

  const handleDeleteConversation = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (confirm('Tem certeza que deseja excluir esta conversa?')) {
      conversationService.deleteConversation(convId);
      loadConversations();
      if (activeConversationId === convId) {
        handleCreateNewChat();
      }
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    // Optimistic update
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    const messageToSend = input.trim();
    setInput('');
    setIsLoading(true);

    try {
      let currentConvId = activeConversationId;

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

      const updatedMessages = [...newMessages, assistantMessage];
      setMessages(updatedMessages);
      setCurrentThreadId(data.threadId);

      // Persist conversation
      if (!currentConvId) {
        const newConv = conversationService.createNewConversation(messageToSend, data.threadId);
        currentConvId = newConv.id;
        setActiveConversationId(newConv.id);

        // Immediate UI update for Sidebar
        setConversations(prev => [newConv, ...prev]);
      }

      if (currentConvId) {
        conversationService.addMessages(currentConvId, userMessage, assistantMessage);

        // Update the conversation in the list (move to top, update preview)
        setConversations(prev => {
          const updated = [...prev];
          const index = updated.findIndex(c => c.id === currentConvId);
          if (index !== -1) {
            const conv = updated[index];
            // Mimic service logic for immediate feedback
            conv.messages.push(userMessage, assistantMessage);
            conv.preview = assistantMessage.content.substring(0, 100) + (assistantMessage.content.length > 100 ? '...' : '');
            updated.splice(index, 1);
            updated.unshift(conv);
          }
          return updated;
        });

        // Also sync with storage to be safe
        loadConversations();
      }

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

  const suggestedQuestions = [
    "O que é a Santíssima Trindade?",
    "Como rezar quando não sei o que dizer?",
    "Por que os católicos se confessam?",
    "O que acontece na Missa?",
    "Posso falar com Deus do meu jeito?"
  ];

  return (
    <div className="flex h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-hidden transition-colors duration-300">

      {/* Sidebar Overlay (Mobile) */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative z-50 h-full w-[280px] bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4">
          <button
            onClick={handleCreateNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-primary/5 hover:bg-primary/10 border border-border hover:border-primary/20 transition-all text-sm font-medium text-foreground"
          >
            <Plus className="w-5 h-5 text-accent" />
            Novo Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1 custom-scrollbar">
          <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Histórico
          </div>

          {conversations.length === 0 ? (
            <div className="px-3 py-4 text-sm text-muted-foreground/70 text-center italic">
              Nenhuma conversa ainda
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => handleSelectConversation(conv)}
                className={`group relative flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition-all ${activeConversationId === conv.id
                  ? 'bg-primary/10 text-primary dark:text-accent'
                  : 'text-muted-foreground hover:bg-primary/5 hover:text-foreground'
                  }`}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 shrink-0 opacity-70" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm truncate pr-6 text-left">{conv.title}</p>
                </div>

                {activeConversationId === conv.id && (
                  <button
                    onClick={(e) => handleDeleteConversation(e, conv.id)}
                    className="absolute right-2 p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 md:opacity-0 md:group-hover:opacity-100 transition-all opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-primary/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
              <span className="text-xs font-bold text-accent">LS</span>
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-foreground">Lucas Silva</p>
              <p className="text-xs text-muted-foreground truncate">Free Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full relative w-full bg-background">

        {/* Header (Mobile Toggle) */}
        <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between p-4 md:hidden bg-gradient-to-b from-background to-transparent">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-full hover:bg-primary/10 text-foreground"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif text-primary">Catequista IA</span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        {/* Messages Area */}
        <main className="flex-1 overflow-y-auto pt-[60px] pb-[160px]">
          {messages.length === 0 ? (
            // Welcome Screen
            <div className="min-h-full flex flex-col items-center justify-center px-4 animate-in fade-in duration-700">

              {/* Intro Message */}
              <div className="flex items-center gap-2 mb-8 text-muted-foreground opacity-80">
                <Cross className="w-3 h-3" />
                <span className="text-xs tracking-wider uppercase">Estou aqui para te ajudar a compreender a fé católica</span>
              </div>

              {/* Central Question */}
              <h2 className="font-serif text-2xl md:text-3xl text-center text-foreground mb-10 leading-relaxed font-light">
                O que você gostaria de <br />
                <span className="text-accent font-normal">aprender hoje?</span>
              </h2>

              {/* Content Container with Dove Decoration */}
              <div className="relative w-full max-w-lg">

                {/* Decorative Dove/Sparkle */}
                <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-24 h-24 hidden md:flex items-center justify-center pointer-events-none opacity-40">
                  <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full"></div>
                  <Bird className="w-12 h-12 text-accent/50 drop-shadow-[0_0_15px_rgba(251,191,36,0.3)]" />
                </div>

                {/* Suggestions List */}
                <div className="space-y-3 relative z-10">
                  {suggestedQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSuggestionClick(q)}
                      className="w-full text-left p-4 rounded-2xl bg-card border border-border hover:border-primary/30 hover:bg-card/80 transition-all duration-300 group shadow-lg"
                    >
                      <span className="text-foreground/90 group-hover:text-foreground font-light text-[15px]">{q}</span>
                    </button>
                  ))}
                </div>

              </div>
            </div>
          ) : (
            // Chat Interface
            <div className="max-w-3xl mx-auto py-6 space-y-8">
              {messages.map((message) => (
                <div key={message.id} className={`px-4 ${message.role === 'assistant' ? '' : ''}`}>
                  <div className="flex gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${message.role === 'assistant'
                      ? 'bg-primary/20 text-accent border border-primary/30'
                      : 'bg-primary/5 text-muted-foreground'
                      }`}>
                      {message.role === 'assistant' ? <Sparkles className="w-4 h-4" /> : <span className="text-xs font-bold">V</span>}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="prose prose-invert dark:prose-invert prose-p:text-foreground prose-headings:text-primary prose-strong:text-accent prose-a:text-accent max-w-none">
                        <MarkdownMessage
                          content={message.content}
                          isAssistant={message.role === 'assistant'}
                          enableTyping={message.role === 'assistant' && messages[messages.length - 1]?.id === message.id}
                        />
                      </div>

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
                          {message.sources.map((source, idx) => (
                            <span key={idx} className="text-[10px] uppercase tracking-wider text-accent/80 border border-primary/20 rounded-md px-2 py-1">
                              {source.reference}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="px-4">
                  <div className="flex gap-4 items-center">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center shrink-0">
                      <Loader2 className="w-4 h-4 text-accent animate-spin" />
                    </div>
                    <span className="text-muted-foreground text-sm animate-pulse">Catequista está escrevendo...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </main>

        {/* Input Area */}
        <div className="fixed bottom-0 left-0 md:left-[280px] right-0 z-40 bg-gradient-to-t from-background via-background to-transparent pb-6 pt-10">
          <div className="max-w-3xl mx-auto px-4">
            <div className={`relative transition-all duration-300`}>
              <div className="relative bg-card rounded-[24px] border border-border focus-within:border-accent/50 focus-within:ring-1 focus-within:ring-accent/20 shadow-2xl overflow-hidden">
                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Escreva sua dúvida ou aquilo que deseja entender..."
                  disabled={isLoading}
                  className="w-full bg-transparent text-foreground placeholder-muted-foreground px-6 py-4 pr-14 focus:outline-none resize-none max-h-32 disabled:opacity-50 text-[15px] leading-relaxed custom-scrollbar"
                  rows={1}
                />

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`absolute right-2 bottom-2 p-2 rounded-xl transition-all ${input.trim() && !isLoading
                    ? 'bg-accent text-accent-foreground hover:opacity-90 hover:scale-105'
                    : 'bg-muted text-muted-foreground/50 cursor-not-allowed'
                    }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              <div className="text-center mt-3">
                <p className="text-[10px] text-muted-foreground">
                  As respostas seguem o ensinamento da Igreja, mas não substituem um sacerdote ou catequista humano.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Navigation (likely hidden on desktop if using sidebar, but preserving for mobile consistency) */}
      <div className="md:hidden">
        <BottomNav />
      </div>

    </div>
  );
};

export default Catechist;
