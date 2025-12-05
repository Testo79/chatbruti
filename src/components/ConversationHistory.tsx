import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserConversations, deleteConversation, type Conversation } from '../services/conversationService';
import type { Message } from './ChatMessage';

interface ConversationHistoryProps {
  onLoadConversation: (messages: Message[], conversationId: string) => void;
  currentConversationId: string | null;
}

const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  onLoadConversation,
  currentConversationId,
}) => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user) {
      loadConversations().catch(console.error);
    }
  }, [user]);

  const loadConversations = async () => {
    if (!user) return;
    const userConversations = await getUserConversations(user.id);
    setConversations(userConversations.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ));
  };

  const handleDelete = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Êtes-vous sûr de vouloir supprimer cette conversation ?')) {
      await deleteConversation(conversationId);
      await loadConversations();
      if (conversationId === currentConversationId) {
        onLoadConversation([], '');
      }
    }
  };

  const handleLoad = (conversation: Conversation) => {
    onLoadConversation(conversation.messages, conversation.id);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-full font-semibold transition-all shadow-lg border border-white/30"
      >
        📜 Historique
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-light-surface dark:bg-nird-light rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col border border-light-purple/30 dark:border-nird-purple/30">
            <div className="flex justify-between items-center p-6 border-b border-light-purple/20 dark:border-nird-purple/20">
              <h2 className="text-2xl font-bold text-light-text dark:text-white">
                Historique des conversations
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {conversations.length === 0 ? (
                <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                  Aucune conversation sauvegardée
                </p>
              ) : (
                <div className="space-y-3">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => handleLoad(conv)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-lg ${
                        conv.id === currentConversationId
                          ? 'bg-nird-purple/20 dark:bg-nird-purple/30 border-nird-purple dark:border-nird-purple'
                          : 'bg-white dark:bg-nird-dark border-light-purple/30 dark:border-nird-purple/30 hover:border-light-purple dark:hover:border-nird-purple'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-semibold text-light-text dark:text-white mb-1">
                            {conv.title}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {conv.messages.length} message{conv.messages.length > 1 ? 's' : ''}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                            {new Date(conv.updatedAt).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </p>
                        </div>
                        <button
                          onClick={(e) => handleDelete(conv.id, e)}
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 ml-4"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ConversationHistory;

