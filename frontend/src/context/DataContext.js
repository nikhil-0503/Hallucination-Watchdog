import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatWithWatchdog, getSystemMetrics, getAuditLog } from '../services/api';

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
  const [systemMetrics, setSystemMetrics] = useState({
    totalPrompts: 0,
    blockedPrompts: 0,
    averageConfidence: 0,
    uptime: '0%',
    responseTime: '0s'
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load initial data
  useEffect(() => {
    loadSystemMetrics();
    loadAuditLog();
  }, []);

  const loadSystemMetrics = async () => {
    try {
      const metrics = await getSystemMetrics();
      setSystemMetrics(metrics);
    } catch (error) {
      console.error('Error loading system metrics:', error);
    }
  };

  const loadAuditLog = async () => {
    try {
      const auditData = await getAuditLog();
      setPrompts(auditData);
    } catch (error) {
      console.error('Error loading audit log:', error);
    }
  };

  const addPrompt = (prompt, response, confidence, status, flagged, hallucinations) => {
    const newPrompt = {
      id: prompts.length + 1,
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      user: 'current.user@company.com',
      prompt,
      response,
      confidence,
      status,
      flagged,
      hallucinations,
      processingTime: Math.random() * 3 + 0.5
    };
    setPrompts(prev => [newPrompt, ...prev]);
    return newPrompt;
  };

  const updatePromptStatus = (id, newStatus) => {
    setPrompts(prev => prev.map(prompt => 
      prompt.id === id ? { ...prompt, status: newStatus } : prompt
    ));
  };

  const getPromptById = (id) => {
    return prompts.find(prompt => prompt.id === parseInt(id));
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
      // Call WATCHDOG API
      const aiResponse = await chatWithWatchdog(message, userRole);
      setChatMessages(prev => [...prev, aiResponse]);
      
      // Add to prompts for admin view
      addPrompt(
        message, 
        aiResponse.content, 
        aiResponse.confidence || Math.random() * 100,
        aiResponse.status,
        aiResponse.status !== 'Safe',
        aiResponse.status === 'BLOCK' ? Math.floor(Math.random() * 3) + 1 : 0
      );
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
    systemMetrics,
    chatMessages,
    isProcessing,
    setCurrentPrompt,
    addPrompt,
    updatePromptStatus,
    getPromptById,
    submitUserPrompt,
    clearChat,
    loadSystemMetrics,
    loadAuditLog
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};