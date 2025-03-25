import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from './AuthContext';
import { 
  ChatMessage, 
  Chat, 
  createChat, 
  getChatHistory, 
  getChatMessages, 
  saveMessage,
  deleteChat as deleteChatInSupabase 
} from '../lib/supabase';
import { generateAzureResponse } from '../lib/azure';
import { useToast } from '@/hooks/use-toast';

interface ChatContextType {
  currentChatId: string | null;
  messages: ChatMessage[];
  chats: Chat[];
  isProcessing: boolean;
  sendMessage: (content: string) => Promise<void>;
  createNewChat: () => Promise<string>;
  selectChat: (chatId: string) => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  loadingChats: boolean;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const { user, incrementFreeChatsCount, freeChatsCount } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);

  // Load chat history when user changes
  useEffect(() => {
    if (user) {
      loadChatHistory();
    } else {
      setChats([]);
      setLoadingChats(false);
    }
  }, [user]);

  // Load messages when current chat changes
  useEffect(() => {
    if (currentChatId) {
      loadMessages(currentChatId);
    } else {
      setMessages([]);
    }
  }, [currentChatId]);

  const loadChatHistory = async () => {
    if (!user) return;
    
    setLoadingChats(true);
    try {
      const history = await getChatHistory(user.id);
      setChats(history);
      
      // If there's at least one chat, select it
      if (history.length > 0 && !currentChatId) {
        setCurrentChatId(history[0].id);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
      toast({
        title: 'Error loading chat history',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setLoadingChats(false);
    }
  };

  const loadMessages = async (chatId: string) => {
    if (!user) return;
    
    try {
      const chatMessages = await getChatMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error('Error loading chat messages:', error);
      toast({
        title: 'Error loading messages',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
  };

  const createNewChat = async () => {
    if (!user) {
      const tempId = uuidv4();
      setCurrentChatId(tempId);
      setMessages([]);
      return tempId;
    }
    
    try {
      const newChat = await createChat(user.id, 'New Chat');
      if (newChat) {
        setChats([newChat, ...chats]);
        setCurrentChatId(newChat.id);
        setMessages([]);
        return newChat.id;
      }
    } catch (error) {
      console.error('Error creating new chat:', error);
      toast({
        title: 'Error creating new chat',
        description: 'Please try again',
        variant: 'destructive',
      });
    }
    
    return '';
  };

  const selectChat = async (chatId: string) => {
    setCurrentChatId(chatId);
    await loadMessages(chatId);
  };

  const deleteChat = async (chatId: string) => {
    if (!user) {
      // For anonymous users, just clear the messages and reset the UI
      if (currentChatId === chatId) {
        setMessages([]);
        setCurrentChatId(null);
      }
      return;
    }
    
    try {
      const success = await deleteChatInSupabase(chatId);
      
      if (success) {
        // Update local state
        setChats(chats.filter(chat => chat.id !== chatId));
        
        // If the deleted chat was the current one, select another chat or create a new one
        if (currentChatId === chatId) {
          const remainingChats = chats.filter(chat => chat.id !== chatId);
          if (remainingChats.length > 0) {
            await selectChat(remainingChats[0].id);
          } else {
            await createNewChat();
          }
        }
      } else {
        throw new Error('Failed to delete chat');
      }
    } catch (error) {
      console.error('Error deleting chat:', error);
      throw error;
    }
  };

  const sendMessage = async (content: string) => {
    // Check if user needs to log in after 2 free chats
    if (!user && freeChatsCount >= 2) {
      toast({
        title: 'Free limit reached',
        description: 'Please sign in to continue chatting',
        variant: 'default',
      });
      return;
    }
    
    // Create a new chat if needed
    let chatId = currentChatId;
    if (!chatId) {
      chatId = await createNewChat();
      if (!chatId) return;
    }
    
    // Create user message
    const userMessage: ChatMessage = {
      chat_id: chatId,
      content,
      role: 'user',
      created_at: new Date().toISOString(),
    };
    
    // Update UI immediately
    setMessages((prev) => [...prev, userMessage]);
    
    if (!user) {
      incrementFreeChatsCount();
    }
    
    try {
      // Save message to database if logged in
      if (user) {
        userMessage.user_id = user.id;
        await saveMessage(userMessage);
      }
      
      // Process with Azure AI
      setIsProcessing(true);
      
      // Prepare message history for Azure
      const messageHistory = messages
        .filter((msg) => msg.role !== 'system')
        .map((msg) => ({
          role: msg.role,
          content: msg.content,
        }));
      
      // Add the user's new message
      messageHistory.push({
        role: 'user',
        content,
      });
      
      // Add a system message at the beginning
      messageHistory.unshift({
        role: 'system',
        content: 'You are a helpful assistant. Be concise, professional, and accurate.',
      });
      
      // Generate response from Azure
      const responseText = await generateAzureResponse(messageHistory);
      
      // Create assistant message
      const assistantMessage: ChatMessage = {
        chat_id: chatId,
        content: responseText,
        role: 'assistant',
        created_at: new Date().toISOString(),
      };
      
      // Update UI
      setMessages((prev) => [...prev, assistantMessage]);
      
      // Save to database if logged in
      if (user) {
        assistantMessage.user_id = user.id;
        await saveMessage(assistantMessage);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error sending message',
        description: 'Please try again',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const value = {
    currentChatId,
    messages,
    chats,
    isProcessing,
    sendMessage,
    createNewChat,
    selectChat,
    deleteChat,
    loadingChats,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
