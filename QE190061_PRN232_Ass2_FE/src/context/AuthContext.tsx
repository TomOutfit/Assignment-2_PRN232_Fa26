import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, LoginDto, RegisterDto, AuthResponse } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  login: (dto: LoginDto) => Promise<AuthResponse>;
  register: (dto: RegisterDto) => Promise<AuthResponse>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Restore authentication state from localStorage
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');

    if (savedToken && savedUser) {
      try {
        const parsedUser: User = JSON.parse(savedUser);
        setToken(savedToken);
        setUser(parsedUser);
      } catch {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (dto: LoginDto): Promise<AuthResponse> => {
    const res = await authApi.login(dto);
    const loggedUser: User = {
      accountId: res.accountId,
      fullName: res.fullName,
      email: res.email,
      role: res.role,
      roleName: res.roleName,
    };

    localStorage.setItem('token', res.token);
    if (res.refreshToken) {
      localStorage.setItem('refreshToken', res.refreshToken);
    }
    localStorage.setItem('user', JSON.stringify(loggedUser));
    setToken(res.token);
    setUser(loggedUser);
    return res;
  };

  const register = async (dto: RegisterDto): Promise<AuthResponse> => {
    const res = await authApi.register(dto);
    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAuthenticated = !!token && !!user;
  const isAdmin = user?.role === 1 || user?.roleName === 'Admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        isAdmin,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
