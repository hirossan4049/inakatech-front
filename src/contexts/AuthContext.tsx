import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient, type UserLogin, type UserRegister } from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  login: (credentials: UserLogin) => Promise<void>;
  register: (userData: UserRegister) => Promise<{ message: string; user_id: number }>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    if (savedToken) {
      setToken(savedToken);
      apiClient.setToken(savedToken);
    }
    setLoading(false);
  }, []);

  const login = async (credentials: UserLogin) => {
    try {
      const response = await apiClient.login(credentials);
      setToken(response.access_token);
      apiClient.setToken(response.access_token);
    } catch (error) {
      throw error;
    }
  };

  const register = async (userData: UserRegister) => {
    try {
      const response = await apiClient.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    setToken(null);
    apiClient.clearToken();
  };

  const value: AuthContextType = {
    isAuthenticated: !!token,
    token,
    login,
    register,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}