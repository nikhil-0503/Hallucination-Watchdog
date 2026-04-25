import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
  Users
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

  const activeNav = navItems.find(item => location.pathname.startsWith(item.path))?.id || 'dashboard';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="admin-dashboard-layout" style={{ position: 'relative' }}>
      <ParticleBackground particleCount={40} />

      {/* Top Navbar */}
      <nav className="admin-navbar" style={{ position: 'relative', zIndex: 100 }}>
        <div className="navbar-left">
          <div className="navbar-logo">
            <Shield size={24} />
            <span>WATCHDOG</span>
          </div>
        </div>

        <div className="navbar-right">
          <div className="navbar-user">
            <User size={16} />
            <span className="user-name">{user?.name || user?.email}</span>
            <span className="user-role">Administrator</span>
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

      {/* Main Layout Container */}
      <div className="admin-layout-container">
        {/* Left Sidebar */}
        <aside className="admin-sidebar">
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
                  style={{
                    color: isActive ? '#60a5fa' : '#000',
                    background: isActive ? '#1e3a4c' : '#e5e7eb',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    width: '100%',
                    padding: '0.75rem 1rem',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: 500,
                    marginBottom: '0.5rem',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="admin-main-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

