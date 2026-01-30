import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState('user');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password, selectedRole);
      navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/chat');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <div className="auth-logo">
          <h1 className="logo-wordmark">WATCHDOG</h1>
        </div>

        <div className="text-center mb-8">
          <h1 className="auth-title">Sign in to WATCHDOG</h1>
          <p className="auth-subtitle">Enterprise AI Safety Platform</p>
        </div>

        <div className="role-selector">
          <motion.div
            className={`role-option ${selectedRole === 'user' ? 'active' : ''}`}
            onClick={() => setSelectedRole('user')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            User
          </motion.div>
          <motion.div
            className={`role-option ${selectedRole === 'admin' ? 'active' : ''}`}
            onClick={() => setSelectedRole('admin')}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            Admin
          </motion.div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <motion.button
            type="submit"
            className="btn btn-primary btn-full"
            disabled={isLoading}
            whileHover={{ scale: 1.01, y: -1 }}
            whileTap={{ scale: 0.99 }}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              'Login'
            )}
          </motion.button>
        </form>

        <div className="auth-links">
          <a href="/signup">Create a user account</a>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;