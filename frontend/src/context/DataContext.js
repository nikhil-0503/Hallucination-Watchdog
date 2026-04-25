import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { chatWithWatchdog, getAllPrompts, getPromptById as fetchPromptById, getDashboardStats } from '../services/api';

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
  const [stats, setStats] = useState({
    total: 0, blocked: 0, warned: 0, allowed: 0,
    avgConfidence: 0, blockRate: 0, allowRate: 0
  });

  const loadPrompts = useCallback(async () => {
    try {
      const records = await getAllPrompts();
      setPrompts(records);
    } catch (error) {
      console.error('Error loading prompts:', error);
    }
  }, []);

  const loadStats = useCallback(async () => {
    try {
      const s = await getDashboardStats();
      setStats({
        total: s.total || 0,
        blocked: s.blocked || 0,
        warned: s.warned || 0,
        allowed: s.allowed || 0,
        avgConfidence: Math.round((s.avg_confidence || 0) * 100),
        blockRate: Math.round((s.block_rate || 0) * 100),
        allowRate: Math.round((s.allow_rate || 0) * 100),
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  useEffect(() => {
    loadPrompts();
    loadStats();
  }, [loadPrompts, loadStats]);

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
        warning_text: response.warning_text || undefined,
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
    stats,
    setCurrentPrompt,
    getPromptById,
    submitUserPrompt,
    clearChat,
    loadPrompts,
    loadStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};