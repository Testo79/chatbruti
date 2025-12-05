import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserConversations, deleteConversation, type Conversation } from '../services/conversationService';
import type { Message } from './ChatMessage';

interface ConversationSidebarProps {
  onLoadConversation: (messages: Message[], conversationId: string) => void;
  currentConversationId: string | null;
  onNewConversation: () => void;
  onSidebarToggle?: (isOpen: boolean) => void;
}

const ConversationSidebar: React.FC<ConversationSidebarProps> = ({
  onLoadConversation,
  currentConversationId,
  onNewConversation,
  onSidebarToggle,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  
  // Fermer la sidebar si l'utilisateur se déconnecte
  useEffect(() => {
    if (!user) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [user]);
  
  // Notifier le parent du changement d'état
  useEffect(() => {
    if (onSidebarToggle) {
      onSidebarToggle(isOpen);
    }
  }, [isOpen, onSidebarToggle]);

  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    try {
      const userConversations = await getUserConversations(user.id);
      setConversations(userConversations);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      try {
        await deleteConversation(conversationId);
        await loadConversations();
        if (conversationId === currentConversationId) {
          onNewConversation();
        }
      } catch (error) {
        console.error('Error deleting conversation:', error);
        alert('Erreur lors de la suppression de la conversation');
      }
    }
  };

  const handleLoad = (conversation: Conversation) => {
    onLoadConversation(conversation.messages, conversation.id);
  };

  const handleNewConversation = () => {
    onNewConversation();
  };

  if (!user) return null;

  return (
    <>
      {/* Bouton pour ouvrir/fermer la sidebar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed z-30 bg-white dark:bg-[#1a1a1a] pixel-border px-3 py-2 text-pixel-accent dark:text-[#50a0ff] font-pixel text-sm hover:bg-pixel-accent dark:hover:bg-[#50a0ff] hover:text-white dark:hover:text-black transition-all ${
          isOpen ? 'left-[280px] top-4' : 'left-0 top-4'
        }`}
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full bg-white dark:bg-[#1a1a1a] border-r-4 border-black dark:border-white shadow-2xl z-20 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ width: '280px' }}
      >
        <div className="flex flex-col h-full">
          {/* En-tête de la sidebar */}
          <div className="p-4 border-b-4 border-black dark:border-white">
            <button
              onClick={handleNewConversation}
              className="w-full pixel-button bg-pixel-accent dark:bg-[#50a0ff] text-black dark:text-black px-4 py-3 text-sm font-pixel mb-3 hover:opacity-90"
            >
              + NEW CONVO
            </button>
            <h2 className="text-base font-pixel text-black dark:text-white pixel-text">
              [CONVERSATIONS]
            </h2>
          </div>

          {/* Liste des conversations */}
          <div className="flex-1 overflow-y-auto p-3">
            {conversations.length === 0 ? (
              <p className="text-center text-black dark:text-white py-8 text-sm font-pixel">
                NO CONVERSATIONS
              </p>
            ) : (
              <div className="space-y-2">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => handleLoad(conv)}
                    className={`p-3 pixel-border cursor-pointer transition-all group ${
                      conv.id === currentConversationId
                        ? 'bg-pixel-accent dark:bg-[#50a0ff] text-white dark:text-black'
                        : 'bg-white dark:bg-[#1a1a1a] text-black dark:text-white hover:bg-[#f5f5f5] dark:hover:bg-black'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-pixel text-sm mb-1 truncate">
                          {conv.title}
                        </h3>
                        <p className="text-xs font-pixel opacity-75">
                          [{new Date(conv.updatedAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}]
                        </p>
                      </div>
                      <button
                        onClick={(e) => handleDelete(conv.id, e)}
                        className="opacity-0 group-hover:opacity-100 text-pixel-accent dark:text-[#50a0ff] hover:opacity-75 text-base font-pixel transition-opacity"
                        title="Supprimer"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer de la sidebar */}
          <div className="p-4 border-t-4 border-black dark:border-white">
            <p className="text-xs font-pixel text-black dark:text-white text-center">
              [{conversations.length}] CONVO{conversations.length > 1 ? 'S' : ''}
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ConversationSidebar;

