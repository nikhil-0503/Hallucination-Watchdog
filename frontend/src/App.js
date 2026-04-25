import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import all page components
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UserChatPage from './pages/UserChatPage';
import AdminDashboard from './pages/AdminDashboard';
import ActivityLogs from './pages/ActivityLogs';
import AdminAnalysis from './pages/AdminAnalysis';
import BiasAnalysisDashboard from './pages/BiasAnalysisDashboard';
import WhatIfScenarios from './pages/WhatIfScenarios';
import ImpactDashboard from './pages/ImpactDashboard';
import ExplainabilityDashboard from './pages/ExplainabilityDashboard';
import CommunityHub from './pages/CommunityHub';

// Context providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Premium Design System & Styles
import './styles/design-system.css';
import './styles/login-premium.css';
import './styles/admin-premium.css';
import './styles/chat-premium.css';
import './styles/App.css';
import './styles/index.css';
import './styles/darkMode.css';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={
        !isAuthenticated ? <LoginPage /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/chat'} replace />
      } />
      <Route path="/signup" element={
        !isAuthenticated ? <SignupPage /> : <Navigate to={user?.role === 'admin' ? '/admin/dashboard' : '/chat'} replace />
      } />
      <Route path="/chat" element={
        isAuthenticated && user?.role !== 'admin' ? <UserChatPage /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin" element={
        isAuthenticated && user?.role === 'admin' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/dashboard" element={
        isAuthenticated && user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/logs" element={
        isAuthenticated && user?.role === 'admin' ? <ActivityLogs /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/current/:id" element={
        isAuthenticated && user?.role === 'admin' ? <AdminAnalysis /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/current" element={
        isAuthenticated && user?.role === 'admin' ? <AdminAnalysis /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/bias-analysis" element={
        isAuthenticated && user?.role === 'admin' ? <BiasAnalysisDashboard /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/what-if" element={
        isAuthenticated && user?.role === 'admin' ? <WhatIfScenarios /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/impact" element={
        isAuthenticated && user?.role === 'admin' ? <ImpactDashboard /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/explainability" element={
        isAuthenticated && user?.role === 'admin' ? <ExplainabilityDashboard /> : <Navigate to="/login" replace />
      } />
      <Route path="/admin/community" element={
        isAuthenticated && user?.role === 'admin' ? <CommunityHub /> : <Navigate to="/login" replace />
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="app min-vh-100">
      <Router>
        <AuthProvider>
          <DataProvider>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="h-100"
            >
              <AnimatePresence mode="wait">
                <AppRoutes />
              </AnimatePresence>
            </motion.div>
          </DataProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;
