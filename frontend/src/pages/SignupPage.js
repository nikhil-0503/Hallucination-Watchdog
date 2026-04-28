import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import ParticleBackground from '../components/ParticleBackground';
import {
  Shield,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  ArrowLeft
} from 'lucide-react';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    try {
      const result = await signup(email, password, confirmPassword);
      if (result.success) {
        navigate('/chat');
      } else {
        setError(result.error || 'Signup failed');
      }
    } catch (error) {
      setError(error.message || 'Signup failed');
    }
  };

  return (
    <div className="login-page-premium">
      <div className="login-background-premium">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>
      <ParticleBackground particleCount={50} />

      <div className="login-container-premium">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="login-card-premium"
        >
          <button
            onClick={() => navigate('/login')}
            className="btn-ghost"
            style={{
              position: 'absolute',
              top: '1.25rem',
              left: '1.25rem',
              padding: '0.5rem',
              borderRadius: 'var(--radius-md)'
            }}
          >
            <ArrowLeft size={18} />
          </button>

          <div className="login-header">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="login-icon-large"
            >
              <Shield size={40} />
            </motion.div>
            <h1 className="login-title">WATCHDOG</h1>
            <p className="login-subtitle">Create Your Account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="error-banner"
            >
              <AlertCircle size={18} />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zIndex: 2 }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zIndex: 2 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Confirm Password</label>
              <div className="password-input-wrapper">
                <Lock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)', zIndex: 2 }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="form-control"
                  style={{ paddingLeft: '2.5rem' }}
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="btn btn-primary btn-lg w-100"
              disabled={isLoading}
              style={{ marginTop: '0.5rem' }}
            >
              {isLoading ? (
                <>
                  <div className="spinner"></div>
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <UserPlus size={18} />
                  <span>Create Account</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="login-footer" style={{ marginTop: '1.5rem', paddingTop: '1.5rem' }}>
            <p>Already have an account? <a href="/login">Sign in</a></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;

