import React, { createContext, useContext, ReactNode } from "react";
import { authService } from "../services/authService";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { IErrorResponse } from "@/types/response";
import { TRole, TUser } from "@/types/user";
import { IAuthResponse } from "@/types/auth";

interface AuthContextType {
  user: TUser | undefined;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    email: string,
    password: string,
    twoFAToken?: string
  ) => Promise<{ success: boolean; requires2FA?: boolean }>;
  register: (email: string, password: string, role?: TRole) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const {
    data: user,
    isLoading: profileQueryIsLoading,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => authService.getProfile(),
    enabled:
      !!localStorage.getItem("accessToken") &&
      !!localStorage.getItem("refreshToken"),
  });

  const mutationLogin = useMutation({
    mutationFn: (payload: {
      email: string;
      password: string;
      twoFAToken?: string;
    }) => {
      return authService.login({
        email: payload.email,
        password: payload.password,
        two_fa_token: payload.twoFAToken,
      });
    },
  });

  const mutationRegister = useMutation({
    mutationFn: (payload: {
      email: string;
      password: string;
      role?: TRole;
    }) => {
      return authService.register({
        email: payload.email,
        password: payload.password,
        role: payload.role,
      });
    },
  });

  const mutationLogout = useMutation({
    mutationFn: (payload: { refresh_token: string }) => {
      return authService.logout(payload);
    },
  });

  const login = async (
    email: string,
    password: string,
    twoFAToken?: string
  ): Promise<{ success: boolean; requires2FA?: boolean }> => {
    try {
      const response = await mutationLogin.mutateAsync({
        email,
        password,
        twoFAToken,
      });
      setAuthData(response);
      toast.success("Login successful!");
      return { success: true };
    } catch (error) {
      const errorResponse = error as AxiosError<IErrorResponse>;
      const errorData = errorResponse.response?.data;
      if (errorData?.requires_2fa) {
        return { success: false, requires2FA: true };
      }
      toast.error(errorData?.error || "Login failed");
      return { success: false };
    }
  };

  const register = async (
    email: string,
    password: string,
    role?: TRole
  ): Promise<boolean> => {
    try {
      const response = await mutationRegister.mutateAsync({
        email,
        password,
        role,
      });
      setAuthData(response);
      toast.success("Registration successful!");
      return true;
    } catch (error) {
      const errorResponse = error as AxiosError<IErrorResponse>;
      toast.error(errorResponse.response?.data.error || "Registration failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        await mutationLogout.mutateAsync({ refresh_token: refreshToken });
      }
    } catch {
      // Ignore logout errors
    } finally {
      clearAuthData();
      toast.success("Logged out successfully");
      window.location.href = "/login"; // Redirect to login page
    }
  };
  const refreshToken = async (): Promise<boolean> => {
    try {
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (!storedRefreshToken) {
        return false;
      }

      const response = await authService.refreshToken({
        refresh_token: storedRefreshToken,
      });
      setAuthData(response);
      return true;
    } catch {
      clearAuthData();
      return false;
    }
  };
  const refreshUserProfile = async (): Promise<void> => {
    await refetch();
  };

  const setAuthData = (authResponse: IAuthResponse) => {
    const { user, access_token, refresh_token } = authResponse;
    localStorage.setItem("accessToken", access_token);
    localStorage.setItem("refreshToken", refresh_token);
    localStorage.setItem("user", JSON.stringify(user));
    refetch(); // Refetch user profile after setting auth data
  };

  const clearAuthData = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading:
      profileQueryIsLoading ||
      mutationLogin.isPending ||
      mutationRegister.isPending,
    login,
    register,
    logout,
    refreshToken,
    refreshUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
