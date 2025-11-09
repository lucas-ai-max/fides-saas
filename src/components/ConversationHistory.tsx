import { useState } from 'react';
import { MessageSquare, Trash2, Edit2, X, Check } from 'lucide-react';
import { Conversation } from '@/services/conversationService';

interface ConversationHistoryProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  onClose: () => void;
}

const ConversationHistory = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onClose,
}: ConversationHistoryProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (conversation: Conversation) => {
    setEditingId(conversation.id);
    setEditTitle(conversation.title);
  };

  const handleSaveEdit = (conversationId: string) => {
    if (editTitle.trim()) {
      onRenameConversation(conversationId, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return 'Hoje';
    } else if (days === 1) {
      return 'Ontem';
    } else if (days < 7) {
      return `${days} dias atrás`;
    } else if (days < 30) {
      const weeks = Math.floor(days / 7);
      return `${weeks} ${weeks === 1 ? 'semana' : 'semanas'} atrás`;
    } else if (days < 365) {
      const months = Math.floor(days / 30);
      return `${months} ${months === 1 ? 'mês' : 'meses'} atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  };

  // Agrupa conversas por data
  const groupedConversations = conversations.reduce((groups, conv) => {
    const dateLabel = formatDate(conv.updatedAt);
    if (!groups[dateLabel]) {
      groups[dateLabel] = [];
    }
    groups[dateLabel].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-heading font-semibold text-primary">
            Histórico de Conversas
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent transition-colors rounded-full"
          >
            <X className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>

        {/* Conversas */}
        <div className="flex-1 overflow-y-auto p-6">
          {conversations.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg">Nenhuma conversa ainda</p>
              <p className="text-muted-foreground/70 text-sm mt-2">
                Suas conversas aparecerão aqui
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(groupedConversations).map(([dateLabel, convs]) => (
                <div key={dateLabel}>
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {dateLabel}
                  </h3>
                  <div className="space-y-2">
                    {convs.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`group relative rounded-lg border-2 transition-all ${
                          currentConversationId === conversation.id
                            ? 'border-accent bg-accent/5'
                            : 'border-border hover:border-accent/50 bg-card'
                        }`}
                      >
                        {editingId === conversation.id ? (
                          <div className="p-4">
                            <div className="flex items-center space-x-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                className="flex-1 px-3 py-2 border border-border bg-background rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    handleSaveEdit(conversation.id);
                                  } else if (e.key === 'Escape') {
                                    handleCancelEdit();
                                  }
                                }}
                              />
                              <button
                                onClick={() => handleSaveEdit(conversation.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              >
                                <Check className="w-5 h-5" />
                              </button>
                              <button
                                onClick={handleCancelEdit}
                                className="p-2 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                              >
                                <X className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              onSelectConversation(conversation.id);
                              onClose();
                            }}
                            className="w-full text-left p-4"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1 min-w-0 pr-4">
                                <h4 className="font-semibold text-primary mb-1 truncate font-heading">
                                  {conversation.title}
                                </h4>
                                <p className="text-sm text-muted-foreground line-clamp-2 font-body">
                                  {conversation.preview}
                                </p>
                                <div className="flex items-center space-x-3 mt-2 text-xs text-muted-foreground">
                                  <span>{conversation.messageCount} mensagens</span>
                                  <span>•</span>
                                  <span>{formatDate(conversation.updatedAt)}</span>
                                </div>
                              </div>
                              
                              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleStartEdit(conversation);
                                  }}
                                  className="p-2 text-muted-foreground hover:bg-accent rounded-lg transition-colors"
                                  title="Renomear"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      window.confirm(
                                        'Tem certeza que deseja excluir esta conversa?'
                                      )
                                    ) {
                                      onDeleteConversation(conversation.id);
                                    }
                                  }}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationHistory;
