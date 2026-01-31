import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatWithWatchdog, getAllPrompts, getPromptById as fetchPromptById } from '../services/api';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [prompts, setPrompts] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load all prompts from backend
  const loadPrompts = async () => {
    try {
      const records = await getAllPrompts();
      setPrompts(records);
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  };

  // Load initial data on mount
  useEffect(() => {
    loadPrompts();
  }, []);

  const getPromptById = async (id) => {
    try {
      const record = await fetchPromptById(id);
      setCurrentPrompt(record);
      return record;
    } catch (error) {
      console.error('Error loading prompt:', error);
      return null;
    }
  };

  const submitUserPrompt = async (message, userRole = 'user') => {
    setIsProcessing(true);
    // Add user message to chat
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: message,
      timestamp: new Date()
    };
    setChatMessages(prev => [...prev, userMessage]);

    try {
      // Call WATCHDOG backend /api/chat
      const response = await chatWithWatchdog(message, userRole);

      // Create AI message from response
      const aiMessage = {
        id: response.id,
        type: response.action === 'BLOCK' ? 'system' : 'assistant',
        content: response.user_output,
        status: response.action,
        confidence: response.confidence ? response.confidence * 100 : undefined,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, aiMessage]);
      // Reload prompts to show new record in admin dashboard
      loadPrompts();
      return response; // <-- Return the backend response for use in UserChatPage
    } catch (error) {
      console.error('Error processing prompt:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'system',
        content: 'Error processing request. Please try again.',
        status: 'Error',
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
      throw error; // <-- Rethrow so UserChatPage can handle it
    } finally {
      setIsProcessing(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
  };

  const value = {
    prompts,
    currentPrompt,
    chatMessages,
    isProcessing,
    setCurrentPrompt,
    getPromptById,
    submitUserPrompt,
    clearChat,
    loadPrompts
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};