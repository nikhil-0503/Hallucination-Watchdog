import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    try {
      await signup(email, password);
      navigate('/chat');
    } catch (error) {
      console.error('Signup failed:', error);
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
            <i className="fas fa-user-plus"></i>
          </motion.div>
          <h1 className="auth-title">WATCHDOG</h1>
          <p className="auth-subtitle">Create Your Account</p>
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
              placeholder="Create a password"
              className="form-control"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Confirm Password</label>
            <motion.input
              whileFocus={{ scale: 1.01 }}
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
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
                <span>Creating account...</span>
              </>
            ) : (
              <>
                <i className="fas fa-user-plus"></i>
                <span>Create Account</span>
              </>
            )}
          </motion.button>
        </form>

        <div className="text-center" style={{ marginTop: 'var(--space-6)' }}>
          <a href="/" style={{ color: 'var(--color-text-tertiary)', textDecoration: 'none' }}>
            Already have an account? <strong style={{ color: 'var(--color-brand-blue-light)' }}>Sign in</strong>
          </a>
        </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
