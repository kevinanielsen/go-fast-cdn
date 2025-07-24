import {
  IAuthResponse,
  IChangePasswordRequest,
  ILoginRequest,
  IRefreshTokenRequest,
  IRegisterRequest,
} from "@/types/auth";
import { TUser } from "@/types/user";
import axios, { AxiosResponse } from "axios";

const API_BASE_URL = "/api/auth";

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/refresh`, {
            refresh_token: refreshToken,
          });

          const {
            access_token,
            refresh_token: newRefreshToken,
            user,
          } = response.data;
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem("user", JSON.stringify(user));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return apiClient(originalRequest);
        }
      } catch {
        // Refresh failed, clear auth data and redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async login(data: ILoginRequest): Promise<IAuthResponse> {
    const response: AxiosResponse<IAuthResponse> = await apiClient.post(
      "/login",
      data
    );
    return response.data;
  },

  async register(data: IRegisterRequest): Promise<IAuthResponse> {
    const response: AxiosResponse<IAuthResponse> = await apiClient.post(
      "/register",
      data
    );
    return response.data;
  },

  async refreshToken(data: IRefreshTokenRequest): Promise<IAuthResponse> {
    const response: AxiosResponse<IAuthResponse> = await apiClient.post(
      "/refresh",
      data
    );
    return response.data;
  },

  async logout(data: IRefreshTokenRequest): Promise<void> {
    await apiClient.post("/logout", data);
  },

  async getProfile(): Promise<TUser> {
    const response: AxiosResponse<TUser> = await apiClient.get("/profile");
    return response.data;
  },

  async changePassword(data: IChangePasswordRequest): Promise<void> {
    await apiClient.put("/change-password", data);
  },

  // 2FA methods
  async setup2FA(data: {
    enable: boolean;
    token?: string;
  }): Promise<{ secret: string; otpauth_url: string }> {
    const response = await apiClient.post("/2fa", data);
    return response.data;
  },

  async verify2FA(data: { token: string }): Promise<void> {
    await apiClient.post("/2fa/verify", data);
  },
};

// CDN API client with auth
export const cdnApiClient = axios.create({
  baseURL: "/api/cdn",
});

// Add auth header to CDN requests
cdnApiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token refresh for CDN requests
cdnApiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post("/api/auth/refresh", {
            refresh_token: refreshToken,
          });

          const {
            access_token,
            refresh_token: newRefreshToken,
            user,
          } = response.data;
          localStorage.setItem("accessToken", access_token);
          localStorage.setItem("refreshToken", newRefreshToken);
          localStorage.setItem("user", JSON.stringify(user));

          // Retry original request with new token
          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return cdnApiClient(originalRequest);
        }
      } catch {
        // Refresh failed, clear auth data
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);
