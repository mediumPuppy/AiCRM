import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AuthResponse } from '../types/auth.types';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthResponse['user'] | null;
  contact: AuthResponse['contact'] | null;
  token: string | null;
  login: (token: string, userData: AuthResponse['user'] | AuthResponse['contact']) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<AuthResponse['user'] | null>(null);
  const [contact, setContact] = useState<AuthResponse['contact'] | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing auth data on mount
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('userData');
    const storedContact = localStorage.getItem('contactData');

    if (storedToken) {
      setToken(storedToken);
      // Set axios default authorization header
      axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;

      if (storedUser) {
        const userData = JSON.parse(storedUser);
        setUser(userData);
        setIsAdmin(true);
        setIsAuthenticated(true);
      } else if (storedContact) {
        const contactData = JSON.parse(storedContact);
        setContact(contactData);
        setIsAdmin(false);
        setIsAuthenticated(true);
      }
    }

    setLoading(false);
  }, []);

  const login = (newToken: string, userData: AuthResponse['user'] | AuthResponse['contact']) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;

    if (userData && 'role' in userData) {
      // User is an admin/agent
      setUser(userData);
      setContact(null);
      setIsAdmin(true);
      localStorage.setItem('userData', JSON.stringify(userData));
      localStorage.removeItem('contactData');
    } else {
      // User is a contact/customer
      setContact(userData);
      setUser(null);
      setIsAdmin(false);
      localStorage.setItem('contactData', JSON.stringify(userData));
      localStorage.removeItem('userData');
    }

    setIsAuthenticated(true);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setContact(null);
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    localStorage.removeItem('contactData');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isAdmin,
        user,
        contact,
        token,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 