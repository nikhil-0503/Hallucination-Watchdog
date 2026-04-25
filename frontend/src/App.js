import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Auth pages
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

// User pages
import UserChatPage from './pages/UserChatPage';

// Admin pages
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

// Global styles (order matters: design tokens first, then component styles)
import './styles/design-system.css';
import './styles/App.css';
import './styles/login-premium.css';
import './styles/chat-premium.css';
import './styles/admin-premium.css';
import './styles/index.css';

function AppRoutes() {
  const { user, isAuthenticated } = useAuth();

  const isAdmin = isAuthenticated && user?.role === 'admin';
  const isUser = isAuthenticated && user?.role !== 'admin';

  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/login" element={
          !isAuthenticated ? <LoginPage /> : <Navigate to={isAdmin ? '/admin/dashboard' : '/chat'} replace />
        } />
        <Route path="/signup" element={
          !isAuthenticated ? <SignupPage /> : <Navigate to={isAdmin ? '/admin/dashboard' : '/chat'} replace />
        } />
        <Route path="/chat" element={
          isUser ? <UserChatPage /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin" element={
          isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/dashboard" element={
          isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/logs" element={
          isAdmin ? <ActivityLogs /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/current/:id" element={
          isAdmin ? <AdminAnalysis /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/current" element={
          isAdmin ? <AdminAnalysis /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/bias-analysis" element={
          isAdmin ? <BiasAnalysisDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/what-if" element={
          isAdmin ? <WhatIfScenarios /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/impact" element={
          isAdmin ? <ImpactDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/explainability" element={
          isAdmin ? <ExplainabilityDashboard /> : <Navigate to="/login" replace />
        } />
        <Route path="/admin/community" element={
          isAdmin ? <CommunityHub /> : <Navigate to="/login" replace />
        } />
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <div className="app" style={{ minHeight: '100vh' }}>
      <Router>
        <AuthProvider>
          <DataProvider>
            <AppRoutes />
          </DataProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;

