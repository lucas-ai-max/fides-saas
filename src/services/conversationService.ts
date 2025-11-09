export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  sources?: Array<{
    type: string;
    reference: string;
  }>;
}

export interface Conversation {
  id: string;
  threadId: string;
  title: string;
  preview: string;
  createdAt: Date;
  updatedAt: Date;
  messageCount: number;
  messages: Message[];
}

class ConversationService {
  private readonly STORAGE_KEY = 'fides_conversations';
  private readonly MAX_CONVERSATIONS = 50;
  private currentConversationId: string | null = null;

  // Salva todas as conversas no localStorage
  private saveConversations(conversations: Conversation[]): void {
    try {
      const serialized = conversations.map(conv => ({
        ...conv,
        createdAt: conv.createdAt.toISOString(),
        updatedAt: conv.updatedAt.toISOString(),
        messages: conv.messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp.toISOString()
        }))
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(serialized));
    } catch (error) {
      console.error('Erro ao salvar conversas:', error);
    }
  }

  // Obtém todas as conversas do localStorage
  getConversations(): Conversation[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return [];
      
      const conversations = JSON.parse(data);
      
      return conversations.map((conv: any) => ({
        ...conv,
        createdAt: new Date(conv.createdAt),
        updatedAt: new Date(conv.updatedAt),
        messages: conv.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }))
      }));
    } catch (error) {
      console.error('Erro ao obter conversas:', error);
      return [];
    }
  }

  // Gera um título baseado na primeira mensagem
  private generateTitle(message: string): string {
    const maxLength = 50;
    let title = message.substring(0, maxLength);
    
    const firstPeriod = title.indexOf('.');
    if (firstPeriod > 0 && firstPeriod < maxLength) {
      title = title.substring(0, firstPeriod);
    }
    
    if (message.length > maxLength) {
      title += '...';
    }
    
    return title;
  }

  // Cria uma nova conversa
  createNewConversation(firstMessage: string, threadId: string): Conversation {
    const conversation: Conversation = {
      id: `conv_${Date.now()}`,
      threadId: threadId,
      title: this.generateTitle(firstMessage),
      preview: firstMessage,
      createdAt: new Date(),
      updatedAt: new Date(),
      messageCount: 0,
      messages: []
    };

    const conversations = this.getConversations();
    conversations.unshift(conversation);

    if (conversations.length > this.MAX_CONVERSATIONS) {
      conversations.pop();
    }

    this.saveConversations(conversations);
    this.currentConversationId = conversation.id;
    return conversation;
  }

  // Adiciona mensagens a uma conversa
  addMessages(conversationId: string, userMessage: Message, assistantMessage: Message): void {
    const conversations = this.getConversations();
    const convIndex = conversations.findIndex(c => c.id === conversationId);

    if (convIndex === -1) return;

    const conversation = conversations[convIndex];
    conversation.messages.push(userMessage, assistantMessage);
    
    // Atualiza preview com a última resposta do assistente
    conversation.preview = assistantMessage.content.substring(0, 100);
    if (assistantMessage.content.length > 100) {
      conversation.preview += '...';
    }

    conversation.updatedAt = new Date();
    conversation.messageCount = conversation.messages.length;

    // Move a conversa atualizada para o topo
    conversations.splice(convIndex, 1);
    conversations.unshift(conversation);

    this.saveConversations(conversations);
  }

  // Obtém uma conversa pelo ID
  getConversation(conversationId: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(c => c.id === conversationId) || null;
  }

  // Obtém conversa pelo threadId
  getConversationByThreadId(threadId: string): Conversation | null {
    const conversations = this.getConversations();
    return conversations.find(c => c.threadId === threadId) || null;
  }

  // Deleta uma conversa
  deleteConversation(conversationId: string): void {
    const conversations = this.getConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    this.saveConversations(filtered);

    if (this.currentConversationId === conversationId) {
      this.currentConversationId = null;
    }
  }

  // Renomeia uma conversa
  renameConversation(conversationId: string, newTitle: string): void {
    const conversations = this.getConversations();
    const conversation = conversations.find(c => c.id === conversationId);

    if (conversation) {
      conversation.title = newTitle;
      conversation.updatedAt = new Date();
      this.saveConversations(conversations);
    }
  }

  // Define a conversa atual
  setCurrentConversation(conversationId: string | null): void {
    this.currentConversationId = conversationId;
  }

  // Obtém a conversa atual
  getCurrentConversationId(): string | null {
    return this.currentConversationId;
  }
}

export const conversationService = new ConversationService();
