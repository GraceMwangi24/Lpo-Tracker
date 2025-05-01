// client/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect } from 'react';
import { loginRequest } from '../services/api';

// copy your decode helper
function decodeToken(token) {
  try {
    const base64 = token.split('.')[1]
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  // initialize token & user from localStorage
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user,  setUser]  = useState(() => {
    const t = localStorage.getItem('token');
    const decoded = t && decodeToken(t);
    return decoded?.sub || null;
  });

  // whenever token changes, persist & update user
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      const decoded = decodeToken(token);
      setUser(decoded?.sub || null);
    } else {
      localStorage.removeItem('token');
      setUser(null);
    }
  }, [token]);

  // login() now returns the raw JWT, so SignIn can decode immediately
  const login = async (email, password) => {
    const jwt = await loginRequest(email, password);
    setToken(jwt);
    return jwt;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
