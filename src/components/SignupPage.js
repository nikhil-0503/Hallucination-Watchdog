import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Lock, Eye, EyeOff, AlertCircle, Shield, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { signup, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number';
    }
    
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const result = await signup(formData.email, formData.password, formData.confirmPassword);
    
    if (result.success) {
      navigate('/chat');
    } else {
      setErrors({ submit: result.error });
    }
  };

  const getPasswordStrength = (password) => {
    if (password.length === 0) return { strength: 0, label: '', color: 'var(--border-subtle)' };
    if (password.length < 6) return { strength: 1, label: 'Weak', color: 'var(--status-blocked)' };
    if (password.length < 8) return { strength: 2, label: 'Fair', color: 'var(--status-warning)' };
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) return { strength: 2, label: 'Fair', color: 'var(--status-warning)' };
    return { strength: 3, label: 'Strong', color: 'var(--status-safe)' };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  return (
    <div className="auth-container">
      <motion.div 
        className="auth-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0.0, 0.2, 1] }}
      >
        <div className="auth-header">
          <motion.div 
            className="logo-container"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          >
            <Shield className="logo-icon" />
          </motion.div>
          <h1>WATCHDOG</h1>
          <p>Create User Account</p>
        </div>

        <motion.div 
          className="admin-notice"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <Info size={16} />
          <span>Admin accounts are provisioned internally.</span>
        </motion.div>

        <form onSubmit={handleSubmit} className="auth-form">
          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <label htmlFor="email">Email Address</label>
            <div className="input-group">
              <Mail className="input-icon" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={errors.email ? 'error' : ''}
                placeholder="Enter your email"
                autoComplete="email"
              />
            </div>
            {errors.email && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={14} />
                {errors.email}
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <label htmlFor="password">Password</label>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={errors.password ? 'error' : ''}
                placeholder="Create a strong password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            
            {formData.password && (
              <motion.div 
                className="password-strength"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="strength-bar">
                  <motion.div 
                    className="strength-fill"
                    style={{ 
                      backgroundColor: passwordStrength.color,
                      width: `${(passwordStrength.strength / 3) * 100}%`
                    }}
                    initial={{ width: 0 }}
                    animate={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <span style={{ color: passwordStrength.color }}>{passwordStrength.label}</span>
              </motion.div>
            )}
            
            {errors.password && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={14} />
                {errors.password}
              </motion.div>
            )}
          </motion.div>

          <motion.div 
            className="form-group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-group">
              <Lock className="input-icon" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={errors.confirmPassword ? 'error' : ''}
                placeholder="Confirm your password"
                autoComplete="new-password"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <motion.div 
                className="error-message"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={14} />
                {errors.confirmPassword}
              </motion.div>
            )}
          </motion.div>

          {errors.submit && (
            <motion.div 
              className="submit-error"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <AlertCircle size={16} />
              {errors.submit}
            </motion.div>
          )}

          <motion.button
            type="submit"
            className="primary-button"
            disabled={isLoading}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            {isLoading ? (
              <div className="loading-spinner" />
            ) : (
              <>
                <UserPlus size={16} />
                Create Account
              </>
            )}
          </motion.button>

          <motion.div 
            className="auth-links"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
          >
            <span>Already have an account? </span>
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/login')}
            >
              Sign in here
            </button>
          </motion.div>
        </form>

        <motion.div 
          className="password-requirements"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.5 }}
        >
          <h4>Password Requirements:</h4>
          <ul>
            <motion.li 
              className={formData.password.length >= 8 ? 'met' : ''}
              animate={{ color: formData.password.length >= 8 ? 'var(--status-safe)' : 'var(--text-tertiary)' }}
            >
              At least 8 characters
            </motion.li>
            <motion.li 
              className={/[A-Z]/.test(formData.password) ? 'met' : ''}
              animate={{ color: /[A-Z]/.test(formData.password) ? 'var(--status-safe)' : 'var(--text-tertiary)' }}
            >
              One uppercase letter
            </motion.li>
            <motion.li 
              className={/[a-z]/.test(formData.password) ? 'met' : ''}
              animate={{ color: /[a-z]/.test(formData.password) ? 'var(--status-safe)' : 'var(--text-tertiary)' }}
            >
              One lowercase letter
            </motion.li>
            <motion.li 
              className={/\d/.test(formData.password) ? 'met' : ''}
              animate={{ color: /\d/.test(formData.password) ? 'var(--status-safe)' : 'var(--text-tertiary)' }}
            >
              One number
            </motion.li>
          </ul>
        </motion.div>

        <motion.div 
          className="security-notice"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
        >
          <Shield size={14} />
          <span>WATCHDOG — Real-time AI output control</span>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default SignupPage;