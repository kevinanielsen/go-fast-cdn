import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthResponse } from '@/types/auth';
import { authService } from '../services/authService';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, twoFAToken?: string) => Promise<{ success: boolean; requires2FA?: boolean }>;
  register: (email: string, password: string, role?: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  refreshUserProfile: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem('accessToken');
      const storedUser = localStorage.getItem('user');
        if (storedToken && storedUser) {
        // Verify token is still valid by making a profile request
        try {
          const profile = await authService.getProfile();
          setUser(profile);
        } catch (error) {
          // Token might be expired, try to refresh
          if (await refreshToken()) {
            const profile = await authService.getProfile();
            setUser(profile);
          } else {
            clearAuthData();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuthData();
    } finally {
      setIsLoading(false);
    }
  };
  const login = async (email: string, password: string, twoFAToken?: string): Promise<{ success: boolean; requires2FA?: boolean }> => {
    try {
      setIsLoading(true);
      const loginData: any = { email, password };
      if (twoFAToken) {
        loginData.two_fa_token = twoFAToken;
      }
      
      const response = await authService.login(loginData);
      setAuthData(response);
      toast.success('Login successful!');
      return { success: true };
    } catch (error: any) {
      const errorData = error.response?.data;
      if (errorData?.requires_2fa) {
        return { success: false, requires2FA: true };
      }
      
      toast.error(errorData?.error || 'Login failed');
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, role?: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const response = await authService.register({ email, password, role });
      setAuthData(response);
      toast.success('Registration successful!');
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Registration failed');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await authService.logout({ refresh_token: refreshToken });
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      clearAuthData();
      toast.success('Logged out successfully');
    }
  };
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem('refreshToken');
      if (!storedRefreshToken) {
        return false;
      }
      
      const response = await authService.refreshToken({ refresh_token: storedRefreshToken });
      setAuthData(response);
      return true;
    } catch (error) {
      clearAuthData();
      return false;
    }
  };
  const refreshUserProfile = async (): Promise<boolean> => {
    try {
      console.log("[DEBUG] AuthContext - Fetching fresh user profile...");
      const profile = await authService.getProfile();
      console.log("[DEBUG] AuthContext - Got profile from API:", profile);
      setUser(profile);
      localStorage.setItem('user', JSON.stringify(profile));
      console.log("[DEBUG] AuthContext - Updated user state and localStorage");
      return true;
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
      return false;
    }
  };

  const setAuthData = (authResponse: AuthResponse) => {
    const { user, access_token, refresh_token } = authResponse;
    localStorage.setItem('accessToken', access_token);
    localStorage.setItem('refreshToken', refresh_token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const clearAuthData = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };
  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
    refreshToken,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
