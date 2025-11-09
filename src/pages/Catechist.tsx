import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Send, MoreVertical, MessageSquare, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { conversationService, Conversation, Message } from "@/services/conversationService";
import ConversationHistory from "@/components/ConversationHistory";

const Catechist = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Olá! Sou o Catequista, alimentado pela sabedoria do Catecismo, Bíblia e ensinamentos dos Santos. Como posso ajudar você hoje?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    "O que é a Eucaristia?",
    "Como rezar o Rosário?",
    "Significado da Missa",
    "Santos e intercessão"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const loadedConversations = conversationService.getConversations();
    setConversations(loadedConversations);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToSend = input.trim();
    setInput("");
    setIsLoading(true);

    try {
      const { supabase } = await import("@/integrations/supabase/client");

      const { data, error } = await supabase.functions.invoke('chat-catechist', {
        body: { 
          message: messageToSend,
          threadId: currentThreadId 
        }
      });

      if (error) {
        throw error;
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.content,
        timestamp: new Date(),
        sources: data.sources
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Salva ou atualiza a conversa
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
        role: "assistant",
        content: "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = () => {
    setCurrentConversation(null);
    setCurrentThreadId(null);
    setMessages([
      {
        id: "1",
        role: "assistant",
        content: "Olá! Sou o Catequista, alimentado pela sabedoria do Catecismo, Bíblia e ensinamentos dos Santos. Como posso ajudar você hoje?",
        timestamp: new Date()
      }
    ]);
    setShowMenu(false);
  };

  const handleSelectConversation = (conversationId: string) => {
    const conversation = conversationService.getConversation(conversationId);
    if (!conversation) return;

    const introMessage: Message = {
      id: "intro",
      role: "assistant",
      content: "Olá! Sou o Catequista, alimentado pela sabedoria do Catecismo, Bíblia e ensinamentos dos Santos. Como posso ajudar você hoje?",
      timestamp: new Date()
    };

    setMessages([introMessage, ...conversation.messages]);
    setCurrentConversation(conversation);
    setCurrentThreadId(conversation.threadId);
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

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b p-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-heading font-semibold text-primary">
              {currentConversation?.title || 'Catequista'}
            </h1>
            {currentConversation && (
              <p className="text-xs text-muted-foreground">
                {currentConversation.messageCount} mensagens
              </p>
            )}
          </div>
        </div>
        <div className="relative" ref={menuRef}>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowMenu(!showMenu)}
          >
            <MoreVertical className="h-5 w-5" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-card rounded-lg shadow-xl border border-border z-10 overflow-hidden">
              <button
                onClick={handleNewConversation}
                className="w-full text-left px-4 py-3 hover:bg-accent transition-colors text-sm flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Nova conversa</span>
              </button>
              <button
                onClick={() => {
                  setShowHistory(true);
                  setShowMenu(false);
                }}
                className="w-full text-left px-4 py-3 hover:bg-accent transition-colors text-sm flex items-center gap-2 border-t border-border"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Histórico de conversas</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Intro Card */}
        {messages.length === 1 && (
          <Card className="p-6 bg-accent-light border-accent/20 animate-fade-in">
            <div className="flex gap-3">
              <MessageCircle className="h-6 w-6 text-liturgical-gold flex-shrink-0 mt-1" />
              <div className="space-y-2">
                <h3 className="font-heading text-lg font-semibold text-primary">
                  Converse com a Sabedoria da Igreja
                </h3>
                <p className="text-sm text-muted-foreground font-body">
                  Tire suas dúvidas sobre fé, moral, Escrituras, liturgia e mais.
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Messages */}
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-fade-in`}
          >
            <div
              className={`max-w-[80%] rounded-2xl p-4 ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-stone-gray text-foreground rounded-tl-sm"
              }`}
            >
              <p className="font-body text-[15px] leading-relaxed whitespace-pre-wrap">
                {message.content}
              </p>
              
              {message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-3 border-t border-accent/20">
                  {message.sources.map((source, index) => (
                    <div
                      key={index}
                      className="text-sm bg-accent/10 border-l-4 border-accent p-2 rounded mt-2"
                    >
                      <span className="mr-2">📖</span>
                      <span className="text-muted-foreground">{source.reference}</span>
                    </div>
                  ))}
                </div>
              )}
              
              <p
                className={`text-xs mt-2 ${
                  message.role === "user"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground"
                }`}
              >
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start animate-fade-in">
            <div className="bg-stone-gray rounded-2xl rounded-tl-sm p-4">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
              </div>
            </div>
          </div>
        )}

        {/* Quick Questions */}
        {messages.length === 1 && (
          <Card className="p-4 bg-card animate-fade-in">
            <h4 className="font-body text-sm font-semibold text-primary mb-3">
              💡 Perguntas frequentes:
            </h4>
            <div className="space-y-2">
              {quickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickQuestion(question)}
                  className="w-full text-left p-3 rounded-lg hover:bg-accent-light transition-colors text-sm font-body text-muted-foreground hover:text-primary"
                >
                  {question}
                </button>
              ))}
            </div>
          </Card>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t bg-card p-4 shadow-lg">
        <div className="flex gap-2 items-end">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Digite sua pergunta..."
            className="min-h-[44px] max-h-32 resize-none font-body"
            rows={1}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            size="icon"
            className="h-11 w-11 rounded-full bg-accent hover:bg-accent/90 text-accent-foreground flex-shrink-0"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Modal de Histórico */}
      {showHistory && (
        <ConversationHistory
          conversations={conversations}
          currentConversationId={currentConversation?.id || null}
          onSelectConversation={handleSelectConversation}
          onDeleteConversation={handleDeleteConversation}
          onRenameConversation={handleRenameConversation}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
};

// Mock MessageCircle import (using lucide-react's existing icon)
import { MessageCircle } from "lucide-react";

export default Catechist;
