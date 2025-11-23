import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useChat as useOriginalChat, Conversation, ChatMessage } from '../hooks/useChat';

// Definimos la forma del contexto del chat
interface ChatContextType {
  // State
  conversations: Conversation[];
  loadingConversations: boolean;
  messages: ChatMessage[];
  loadingMessages: boolean;
  activeConversationId: string | null;
  isChatOpen: boolean;

  // Actions
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (contenido: string) => Promise<void>;
  sendImage: (file: File) => Promise<void>;
  sendAudio: (file: File) => Promise<void>;
  startConversation: (vendedorId: string, productoId: string) => Promise<string | null>;
  openChat: (conversationId?: string | null) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Usamos el hook original, pasándole el ID de la conversación activa
  const chatHookData = useOriginalChat(activeConversationId);

  const openChat = (conversationId: string | null = null) => {
    if (conversationId) {
      setActiveConversationId(conversationId);
    }
    setIsChatOpen(true);
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  const value: ChatContextType = {
    ...chatHookData,
    activeConversationId,
    setActiveConversationId,
    isChatOpen,
    openChat,
    closeChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

// Hook personalizado para usar el contexto del chat fácilmente
export const useChatContext = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext debe ser usado dentro de un ChatProvider');
  }
  return context;
};
