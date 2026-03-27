import { createContext, useContext, useEffect, useMemo, useState } from 'react';

import authService from '../services/authService.js';
import { disconnectSocket } from '../services/socket.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await authService.getCurrentUser();
      setUser(response.user);
    } catch (_error) {
      setUser(null);
    } finally {
      setBootstrapping(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (payload) => {
    const response = await authService.login(payload);
    setUser(response.user);
    return response;
  };

  const register = async (payload) => {
    const response = await authService.register(payload);
    setUser(response.user);
    return response;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      disconnectSocket();
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      bootstrapping,
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, bootstrapping],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider.');
  }

  return context;
};
