import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { PublicUser } from '../shared/types';
import { api, getStoredToken, setStoredToken } from '../services/api';

interface AuthContextValue {
  user: PublicUser | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<PublicUser | null>>;
  login: (email: string, password: string) => Promise<PublicUser>;
  demoLogin: (email: string) => Promise<PublicUser>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    adultConfirmed: boolean;
  }) => Promise<PublicUser>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.auth.me();
      setUser(res.user);
    } catch {
      setUser(null);
      if (getStoredToken()) {
        setStoredToken(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api.auth.login({ email, password });
    setStoredToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const demoLogin = async (email: string) => {
    const res = await api.auth.demoLogin(email);
    setStoredToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const register = async (payload: {
    name: string;
    email: string;
    password: string;
    adultConfirmed: boolean;
  }) => {
    const res = await api.auth.register(payload);
    setStoredToken(res.token);
    setUser(res.user);
    return res.user;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      setStoredToken(null);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        refreshUser,
        setUser,
        login,
        demoLogin,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
