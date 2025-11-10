import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Menu, Paperclip, ArrowUp } from 'lucide-react';
import { conversationService, Message, Conversation } from '@/services/conversationService';
import ConversationSidebar from '@/components/ConversationSidebar';
import MarkdownMessage from '@/components/MarkdownMessage';

const Catechist = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadedConversations = conversationService.getConversations();
    setConversations(loadedConversations);
  }, []);

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

      const newThreadId = data.threadId;
      setCurrentThreadId(newThreadId);

      if (!currentConversation) {
        const newConv = conversationService.createNewConversation(messageToSend, newThreadId);
        conversationService.addMessages(newConv.id, userMessage, assistantMessage);
        setCurrentConversation(newConv);
        setConversations(conversationService.getConversations());
      } else {
        conversationService.addMessages(currentConversation.id, userMessage, assistantMessage);
        setConversations(conversationService.getConversations());
        const updated = conversationService.getConversation(currentConversation.id);
        setCurrentConversation(updated);
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

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setCurrentThreadId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversationService.getConversation(conversationId);
    if (!conversation) return;

    setMessages([...conversation.messages]);
    setCurrentConversation(conversation);
    setCurrentThreadId(conversation.threadId);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (conversationId: string) => {
    conversationService.deleteConversation(conversationId);
    setConversations(conversationService.getConversations());

    if (currentConversation?.id === conversationId) {
      handleNewConversation();
    }
  };

  const handleRenameConversation = (conversationId: string, newTitle: string) => {
    conversationService.renameConversation(conversationId, newTitle);
    setConversations(conversationService.getConversations());

    if (currentConversation?.id === conversationId) {
      const updated = conversationService.getConversation(conversationId);
      setCurrentConversation(updated);
    }
  };

  const suggestedPrompts = [
    '✝️ O que é a Santíssima Trindade?',
    '📿 Como rezar o Santo Rosário?',
    '🍞 Explique o significado da Eucaristia',
    '🙏 Qual a importância da confissão?',
  ];

  return (
    <div className="flex h-screen text-white overflow-hidden" style={{ backgroundColor: 'hsl(var(--chat-main))' }}>
      {/* Sidebar */}
      <ConversationSidebar
        conversations={conversations}
        currentConversationId={currentConversation?.id || null}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        onNewConversation={handleNewConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col relative">
        {/* Header Mobile */}
        <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/10">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="text-lg font-semibold font-heading">Fides Catequista</h1>
          <div className="w-10" />
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            // Empty State
            <div className="flex flex-col items-center justify-center h-full px-4 pb-32">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-6">
                <span className="text-4xl">✝️</span>
              </div>
              <h1 className="text-4xl font-heading font-semibold mb-4 text-center">
                Que bom te ver aqui!
              </h1>
              <p className="text-white/60 text-center max-w-md mb-8">
                Sou o Catequista, alimentado pela sabedoria do Catecismo, Bíblia e ensinamentos dos Santos. Como posso ajudar você hoje?
              </p>

              {/* Suggested Prompts */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={index}
                    onClick={() => setInput(prompt)}
                    className="text-left p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                  >
                    <span className="text-sm">{prompt}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            // Messages
            <div className="max-w-3xl mx-auto px-4 py-8">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`mb-8 ${
                    message.role === 'user' ? 'flex justify-end' : ''
                  }`}
                >
                  <div className={`flex items-start space-x-4 max-w-full ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}>
                    {/* Avatar */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      message.role === 'user' 
                        ? 'bg-accent text-accent-foreground' 
                        : 'bg-white/10'
                    }`}>
                      {message.role === 'user' ? (
                        <span className="text-sm font-semibold">V</span>
                      ) : (
                        <span className="text-lg">✝️</span>
                      )}
                    </div>

                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <span className="text-sm font-medium">
                          {message.role === 'user' ? 'Você' : 'Catequista'}
                        </span>
                      </div>
                      <MarkdownMessage 
                        content={message.content}
                        isAssistant={message.role === 'assistant'}
                        enableTyping={message.role === 'assistant' && messages[messages.length - 1]?.id === message.id}
                      />

                      {/* Sources */}
                      {message.sources && message.sources.length > 0 && (
                        <div className="mt-4 space-y-2">
                          {message.sources.map((source, idx) => (
                            <div
                              key={idx}
                              className="text-sm bg-white/5 border border-white/10 rounded-lg p-3"
                            >
                              <span className="mr-2">📖</span>
                              <span className="text-white/70">{source.reference}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Loading */}
              {isLoading && (
                <div className="mb-8">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                      <span className="text-lg">✝️</span>
                    </div>
                    <div className="flex-1">
                      <div className="mb-1">
                        <span className="text-sm font-medium">Catequista</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm text-white/60">Pensando...</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-white/10" style={{ backgroundColor: 'hsl(var(--chat-main))' }}>
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative rounded-3xl border border-white/10 focus-within:border-white/20 transition-colors" style={{ backgroundColor: 'hsl(var(--chat-input))' }}>
              <div className="flex items-end p-2">
                <button className="p-2 text-white/60 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  <Paperclip className="w-5 h-5" />
                </button>

                <textarea
                  ref={textareaRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Pergunte alguma coisa..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-white placeholder-white/40 px-3 py-2.5 focus:outline-none resize-none max-h-[200px] disabled:opacity-50 font-body"
                  rows={1}
                  style={{ minHeight: '24px' }}
                />

                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all ml-2 ${
                    input.trim() && !isLoading
                      ? 'bg-white text-black hover:bg-white/90'
                      : 'bg-white/10 text-white/40 cursor-not-allowed'
                  }`}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <p className="text-xs text-white/30 text-center mt-3">
              O Catequista pode cometer erros. Considere verificar informações importantes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Catechist;
