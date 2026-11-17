import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminDashboardApi } from "@/lib/api/services/admin";
import { vendorDashboardApi } from "@/lib/api/services/vendor";
import type { AdminDashboardStats, VendorDashboardStats, Booking, Vendor } from "@/lib/api/types";

// ==================== Admin Dashboard State ====================

interface AdminDashboardState {
  stats: AdminDashboardStats | null;
  recentBookings: Booking[];
  topVendors: Vendor[];
  serviceBoyStats: {
    available: number;
    busy: number;
    offline: number;
    total: number;
  } | null;
  isLoading: boolean;
  error: string | null;
}

// ==================== Vendor Dashboard State ====================

interface VendorDashboardState {
  stats: VendorDashboardStats | null;
  isLoading: boolean;
  error: string | null;
}

// ==================== Combined Dashboard State ====================

interface DashboardState {
  admin: AdminDashboardState;
  vendor: VendorDashboardState;
}

const initialState: DashboardState = {
  admin: {
    stats: null,
    recentBookings: [],
    topVendors: [],
    serviceBoyStats: null,
    isLoading: false,
    error: null,
  },
  vendor: {
    stats: null,
    isLoading: false,
    error: null,
  },
};

// ==================== Admin Dashboard Thunks ====================

export const fetchAdminDashboardStats = createAsyncThunk(
  "dashboard/fetchAdminStats",
  async (_, { rejectWithValue }) => {
    try {
      const stats = await adminDashboardApi.getStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch dashboard stats");
    }
  }
);

export const fetchAdminRecentBookings = createAsyncThunk(
  "dashboard/fetchAdminRecentBookings",
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const bookings = await adminDashboardApi.getRecentBookings(limit);
      return bookings;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch recent bookings");
    }
  }
);

export const fetchAdminTopVendors = createAsyncThunk(
  "dashboard/fetchAdminTopVendors",
  async (limit: number = 5, { rejectWithValue }) => {
    try {
      const vendors = await adminDashboardApi.getTopVendors(limit);
      return vendors;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch top vendors");
    }
  }
);

export const fetchAdminServiceBoyStats = createAsyncThunk(
  "dashboard/fetchAdminServiceBoyStats",
  async (_, { rejectWithValue }) => {
    try {
      const stats = await adminDashboardApi.getServiceBoyStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch service boy stats");
    }
  }
);

// Combined thunk to fetch all admin dashboard data
export const fetchAdminDashboardData = createAsyncThunk(
  "dashboard/fetchAdminDashboardData",
  async (_, { dispatch }) => {
    await Promise.all([
      dispatch(fetchAdminDashboardStats()),
      dispatch(fetchAdminRecentBookings(5)),
      dispatch(fetchAdminTopVendors(5)),
      dispatch(fetchAdminServiceBoyStats()),
    ]);
  }
);

// ==================== Vendor Dashboard Thunks ====================

export const fetchVendorDashboardStats = createAsyncThunk(
  "dashboard/fetchVendorStats",
  async (_, { rejectWithValue }) => {
    try {
      const stats = await vendorDashboardApi.getStats();
      return stats;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vendor dashboard stats");
    }
  }
);

// ==================== Slice ====================

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearAdminDashboard: (state) => {
      state.admin = initialState.admin;
    },
    clearVendorDashboard: (state) => {
      state.vendor = initialState.vendor;
    },
    clearDashboardError: (state) => {
      state.admin.error = null;
      state.vendor.error = null;
    },
  },
  extraReducers: (builder) => {
    // Admin Dashboard Stats
    builder
      .addCase(fetchAdminDashboardStats.pending, (state) => {
        state.admin.isLoading = true;
        state.admin.error = null;
      })
      .addCase(fetchAdminDashboardStats.fulfilled, (state, action) => {
        state.admin.isLoading = false;
        state.admin.stats = action.payload;
      })
      .addCase(fetchAdminDashboardStats.rejected, (state, action) => {
        state.admin.isLoading = false;
        state.admin.error = action.payload as string;
      });

    // Admin Recent Bookings
    builder.addCase(fetchAdminRecentBookings.fulfilled, (state, action) => {
      state.admin.recentBookings = action.payload;
    });

    // Admin Top Vendors
    builder.addCase(fetchAdminTopVendors.fulfilled, (state, action) => {
      state.admin.topVendors = action.payload;
    });

    // Admin Service Boy Stats
    builder.addCase(fetchAdminServiceBoyStats.fulfilled, (state, action) => {
      state.admin.serviceBoyStats = action.payload;
    });

    // Admin Dashboard Data (combined)
    builder
      .addCase(fetchAdminDashboardData.pending, (state) => {
        state.admin.isLoading = true;
        state.admin.error = null;
      })
      .addCase(fetchAdminDashboardData.fulfilled, (state) => {
        state.admin.isLoading = false;
      })
      .addCase(fetchAdminDashboardData.rejected, (state, action) => {
        state.admin.isLoading = false;
        state.admin.error = action.error.message || "Failed to load dashboard data";
      });

    // Vendor Dashboard Stats
    builder
      .addCase(fetchVendorDashboardStats.pending, (state) => {
        state.vendor.isLoading = true;
        state.vendor.error = null;
      })
      .addCase(fetchVendorDashboardStats.fulfilled, (state, action) => {
        state.vendor.isLoading = false;
        state.vendor.stats = action.payload;
      })
      .addCase(fetchVendorDashboardStats.rejected, (state, action) => {
        state.vendor.isLoading = false;
        state.vendor.error = action.payload as string;
      });
  },
});

export const { clearAdminDashboard, clearVendorDashboard, clearDashboardError } = dashboardSlice.actions;
export default dashboardSlice.reducer;

// ==================== Selectors ====================

export const selectAdminDashboardStats = (state: { dashboard: DashboardState }) => 
  state.dashboard.admin.stats;
export const selectAdminRecentBookings = (state: { dashboard: DashboardState }) => 
  state.dashboard.admin.recentBookings;
export const selectAdminTopVendors = (state: { dashboard: DashboardState }) => 
  state.dashboard.admin.topVendors;
export const selectAdminServiceBoyStats = (state: { dashboard: DashboardState }) => 
  state.dashboard.admin.serviceBoyStats;
export const selectAdminDashboardLoading = (state: { dashboard: DashboardState }) => 
  state.dashboard.admin.isLoading;
export const selectAdminDashboardError = (state: { dashboard: DashboardState }) => 
  state.dashboard.admin.error;

export const selectVendorDashboardStats = (state: { dashboard: DashboardState }) => 
  state.dashboard.vendor.stats;
export const selectVendorDashboardLoading = (state: { dashboard: DashboardState }) => 
  state.dashboard.vendor.isLoading;
export const selectVendorDashboardError = (state: { dashboard: DashboardState }) => 
  state.dashboard.vendor.error;
