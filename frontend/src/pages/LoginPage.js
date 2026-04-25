import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import '../styles/login-premium.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('user');
  const [error, setError] = useState('');
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const result = await login(email, password, selectedRole);
      if (result.success) {
        navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/chat');
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError(error.message || 'Login failed');
    }
  };

  const demoUsers = [
    { email: 'user@watchdog.ai', password: 'demo123', role: 'user' },
    { email: 'admin@watchdog.ai', password: 'admin123', role: 'admin' }
  ];

  const handleDemoLogin = (email, password, role) => {
    setEmail(email);
    setPassword(password);
    setSelectedRole(role);
  };

  return (
    <div className="login-page-premium">
      <div className="login-background-premium">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>
      
      <ParticleBackground particleCount={60} />
      
      <div className="login-container-premium">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="login-card-premium"
        >
          <div className="login-header">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="login-icon-large"
            >
              <i className="fas fa-shield-alt"></i>
            </motion.div>
            <h1 className="login-title">WATCHDOG</h1>
            <p className="login-subtitle">Enterprise AI Safety Platform</p>
          </div>

          <div className="role-selector-login">
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole('user')}
              className={`role-btn-login ${selectedRole === 'user' ? 'active' : ''}`}
            >
              <i className="fas fa-user"></i>
              <span>User</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole('admin')}
              className={`role-btn-login ${selectedRole === 'admin' ? 'active' : ''}`}
            >
              <i className="fas fa-lock"></i>
              <span>Admin</span>
            </motion.button>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-banner"
            >
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-control"
                required
              />
            </motion.input>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-control"
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  <i className={`fas fa-eye${showPassword ? '-slash' : ''}`}></i>
                </button>
              </div>
            </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="spinner"></div>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </>
            </motion.button>
          </form>

          <div className="login-divider">
            <span>Demo Credentials</span>
          </div>

          <div className="demo-buttons">
            {demoUsers.map((user) => (
              <motion.button
                key={user.email}
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  handleDemoLogin(user.email, user.password, user.role);
                  setTimeout(() => {
                    handleSubmit({ preventDefault: () => {} });
                  }, 100);
                }}
                className="demo-btn"
              >
                <i className={`fas fa-${user.role === 'admin' ? 'user-tie' : 'user'}`}></i>
                <div>
                  <div className="demo-btn-title">{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</div>
                  <div className="demo-btn-email">{user.email}</div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="login-footer">
            <p>Don't have an account? <a href="/signup">Sign up</a></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
