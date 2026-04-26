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
  LogIn,
  User,
  UserCog,
  AlertCircle
} from 'lucide-react';

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
      setError(error.message || 'Login failed');
    }
  };

  const demoUsers = [
    { email: 'user@watchdog.ai', password: 'User123', role: 'user' },
    { email: 'admin@watchdog.ai', password: 'admin123', role: 'admin' }
  ];

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
              <User size={20} />
              <span>User</span>
            </motion.button>
            <motion.button
              type="button"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedRole('admin')}
              className={`role-btn-login ${selectedRole === 'admin' ? 'active' : ''}`}
            >
              <UserCog size={20} />
              <span>Admin</span>
            </motion.button>
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
                  placeholder="Enter your password"
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
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>
          </form>

          <div className="login-divider">
            <span>Demo Credentials</span>
          </div>

          <div className="demo-buttons">
            {demoUsers.map((u) => (
              <motion.button
                key={u.email}
                type="button"
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setEmail(u.email);
                  setPassword(u.password);
                  setSelectedRole(u.role);
                  setTimeout(() => {
                    handleSubmit({ preventDefault: () => {} });
                  }, 150);
                }}
                className="demo-btn"
              >
                {u.role === 'admin' ? <UserCog size={20} /> : <User size={20} />}
                <div>
                  <div className="demo-btn-title">{u.role.charAt(0).toUpperCase() + u.role.slice(1)}</div>
                  <div className="demo-btn-email">{u.email}</div>
                </div>
              </motion.button>
            ))}
          </div>

          <div className="login-footer">
            <p>Don&apos;t have an account? <a href="/signup">Sign up</a></p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;

