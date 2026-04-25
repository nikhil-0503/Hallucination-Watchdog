import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Shield, LogIn, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

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
      await login(email, password, selectedRole);
      navigate(selectedRole === 'admin' ? '/admin/dashboard' : '/chat');
    } catch (error) {
      setError('Invalid credentials. Please try again.');
      console.error('Login failed:', error);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },
  };

  return (
    <div className="login-page-premium">
      {/* Animated Background */}
      <div className="login-background-premium">
        <div className="gradient-blob blob-1"></div>
        <div className="gradient-blob blob-2"></div>
        <div className="gradient-blob blob-3"></div>
      </div>

      {/* Main Content */}
      <div className="login-container-premium">
        <motion.div
          className="login-card-premium"
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
        >
          {/* Header */}
          <motion.div
            className="login-header-premium"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div className="login-logo-premium" variants={itemVariants}>
              <Shield size={48} />
            </motion.div>
            <motion.h1 className="login-title-premium" variants={itemVariants}>
              WATCHDOG
            </motion.h1>
            <motion.p className="login-subtitle-premium" variants={itemVariants}>
              Enterprise AI Safety Platform
            </motion.p>
          </motion.div>

          {/* Welcome Text */}
          <motion.div
            className="login-welcome-premium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p>Real-time AI Risk Analysis & Enforcement</p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              className="alert-premium alert-error"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle size={16} />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Role Selection */}
          <div className="role-selector-premium">
            <label className="role-label-premium">Sign In As</label>
            <div className="role-buttons-premium">
              {[
                { value: 'user', label: 'User', icon: User },
                { value: 'admin', label: 'Admin', icon: Shield },
              ].map((role) => (
                <motion.button
                  key={role.value}
                  className={`role-button-premium ${selectedRole === role.value ? 'active' : ''}`}
                  onClick={() => setSelectedRole(role.value)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <role.icon size={20} />
                  <span>{role.label}</span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form-premium">
            {/* Email Field */}
            <div className="form-group-premium">
              <label className="form-label-premium">Email Address</label>
              <div className="form-input-wrapper-premium">
                <input
                  className="form-input-premium"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group-premium">
              <label className="form-label-premium">Password</label>
              <div className="form-input-wrapper-premium">
                <input
                  className="form-input-premium"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  disabled={isLoading}
                />
                <motion.button
                  type="button"
                  className="btn-toggle-password-premium"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </motion.button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="btn-login-premium"
              disabled={isLoading}
              whileHover={{ scale: 1.01, y: -2 }}
              whileTap={{ scale: 0.99 }}
            >
              {isLoading ? (
                <div className="spinner-premium">
                  <div className="spinner-ring-premium"></div>
                </div>
              ) : (
                <>
                  <LogIn size={20} />
                  <span>Sign In</span>
                </>
              )}
            </motion.button>
          </form>

          {/* Demo Credentials */}
          <motion.div
            className="demo-info-premium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="demo-label">Demo Credentials:</p>
            <div className="demo-credentials-premium">
              <div className="credential-row">
                <span className="label">Admin:</span>
                <code>admin@watchdog.ai / Admin123!</code>
              </div>
              <div className="credential-row">
                <span className="label">User:</span>
                <code>user@watchdog.ai / User123!</code>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
          <a href="/signup">Create a user account</a>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;