import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import apiClient, { setTokens, clearTokens, getRefreshToken, initializeTokens } from "@/lib/api/client";

// Types
export type UserRole = "user" | "vendor" | "serviceBoy" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  mustChangePassword: boolean;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};

// Role-based dashboard routes
export const roleDashboards: Record<UserRole, string> = {
  admin: "/admin/dashboard",
  user: "/user/dashboard",
  vendor: "/vendor/dashboard",
  serviceBoy: "/serviceboy/dashboard",
};

// Async Thunks

// Initialize auth state from storage
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { rejectWithValue }) => {
    try {
      // Initialize tokens from localStorage
      initializeTokens();
      
      // Check for stored user
      if (typeof window === "undefined") return null;
      
      const userJson = localStorage.getItem("user");
      const accessToken = localStorage.getItem("accessToken");
      
      if (!userJson || !accessToken) {
        return null;
      }
      
      const storedUser = JSON.parse(userJson) as User;
      
      // Verify token is still valid by fetching current user
      try {
        const response = await apiClient.get<{ user: User }>("/api/v1/me");
        return response.data.user;
      } catch {
        // Token invalid, clear storage
        clearTokens();
        return null;
      }
    } catch (error) {
      return rejectWithValue("Failed to initialize auth");
    }
  }
);

// Login
export const login = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/v1/auth/login", credentials);
      const { user, token, refreshToken } = response.data;
      
      // Store tokens
      setTokens(token, refreshToken, user.role);
      
      // Store user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      return user;
    } catch (error: unknown) {
      // Extract error message from API response
      let errorMessage = "Login failed. Please try again.";
      
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string; code?: string } } };
        const apiError = axiosError.response?.data;
        
        if (apiError?.code === "INVALID_CREDENTIALS") {
          errorMessage = "Invalid email or password.";
        } else if (apiError?.code === "ACCOUNT_SUSPENDED") {
          errorMessage = "Your account has been suspended.";
        } else if (apiError?.code === "ACCOUNT_PENDING") {
          errorMessage = "Your account is pending approval.";
        } else if (apiError?.message) {
          errorMessage = apiError.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = getRefreshToken();
      await apiClient.post("/api/v1/auth/logout", { refreshToken });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearTokens();
    }
    return null;
  }
);

// Refresh token
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const currentRefreshToken = getRefreshToken();
      if (!currentRefreshToken) {
        throw new Error("No refresh token available");
      }
      
      const response = await apiClient.post<AuthResponse>("/api/v1/auth/refresh", {
        refreshToken: currentRefreshToken,
      });
      
      const { user, token, refreshToken: newRefreshToken } = response.data;
      setTokens(token, newRefreshToken, user.role);
      
      // Update user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      clearTokens();
      return rejectWithValue("Session expired. Please login again.");
    }
  }
);

// Register (for customers)
export const register = createAsyncThunk(
  "auth/register",
  async (
    data: { email: string; password: string; name: string; phone?: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await apiClient.post<AuthResponse>("/api/v1/auth/register", data);
      const { user, token, refreshToken } = response.data;
      
      // Store tokens
      setTokens(token, refreshToken, user.role);
      
      // Store user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      return user;
    } catch (error: unknown) {
      let errorMessage = "Registration failed. Please try again.";
      
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as { response?: { data?: { message?: string; code?: string } } };
        const apiError = axiosError.response?.data;
        
        if (apiError?.code === "EMAIL_EXISTS") {
          errorMessage = "An account with this email already exists.";
        } else if (apiError?.message) {
          errorMessage = apiError.message;
        }
      }
      
      return rejectWithValue(errorMessage);
    }
  }
);

// Auth slice
const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    resetAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = action.payload;
        state.isAuthenticated = !!action.payload;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.isLoading = false;
        state.isInitialized = true;
        state.user = null;
        state.isAuthenticated = false;
      });
    
    // Login
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.user = null;
        state.isAuthenticated = false;
      });
    
    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      });
    
    // Refresh token
    builder
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
    
    // Register
    builder
      .addCase(register.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setUser, resetAuth } = authSlice.actions;
export default authSlice.reducer;

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectIsLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectIsInitialized = (state: { auth: AuthState }) => state.auth.isInitialized;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
