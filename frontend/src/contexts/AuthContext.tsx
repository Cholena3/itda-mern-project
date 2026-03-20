import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, LoginData, RegisterData, AuthResponse, Permissions, Resource, Action } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  permissions: Permissions;
  can: (resource: Resource, action: Action) => boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<Permissions>({});
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  /**
   * Check if the current user has permission for a resource + action.
   * This is the main hook the UI uses to show/hide elements.
   */
  const can = useCallback(
    (resource: Resource, action: Action): boolean => {
      const resourcePerms = permissions[resource];
      if (!resourcePerms) return false;
      return resourcePerms.includes(action);
    },
    [permissions]
  );

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const userData = await authAPI.me();
          setUser(userData);
          setPermissions(userData.permissions || {});
        } catch (error) {
          localStorage.removeItem('token');
          console.error('Authentication failed:', error);
        }
      }
      setIsLoading(false);
    };
    initializeAuth();
  }, []);

  const handleAuthResponse = (response: AuthResponse) => {
    localStorage.setItem('token', response.token);
    const userData: User = {
      _id: response._id,
      username: response.username,
      email: response.email,
      role: response.role,
      department: response.department,
      createdAt: response.createdAt || new Date().toISOString(),
      updatedAt: response.updatedAt || new Date().toISOString(),
    };
    setUser(userData);
    setPermissions(response.permissions || {});
  };

  const login = async (data: LoginData): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authAPI.login(data);
      handleAuthResponse(response);
    } catch (error: any) {
      console.error('Login failed:', error);
      throw new Error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<void> => {
    try {
      setIsLoading(true);
      const response: AuthResponse = await authAPI.register(data);
      handleAuthResponse(response);
    } catch (error: any) {
      console.error('Registration failed:', error);
      throw new Error(error.response?.data?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    authAPI.logout();
    setUser(null);
    setPermissions({});
  };

  const refreshUser = async (): Promise<void> => {
    try {
      const userData = await authAPI.me();
      setUser(userData);
      setPermissions(userData.permissions || {});
    } catch (error) {
      console.error('Failed to refresh user data:', error);
      logout();
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    permissions,
    can,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
