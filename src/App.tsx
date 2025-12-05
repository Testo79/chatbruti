import { useState, useEffect } from 'react';
import Layout from './components/Layout';
import ChatCharlatan from './components/ChatCharlatan';
import FloatingAvatar from './components/FloatingAvatar';
import ThemeToggle from './components/ThemeToggle';
import ConversationSidebar from './components/ConversationSidebar';
import { useAuth } from './contexts/AuthContext';
import type { Message } from './components/ChatMessage';

function App() {
  const [lastUserMessage, setLastUserMessage] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Réinitialiser les conversations quand on se connecte/déconnecte
  useEffect(() => {
    setCurrentMessages([]);
    setCurrentConversationId(null);
  }, [isAuthenticated]);
  
  const handleLoadConversation = (messages: Message[], conversationId: string) => {
    setCurrentMessages(messages);
    setCurrentConversationId(conversationId || null);
  };
  
  const handleNewConversation = () => {
    setCurrentMessages([]);
    setCurrentConversationId(null);
  };

  return (
    <>
      <ConversationSidebar
        onLoadConversation={handleLoadConversation}
        currentConversationId={currentConversationId}
        onNewConversation={handleNewConversation}
        onSidebarToggle={setSidebarOpen}
      />
      <Layout sidebarOpen={sidebarOpen}>
      {/* Le chatbot */}
      <section className="mb-8">
        <ChatCharlatan 
          onUserMessage={(message) => setLastUserMessage(message)}
          onTypingChange={(typing) => setIsTyping(typing)}
          initialMessages={currentMessages}
          conversationId={currentConversationId}
        />
      </section>

      {/* Section complémentaire */}
      <section>
        <div className="bg-white dark:bg-[#1a1a1a] pixel-border p-5">
          <h3 className="text-base font-pixel text-pixel-accent dark:text-[#50a0ff] mb-3 pixel-text">
            [*] POKEMON GBA THEME [*]
          </h3>
          <div className="text-sm font-pixel text-black dark:text-white space-y-2">
            <p>&gt; POKEMON RUBY/SAPPHIRE STYLE &lt;</p>
            <p>&gt; AUTHENTIC GBA AESTHETIC &lt;</p>
            <p>&gt; RETRO GAMING NOSTALGIA &lt;</p>
          </div>
        </div>
      </section>
      </Layout>
      <FloatingAvatar 
        lastUserMessage={lastUserMessage}
        isTyping={isTyping}
      />
      <ThemeToggle />
    </>
  );
}

export default App;


