import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import { toISTTime } from '../utils/timezone';
import ParticleBackground from '../components/ParticleBackground';
import {
  Shield,
  Send,
  Trash2,
  LogOut,
  User,
  Bot,
  CheckCircle2,
  AlertTriangle,
  Ban,
  Sparkles,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

const UserChatPage = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const { user, logout } = useAuth();
  const { submitUserPrompt, isLoading } = useData();
  const navigate = useNavigate();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleClearChat = () => {
    setMessages([]);
    setPrompt('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: prompt,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentPrompt = prompt;
    setPrompt('');
    setIsTyping(true);

    try {
      const response = await submitUserPrompt(currentPrompt);
      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: response.user_output || response.message || 'Response received',
        timestamp: new Date(),
        action: response.action,
        confidence: response.confidence ? Math.round(response.confidence * 100) : undefined,
        warning_text: response.warning_text || undefined
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
          isError: true
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getStatusIcon = (action) => {
    switch (action) {
      case 'ALLOW': return <CheckCircle2 size={14} />;
      case 'WARN': return <AlertTriangle size={14} />;
      case 'BLOCK': return <Ban size={14} />;
      default: return <ShieldCheck size={14} />;
    }
  };

  return (
    <div className="chat-page-premium">
      <ParticleBackground particleCount={30} />

      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="chat-header-premium"
      >
        <div className="chat-header-left">
          <div className="chat-logo-minimal">
            <Shield size={20} className="chat-logo-icon" />
            <span>WATCHDOG</span>
          </div>
          <div className="chat-status">
            <span className="status-dot"></span>
            <span>Live &middot; AI Safety Gateway</span>
          </div>
        </div>

        <div className="chat-header-right">
          <div className="chat-user-info">
            <div className="chat-user-avatar">
              <User size={14} />
            </div>
            <span className="chat-user-name">{user?.email}</span>
          </div>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearChat}
            title="Clear Chat"
            className="btn-chat-action"
          >
            <Trash2 size={16} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            title="Logout"
            className="btn-chat-logout"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </motion.header>

      {/* Messages */}
      <div className="chat-messages-container">
        <div className="chat-messages-premium">
          {messages.length === 0 ? (
            <div className="chat-empty-state">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring' }}
                className="empty-state-icon-large"
              >
                <Sparkles size={48} />
              </motion.div>
              <h2>Start a Conversation</h2>
              <p>Ask me anything &ndash; WATCHDOG will analyze the response for safety, bias, and accuracy</p>
              <div className="empty-state-hints">
                <div className="hint-card">
                  <ShieldCheck size={22} />
                  <span>Safe & Verified Responses</span>
                </div>
                <div className="hint-card">
                  <Shield size={22} />
                  <span>Real-Time Risk Analysis</span>
                </div>
                <div className="hint-card">
                  <BarChart3 size={22} />
                  <span>Confidence Scoring</span>
                </div>
              </div>
            </div>
          ) : (
            <AnimatePresence>
              {messages.map((msg, index) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.03 * index }}
                  className={`message-bubble ${msg.role}`}
                >
                  <div className="message-bubble-header">
                    <div className="message-bubble-avatar">
                      {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                    </div>
                    <div className="message-bubble-meta">
                      <span className="message-bubble-sender">
                        {msg.role === 'user' ? 'You' : 'WATCHDOG AI'}
                      </span>
                      <span className="message-bubble-time">
                      {toISTTime(msg.timestamp)}
                      </span>
                    </div>
                  </div>

                  <div className="message-bubble-content">
                    {msg.content}
                  </div>

                  {msg.role === 'assistant' && (
                    <div className="message-bubble-footer">
                      {msg.action && (
                        <div className={`status-badge status-${msg.action.toLowerCase()}`}>
                          {getStatusIcon(msg.action)}
                          <span>{msg.action}</span>
                        </div>
                      )}

                      {msg.confidence !== undefined && (
                        <div className="confidence-indicator">
                          <span className="confidence-label">Confidence</span>
                          <div className="confidence-bar">
                            <motion.div
                              className={`confidence-fill confidence-${
                                msg.confidence >= 80 ? 'high' :
                                msg.confidence >= 50 ? 'medium' :
                                'low'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${msg.confidence}%` }}
                              transition={{ duration: 0.6 }}
                            />
                          </div>
                          <span className="confidence-value">{msg.confidence}%</span>
                        </div>
                      )}

                      {msg.warning_text && (
                        <div className="warning-box">
                          <AlertTriangle size={14} />
                          <span>{msg.warning_text}</span>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="message-bubble assistant"
            >
              <div className="message-bubble-header">
                <div className="message-bubble-avatar">
                  <Bot size={14} />
                </div>
                <div className="message-bubble-meta">
                  <span className="message-bubble-sender">WATCHDOG AI</span>
                </div>
              </div>
              <div className="message-bubble-content typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="chat-input-area-premium"
      >
        <form onSubmit={handleSubmit} className="chat-form-premium">
          <div className="chat-input-wrapper">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              placeholder="Type your message... (Shift+Enter for new line)"
              className="chat-textarea-premium"
              disabled={isLoading}
              rows={2}
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="btn-send-premium"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <div className="send-spinner" />
              ) : (
                <Send size={18} />
              )}
            </motion.button>
          </div>
          <div className="chat-input-hint">
            <span>WATCHDOG analyzes every response for safety and accuracy</span>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default UserChatPage;

