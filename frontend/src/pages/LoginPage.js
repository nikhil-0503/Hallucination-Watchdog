import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: 'var(--color-bg-primary)' }}>
      <ParticleBackground particleCount={80} />
      
      <div style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 'var(--space-6)', width: '100%' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="auth-card"
          style={{ width: '100%', maxWidth: '480px' }}
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

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: 'var(--space-3) var(--space-4)',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: 'var(--space-4)'
            }}
          >
            {error}
          </motion.div>
        )}

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
    </div>
  );
};

export default LoginPage;
