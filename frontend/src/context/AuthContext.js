import React, { createContext, useContext, useState } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email, password, role) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Admin credentials validation
      if (role === 'admin') {
        const adminEmail = 'admin@watchdog.ai';
        const adminPassword = 'admin123';
        
        if (email === adminEmail && password === adminPassword) {
          const userData = {
            id: Math.random().toString(36).substr(2, 9),
            email,
            role: 'admin',
            name: 'Admin'
          };
          setUser(userData);
          localStorage.setItem('watchdog_user', JSON.stringify(userData));
          return { success: true };
        } else {
          return { success: false, error: 'Invalid admin credentials' };
        }
      }
      
      // User credentials validation
      if (role === 'user' && email && password) {
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          role: 'user',
          name: email.split('@')[0]
        };
        setUser(userData);
        localStorage.setItem('watchdog_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Invalid credentials' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (email, password, confirmPassword) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (password !== confirmPassword) {
        return { success: false, error: 'Passwords do not match' };
      }
      
      if (email && password) {
        const userData = {
          id: Math.random().toString(36).substr(2, 9),
          email,
          role: 'user',
          name: email.split('@')[0]
        };
        setUser(userData);
        localStorage.setItem('watchdog_user', JSON.stringify(userData));
        return { success: true };
      } else {
        return { success: false, error: 'Please fill in all fields' };
      }
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('watchdog_user');
  };

  const checkAuthState = () => {
    const savedUser = localStorage.getItem('watchdog_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  };

  React.useEffect(() => {
    checkAuthState();
  }, []);

  const value = {
    user,
    isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};