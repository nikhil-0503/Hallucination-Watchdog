import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Import all page components
import LoginPage from './components/LoginPage';
import SignupPage from './components/SignupPage';
import UserChatPage from './components/UserChatPage';
import AdminDashboard from './components/AdminDashboard';
import AdminAnalysis from './components/AdminAnalysis';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import './App.css';

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
      <Route path="/admin/analysis/:promptId" element={
        isAuthenticated && user?.role === 'admin' ? <AdminAnalysis /> : <Navigate to="/login" replace />
      } />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <div className="app">
      <Router>
        <AuthProvider>
          <DataProvider>
            <AnimatePresence mode="wait">
              <AppRoutes />
            </AnimatePresence>
          </DataProvider>
        </AuthProvider>
      </Router>
    </div>
  );
}

export default App;