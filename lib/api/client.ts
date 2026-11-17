import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

// API Base URL - configurable via environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000";

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds
});

// Token management
let accessToken: string | null = null;
let refreshToken: string | null = null;

// Initialize tokens from localStorage (client-side only)
export const initializeTokens = () => {
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
    refreshToken = localStorage.getItem("refreshToken");
  }
};

// Set tokens
export const setTokens = (access: string, refresh: string, userRole?: string) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== "undefined") {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
    
    // Also set cookies for middleware access
    document.cookie = `accessToken=${access}; path=/; max-age=${60 * 60 * 24 * 7}`; // 7 days
    if (userRole) {
      document.cookie = `userRole=${userRole}; path=/; max-age=${60 * 60 * 24 * 7}`;
    }
  }
};

// Clear tokens
export const clearTokens = () => {
  accessToken = null;
  refreshToken = null;
  if (typeof window !== "undefined") {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    
    // Also clear cookies
    document.cookie = "accessToken=; path=/; max-age=0";
    document.cookie = "userRole=; path=/; max-age=0";
  }
};

// Get current access token
export const getAccessToken = () => accessToken;

// Get current refresh token
export const getRefreshToken = () => refreshToken;

// Request interceptor to add auth header
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Initialize tokens if not already done
    if (!accessToken && typeof window !== "undefined") {
      initializeTokens();
    }
    
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
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
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // If 401 and we have a refresh token, try to refresh
    if (error.response?.status === 401 && refreshToken && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const response = await axios.post(`${API_BASE_URL}/api/v1/auth/refresh`, {
          refreshToken,
        });
        
        const { token, refreshToken: newRefreshToken } = response.data;
        setTokens(token, newRefreshToken);
        
        // Retry the original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${token}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and redirect to login
        clearTokens();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

// API Error type
export interface ApiError {
  message: string;
  code: string;
  errors?: Record<string, string[]>;
  detail?: string;
}

// Helper to extract error message
export const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError;
    return apiError?.message || error.message || "An error occurred";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "An unknown error occurred";
};

export default apiClient;
