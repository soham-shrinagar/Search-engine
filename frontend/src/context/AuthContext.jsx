import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi, setUnauthorizedHandler } from '../api/client';

const AuthContext = createContext();

function persistSession({ user, token }) {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
  }, [logout]);

  useEffect(() => {
    async function restoreSession() {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const { data } = await authApi.getMe();
        setUser(data.data);
        localStorage.setItem('user', JSON.stringify(data.data));
      } catch {
        logout();
      } finally {
        setLoading(false);
      }
    }
    restoreSession();
  }, [logout]);

  const sendSignupOtp = async (email) => {
    const { data } = await authApi.sendSignupOtp(email);
    return data.data;
  };

  const verifySignupOtp = async (email, code) => {
    const { data } = await authApi.verifySignupOtp(email, code);
    persistSession(data.data);
    setUser(data.data.user);
    return data.data;
  };

  const sendLoginOtp = async (email) => {
    const { data } = await authApi.sendLoginOtp(email);
    return data.data;
  };

  const verifyLoginOtp = async (email, code) => {
    const { data } = await authApi.verifyLoginOtp(email, code);
    persistSession(data.data);
    setUser(data.data.user);
    return data.data;
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      sendSignupOtp,
      verifySignupOtp,
      sendLoginOtp,
      verifyLoginOtp,
      logout,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
