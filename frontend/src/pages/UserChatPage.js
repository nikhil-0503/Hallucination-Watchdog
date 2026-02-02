import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useData } from '../context/DataContext';
import ParticleBackground from '../components/ParticleBackground';

const UserChatPage = () => {
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const { user, logout } = useAuth();
  const { submitUserPrompt, isLoading } = useData();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    try {
      const response = await submitUserPrompt(currentPrompt);
      console.log('Response from backend:', response);

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
    } catch {
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
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <ParticleBackground particleCount={60} />

      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Top Navbar */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="navbar"
          style={{
            width: '100%',
            padding: 'var(--space-4) var(--space-6)',
            margin: 0,
            borderRadius: 0,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          {/* Left: Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="sidebar-brand-icon">
              <i className="fas fa-shield-alt"></i>
            </div>
            <div>
              <h1 className="navbar-title">WATCHDOG</h1>
            </div>
          </div>

          {/* Right: User info + visible logout button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <div className="user-info">
              <div className="user-avatar">
                {user?.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="user-name">{user?.email}</div>
                <div className="user-role">User</div>
              </div>
            </div>

            <motion.button
  whileHover={{ scale: 1.08 }}
  whileTap={{ scale: 0.92 }}
  onClick={handleLogout}
  title="Logout"
  style={{
    width: '42px',
    height: '42px',
    borderRadius: '10px',
    background: 'transparent',
    border: '1px solid #ef4444',
    color: '#ef4444',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.background = 'rgba(239,68,68,0.15)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.background = 'transparent';
  }}
>
  <i className="fas fa-sign-out-alt"></i>
</motion.button>

          </div>
        </motion.div>

        {/* Chat Container */}
        <div
          className="chat-container"
          style={{
            padding: 'var(--space-6)',
            paddingTop: 'var(--space-6)'
          }}
        >
          {/* Messages */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="chat-messages"
          >
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-state-icon">
                  <i className="fas fa-comments"></i>
                </div>
                <div className="empty-state-title">Start a Conversation</div>
                <div className="empty-state-description">
                  Ask anything - WATCHDOG will analyze and ensure safe responses
                </div>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`message ${msg.role}`}
                  >
                    <div className="message-avatar">
                      {msg.role === 'user'
                        ? <i className="fas fa-user"></i>
                        : <i className="fas fa-robot"></i>}
                    </div>

                    <div className="message-content">
                      <div className="message-header">
                        <span className="message-sender">
                          {msg.role === 'user' ? 'You' : 'WATCHDOG AI'}
                        </span>
                        <span className="message-time">
                          {msg.timestamp.toLocaleTimeString()}
                        </span>
                      </div>

                      <div className="message-text">
                        {msg.content}
                        {msg.warning_text && (
                          <div style={{ marginTop: '8px', color: '#f59e0b', fontWeight: 600 }}>
                            {msg.warning_text}
                          </div>
                        )}
                        <div style={{ marginTop: 'var(--space-3)' }}>
                          {msg.action && (
                            <span
                              className={`badge badge-${
                                msg.action === 'ALLOW'
                                  ? 'success'
                                  : msg.action === 'WARN'
                                  ? 'warning'
                                  : 'error'
                              }`}
                            >
                              {msg.action}
                            </span>
                          )}

                          {typeof msg.confidence === 'number' && (
                            <span style={{ marginLeft: '12px', color: '#9ca3af' }}>
                              Confidence: {msg.confidence}%
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </motion.div>

          {/* Input */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
            className="chat-input-container"
          >
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
              className="chat-input"
              rows={1}
              disabled={isLoading}
            />

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="chat-send-btn"
              disabled={isLoading || !prompt.trim()}
            >
              {isLoading ? (
                <div className="spinner" style={{ width: '24px', height: '24px' }}></div>
              ) : (
                <i className="fas fa-paper-plane"></i>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </div>
  );
};

export default UserChatPage;
