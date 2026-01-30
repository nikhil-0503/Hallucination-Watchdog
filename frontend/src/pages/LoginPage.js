import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

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
      <ParticleBackground particleCount={80} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="auth-card"
      >
        <div className="auth-header">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="auth-icon"
          >
            <i className="fas fa-shield-alt"></i>
          </motion.div>
          <h1 className="auth-title">WATCHDOG</h1>
          <p className="auth-subtitle">Enterprise AI Safety Platform</p>
        </div>

        <div className="role-selector">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('user')}
            className={`role-btn ${selectedRole === 'user' ? 'active' : ''}`}
          >
            <i className="fas fa-user"></i>
            <span>User</span>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedRole('admin')}
            className={`role-btn ${selectedRole === 'admin' ? 'active' : ''}`}
          >
            <i className="fas fa-shield-alt"></i>
            <span>Admin</span>
          </motion.div>
        </div>

        <form onSubmit={handleSubmit}>
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
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="form-control"
              required
            />
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
            )}
          </motion.button>
        </form>

        <div className="text-center" style={{ marginTop: 'var(--space-6)' }}>
          <a href="/signup" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>
            Don't have an account? <strong style={{ color: 'var(--color-brand-blue-light)' }}>Sign up</strong>
          </a>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          style={{
            marginTop: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'rgba(15, 23, 42, 0.5)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-border)'
          }}
        >
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-tertiary)', marginBottom: 'var(--space-2)', textAlign: 'center' }}>
            <strong>Demo Credentials</strong>
          </p>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            <div style={{ marginBottom: 'var(--space-2)' }}>
              <strong style={{ color: 'var(--color-brand-blue-light)' }}>Admin:</strong> admin@watchdog.ai / admin123
            </div>
            <div>
              <strong style={{ color: 'var(--color-brand-blue-light)' }}>User:</strong> user@test.com / user123
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
