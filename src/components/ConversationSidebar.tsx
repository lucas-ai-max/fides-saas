import { useState } from 'react';
import { MessageSquare, Plus, Trash2, Edit2, Check, X, MoreHorizontal } from 'lucide-react';
import { Conversation } from '@/services/conversationService';

interface ConversationSidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onSelectConversation: (conversationId: string) => void;
  onDeleteConversation: (conversationId: string) => void;
  onRenameConversation: (conversationId: string, newTitle: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

const ConversationSidebar = ({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  onNewConversation,
  isOpen,
  onToggle,
}: ConversationSidebarProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleStartEdit = (conversation: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
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

    if (days === 0) return 'Hoje';
    if (days === 1) return 'Ontem';
    if (days < 7) return 'Últimos 7 dias';
    if (days < 30) return 'Últimos 30 dias';
    return 'Mais antigos';
  };

  // Agrupa conversas por período
  const groupedConversations = conversations.reduce((groups, conv) => {
    const period = formatDate(conv.updatedAt);
    if (!groups[period]) {
      groups[period] = [];
    }
    groups[period].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  const periodOrder = ['Hoje', 'Ontem', 'Últimos 7 dias', 'Últimos 30 dias', 'Mais antigos'];

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative top-0 left-0 h-screen text-white z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        } w-[260px]`}
        style={{ backgroundColor: 'hsl(var(--chat-sidebar))' }}
      >
        {/* Header */}
        <div className="p-2 border-b border-white/10">
          <button
            onClick={onNewConversation}
            className="w-full flex items-center space-x-2 px-3 py-2.5 rounded-lg hover:bg-white/10 transition-colors group"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Nova conversa</span>
          </button>
        </div>

        {/* Conversas */}
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-12 px-4">
              <MessageSquare className="w-12 h-12 text-white/20 mx-auto mb-3" />
              <p className="text-sm text-white/40">
                Nenhuma conversa ainda
              </p>
            </div>
          ) : (
            periodOrder.map((period) => {
              const convs = groupedConversations[period];
              if (!convs || convs.length === 0) return null;

              return (
                <div key={period}>
                  <h3 className="text-xs font-medium text-white/40 px-2 mb-2">
                    {period}
                  </h3>
                  <div className="space-y-1">
                    {convs.map((conversation) => (
                      <div
                        key={conversation.id}
                        className="relative group"
                        onMouseEnter={() => setHoveredId(conversation.id)}
                        onMouseLeave={() => setHoveredId(null)}
                      >
                        {editingId === conversation.id ? (
                          // Modo de edição
                          <div className="flex items-center space-x-1 px-2 py-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="flex-1 bg-white/10 text-white text-sm px-2 py-1 rounded border border-white/20 focus:outline-none focus:border-white/40"
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
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          // Modo normal
                          <button
                            onClick={() => onSelectConversation(conversation.id)}
                            className={`w-full text-left px-3 py-2.5 rounded-lg transition-colors flex items-center justify-between ${
                              currentConversationId === conversation.id
                                ? 'bg-white/10'
                                : 'hover:bg-white/5'
                            }`}
                          >
                            <div className="flex-1 min-w-0 flex items-center space-x-2">
                              <MessageSquare className="w-4 h-4 flex-shrink-0" />
                              <span className="text-sm truncate">
                                {conversation.title}
                              </span>
                            </div>
                            
                            {(hoveredId === conversation.id || currentConversationId === conversation.id) && (
                              <div className="flex items-center space-x-1 ml-2">
                                <button
                                  onClick={(e) => handleStartEdit(conversation, e)}
                                  className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Renomear"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Excluir esta conversa?')) {
                                      onDeleteConversation(conversation.id);
                                    }
                                  }}
                                  className="p-1 hover:bg-white/10 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Excluir"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer - User info */}
        <div className="p-3 border-t border-white/10">
          <div className="flex items-center space-x-3 px-2 py-2 rounded-lg hover:bg-white/5 cursor-pointer transition-colors">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground font-semibold">
              F
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Fides</p>
              <p className="text-xs text-white/40 truncate">Catequista</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-white/40" />
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;
