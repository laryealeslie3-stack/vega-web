import apiClient, { setTokens, clearTokens, getRefreshToken, getApiErrorMessage } from "./client";

// User roles as defined by the API
export type UserRole = "user" | "vendor" | "serviceBoy" | "admin";

// User type from API response
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  mustChangePassword: boolean;
}

// Auth response type
export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Login request
export interface LoginRequest {
  email: string;
  password: string;
  role?: UserRole; // Optional, API will return error if role doesn't match
}

// Register request
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
  role?: "user"; // Only customers can self-register
}

// Auth service
export const authService = {
  /**
   * Login with email and password
   * The API returns the user's role which determines which portal to show
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", credentials);
    const { user, token, refreshToken } = response.data;
    
    // Store tokens (including role for middleware)
    setTokens(token, refreshToken, user.role);
    
    // Store user in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    return response.data;
  },

  /**
   * Login with Google (for customers only)
   */
  async loginWithGoogle(idToken: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/google", { idToken });
    const { user, token, refreshToken } = response.data;
    
    // Store tokens (including role for middleware)
    setTokens(token, refreshToken, user.role);
    
    // Store user in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    return response.data;
  },

  /**
   * Register a new customer account
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/register", data);
    const { user, token, refreshToken } = response.data;
    
    // Store tokens (including role for middleware)
    setTokens(token, refreshToken, user.role);
    
    // Store user in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    return response.data;
  },

  /**
   * Logout - revokes the refresh token session
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = getRefreshToken();
      await apiClient.post("/api/v1/auth/logout", { refreshToken });
    } catch (error) {
      // Even if logout fails on server, clear local tokens
      console.error("Logout error:", error);
    } finally {
      clearTokens();
    }
  },

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<AuthResponse> {
    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }
    
    const response = await apiClient.post<AuthResponse>("/api/v1/auth/refresh", {
      refreshToken,
    });
    
    const { user, token, refreshToken: newRefreshToken } = response.data;
    setTokens(token, newRefreshToken, user.role);
    
    // Update user in localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user));
    }
    
    return response.data;
  },

  /**
   * Request password reset email
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/api/v1/auth/forgot-password", {
      email,
    });
    return response.data;
  },

  /**
   * Reset password with token from email
   */
  async resetPassword(token: string, password: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/api/v1/auth/reset-password", {
      token,
      password,
    });
    return response.data;
  },

  /**
   * Change password (requires current password)
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    const response = await apiClient.post<{ message: string }>("/api/v1/auth/change-password", {
      currentPassword,
      newPassword,
    });
    return response.data;
  },

  /**
   * Get current user from API
   */
  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<{ user: User }>("/api/v1/me");
    return response.data.user;
  },

  /**
   * Get stored user from localStorage
   */
  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;
    
    const userJson = localStorage.getItem("user");
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson) as User;
    } catch {
      return null;
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("accessToken");
  },

  /**
   * Get the portal route based on user role
   */
  getPortalRoute(role: UserRole): string {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "vendor":
        return "/vendor/dashboard";
      case "serviceBoy":
        return "/serviceboy/dashboard";
      case "user":
      default:
        return "/user/dashboard";
    }
  },
};

export { getApiErrorMessage };
