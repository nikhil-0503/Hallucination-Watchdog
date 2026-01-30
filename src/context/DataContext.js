import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [prompts, setPrompts] = useState([
    {
      id: 1,
      timestamp: '2024-01-15 14:30:22',
      user: 'john.doe@company.com',
      prompt: 'Generate a financial report for Q4 2024 with projected revenue growth',
      response: 'Q4 2024 Financial Report: Revenue projected to increase by 15% based on historical data and market analysis. Key growth drivers include expanded product portfolio and improved operational efficiency.',
      confidence: 87,
      status: 'Safe',
      flagged: false,
      hallucinations: 0,
      processingTime: 2.3,
      ragStatus: 'Yes',
      contradictionCheck: 'Pass'
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:25:18',
      user: 'sarah.wilson@company.com',
      prompt: 'What are the latest FDA approvals for cancer treatments in 2025?',
      response: 'In 2025, the FDA has approved several breakthrough cancer treatments including revolutionary gene therapy protocols and advanced immunotherapy combinations.',
      confidence: 23,
      status: 'Blocked',
      flagged: true,
      hallucinations: 3,
      processingTime: 1.8,
      ragStatus: 'No',
      contradictionCheck: 'Fail'
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:20:45',
      user: 'mike.chen@company.com',
      prompt: 'Summarize the main points from yesterday\'s board meeting',
      response: 'The board meeting covered quarterly performance metrics, budget allocations for next fiscal year, strategic initiatives including market expansion, and approval of new technology investments.',
      confidence: 92,
      status: 'Safe',
      flagged: false,
      hallucinations: 0,
      processingTime: 1.2,
      ragStatus: 'Yes',
      contradictionCheck: 'Pass'
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:15:33',
      user: 'emma.davis@company.com',
      prompt: 'Create a marketing campaign for our new product launch',
      response: 'Marketing Campaign Strategy: Target audience analysis shows strong potential in the 25-45 demographic. Recommended multi-channel approach with digital focus and influencer partnerships.',
      confidence: 76,
      status: 'Warning',
      flagged: true,
      hallucinations: 1,
      processingTime: 3.1,
      ragStatus: 'Partial',
      contradictionCheck: 'Pass'
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:10:12',
      user: 'alex.johnson@company.com',
      prompt: 'Explain quantum computing principles in simple terms',
      response: 'Quantum computing leverages quantum mechanical phenomena like superposition and entanglement to process information in fundamentally different ways than classical computers, enabling exponential speedup for specific problem types.',
      confidence: 94,
      status: 'Safe',
      flagged: false,
      hallucinations: 0,
      processingTime: 2.7,
      ragStatus: 'Yes',
      contradictionCheck: 'Pass'
    },
    {
      id: 6,
      timestamp: '2024-01-15 14:05:28',
      user: 'lisa.brown@company.com',
      prompt: 'Provide investment advice for cryptocurrency market',
      response: 'Investment analysis suggests diversified portfolio approach with risk management strategies. Consider market volatility and regulatory landscape changes.',
      confidence: 68,
      status: 'Warning',
      flagged: true,
      hallucinations: 1,
      processingTime: 2.9,
      ragStatus: 'Partial',
      contradictionCheck: 'Pass'
    }
  ]);

  const [currentPrompt, setCurrentPrompt] = useState(null);
  const [systemMetrics, setSystemMetrics] = useState({
    totalPrompts: 1247,
    blockedPrompts: 89,
    averageConfidence: 78,
    uptime: '99.7%',
    responseTime: '2.1s'
  });

  const [chatMessages, setChatMessages] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

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

  const submitUserPrompt = async (message) => {
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
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock hallucination detection
      const confidence = Math.random() * 100;
      const hasHallucination = confidence < 30;
      const status = hasHallucination ? 'Blocked' : confidence < 70 ? 'Warning' : 'Safe';
      
      if (hasHallucination) {
        // Blocked response - CRITICAL: Only show system message, no AI content
        const blockedMessage = {
          id: Date.now() + 1,
          type: 'system',
          content: 'Response blocked by WATCHDOG hallucination detection',
          status: 'Blocked',
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, blockedMessage]);
        addPrompt(message, 'Response blocked by WATCHDOG', confidence, 'Blocked', true, Math.floor(Math.random() * 3) + 1);
      } else {
        // Normal response
        const aiResponse = {
          id: Date.now() + 1,
          type: 'assistant',
          content: `Here's a simulated AI response to your query about "${message}". This response has been verified as ${status.toLowerCase()} by WATCHDOG with ${Math.round(confidence)}% confidence.`,
          confidence,
          status,
          timestamp: new Date()
        };
        setChatMessages(prev => [...prev, aiResponse]);
        addPrompt(message, aiResponse.content, confidence, status, status === 'Warning', status === 'Warning' ? 1 : 0);
      }
    } catch (error) {
      console.error('Error processing prompt:', error);
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
    clearChat
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};