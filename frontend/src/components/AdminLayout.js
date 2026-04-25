import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  LogOut,
  User,
  BarChart3,
  AlertTriangle,
  Activity,
  Scale,
  FlaskConical,
  Globe,
  BrainCircuit,
  Users,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import ParticleBackground from './ParticleBackground';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/admin/dashboard', icon: BarChart3 },
  { id: 'logs', label: 'Activity Logs', path: '/admin/logs', icon: Activity },
  { id: 'analysis', label: 'Current Prompt', path: '/admin/current', icon: AlertTriangle },
  { id: 'bias-analysis', label: 'Bias Analysis', path: '/admin/bias-analysis', icon: Scale },
  { id: 'what-if', label: 'What-If Simulator', path: '/admin/what-if', icon: FlaskConical },
  { id: 'impact', label: 'Impact Dashboard', path: '/admin/impact', icon: Globe },
  { id: 'explainability', label: 'Explainability', path: '/admin/explainability', icon: BrainCircuit },
  { id: 'community', label: 'Community Hub', path: '/admin/community', icon: Users },
];

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const activeNav = navItems.find(item => location.pathname.startsWith(item.path))?.id || 'dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Close mobile menu on escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, []);

  return (
    <div className="admin-dashboard-layout">
      <ParticleBackground particleCount={30} />

      {/* Top Navbar */}
      <nav className="admin-navbar">
        <div className="navbar-left">
          <button
            className="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="navbar-logo" onClick={() => navigate('/admin/dashboard')} style={{ cursor: 'pointer' }}>
            <Shield size={22} className="navbar-logo-icon" />
            <span>WATCHDOG</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-user">
            <User size={14} />
            <span className="user-name">{user?.name || user?.email}</span>
            <span className="user-role-badge">Admin</span>
          </div>
          <motion.button
            className="navbar-logout"
            onClick={handleLogout}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title="Logout"
          >
            <LogOut size={16} />
          </motion.button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="mobile-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Layout Container */}
      <div className="admin-layout-container">
        {/* Left Sidebar */}
        <aside className={`admin-sidebar ${mobileOpen ? 'mobile-open' : ''}`}>
          <nav className="sidebar-nav">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.id;
              return (
                <motion.button
                  key={item.id}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                  whileHover={{ x: 4 }}
                  whileTap={{ x: 2 }}
                >
                  <Icon size={18} className="nav-icon" />
                  <span className="nav-label">{item.label}</span>
                  {isActive && (
                    <motion.div
                      className="nav-active-indicator"
                      layoutId="activeNav"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                    />
                  )}
                </motion.button>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <div className="sidebar-footer-text">
              <Shield size={14} />
              <span>WATCHDOG v1.0</span>
            </div>
            <div className="sidebar-footer-sub">AI Safety Gateway</div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-content">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="admin-page-wrapper"
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

