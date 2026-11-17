import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminServiceBoysApi } from "@/lib/api/services/admin";
import { vendorServiceBoysApi } from "@/lib/api/services/vendor";
import { serviceBoyProfileApi, serviceBoyJobsApi } from "@/lib/api/services/serviceBoy";
import type { ServiceBoy, ServiceBoyJob, ServiceBoyStats } from "@/lib/api/types";

interface ServiceBoysState {
  serviceBoys: ServiceBoy[];
  selectedServiceBoy: ServiceBoy | null;
  // Service boy portal specific
  profile: ServiceBoy | null;
  jobs: ServiceBoyJob[];
  completedJobs: ServiceBoyJob[];
  stats: ServiceBoyStats | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: ServiceBoysState = {
  serviceBoys: [],
  selectedServiceBoy: null,
  profile: null,
  jobs: [],
  completedJobs: [],
  stats: null,
  isLoading: false,
  error: null,
};

// ==================== Admin Thunks ====================

export const fetchAdminServiceBoys = createAsyncThunk(
  "serviceBoys/fetchAdminServiceBoys",
  async (params: { vendorId?: string; status?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await adminServiceBoysApi.getServiceBoys(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch service boys");
    }
  }
);

export const updateAdminServiceBoyStatus = createAsyncThunk(
  "serviceBoys/updateAdminStatus",
  async ({ id, status }: { id: string; status: "active" | "suspended" }, { rejectWithValue }) => {
    try {
      const data = await adminServiceBoysApi.updateServiceBoyStatus(id, status);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

// ==================== Vendor Thunks ====================

export const fetchVendorServiceBoys = createAsyncThunk(
  "serviceBoys/fetchVendorServiceBoys",
  async (_, { rejectWithValue }) => {
    try {
      const data = await vendorServiceBoysApi.getServiceBoys();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch service boys");
    }
  }
);

export const createServiceBoy = createAsyncThunk(
  "serviceBoys/createServiceBoy",
  async (
    data: { name: string; email: string; phone: string; password: string; skills: string[] },
    { rejectWithValue }
  ) => {
    try {
      const serviceBoy = await vendorServiceBoysApi.createServiceBoy(data);
      return serviceBoy;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create service boy");
    }
  }
);

export const updateServiceBoy = createAsyncThunk(
  "serviceBoys/updateServiceBoy",
  async ({ id, data }: { id: string; data: Partial<ServiceBoy> }, { rejectWithValue }) => {
    try {
      const serviceBoy = await vendorServiceBoysApi.updateServiceBoy(id, data);
      return serviceBoy;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update service boy");
    }
  }
);

export const deleteServiceBoy = createAsyncThunk(
  "serviceBoys/deleteServiceBoy",
  async (id: string, { rejectWithValue }) => {
    try {
      await vendorServiceBoysApi.deleteServiceBoy(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete service boy");
    }
  }
);

// ==================== Service Boy Portal Thunks ====================

export const fetchServiceBoyProfile = createAsyncThunk(
  "serviceBoys/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const data = await serviceBoyProfileApi.getProfile();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch profile");
    }
  }
);

export const fetchServiceBoyStats = createAsyncThunk(
  "serviceBoys/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const data = await serviceBoyProfileApi.getStats();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch stats");
    }
  }
);

export const updateServiceBoyStatus = createAsyncThunk(
  "serviceBoys/updateStatus",
  async (status: "available" | "offline", { rejectWithValue }) => {
    try {
      const data = await serviceBoyProfileApi.updateStatus(status);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update status");
    }
  }
);

export const fetchAssignedJobs = createAsyncThunk(
  "serviceBoys/fetchAssignedJobs",
  async (_, { rejectWithValue }) => {
    try {
      const data = await serviceBoyJobsApi.getAssignedJobs();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch jobs");
    }
  }
);

export const fetchCompletedJobs = createAsyncThunk(
  "serviceBoys/fetchCompletedJobs",
  async (_, { rejectWithValue }) => {
    try {
      const data = await serviceBoyJobsApi.getCompletedJobs();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch completed jobs");
    }
  }
);

export const acceptJob = createAsyncThunk(
  "serviceBoys/acceptJob",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await serviceBoyJobsApi.acceptJob(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept job");
    }
  }
);

export const declineJob = createAsyncThunk(
  "serviceBoys/declineJob",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const data = await serviceBoyJobsApi.declineJob(id, reason);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to decline job");
    }
  }
);

export const startJob = createAsyncThunk(
  "serviceBoys/startJob",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await serviceBoyJobsApi.startJob(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to start job");
    }
  }
);

export const completeJob = createAsyncThunk(
  "serviceBoys/completeJob",
  async ({ id, notes }: { id: string; notes?: string }, { rejectWithValue }) => {
    try {
      const data = await serviceBoyJobsApi.completeJob(id, { notes });
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete job");
    }
  }
);

const serviceBoysSlice = createSlice({
  name: "serviceBoys",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedServiceBoy: (state) => {
      state.selectedServiceBoy = null;
    },
  },
  extraReducers: (builder) => {
    // Admin fetch service boys
    builder
      .addCase(fetchAdminServiceBoys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminServiceBoys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.serviceBoys = action.payload;
      })
      .addCase(fetchAdminServiceBoys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(updateAdminServiceBoyStatus.fulfilled, (state, action) => {
      const index = state.serviceBoys.findIndex((sb) => sb.id === action.payload.id);
      if (index !== -1) state.serviceBoys[index] = action.payload;
    });

    // Vendor fetch service boys
    builder
      .addCase(fetchVendorServiceBoys.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorServiceBoys.fulfilled, (state, action) => {
        state.isLoading = false;
        state.serviceBoys = action.payload;
      })
      .addCase(fetchVendorServiceBoys.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create service boy
    builder.addCase(createServiceBoy.fulfilled, (state, action) => {
      state.serviceBoys.push(action.payload);
    });

    // Update service boy
    builder.addCase(updateServiceBoy.fulfilled, (state, action) => {
      const index = state.serviceBoys.findIndex((sb) => sb.id === action.payload.id);
      if (index !== -1) state.serviceBoys[index] = action.payload;
    });

    // Delete service boy
    builder.addCase(deleteServiceBoy.fulfilled, (state, action) => {
      state.serviceBoys = state.serviceBoys.filter((sb) => sb.id !== action.payload);
    });

    // Service boy profile
    builder.addCase(fetchServiceBoyProfile.fulfilled, (state, action) => {
      state.profile = action.payload;
    });

    // Service boy stats
    builder.addCase(fetchServiceBoyStats.fulfilled, (state, action) => {
      state.stats = action.payload;
    });

    // Update status
    builder.addCase(updateServiceBoyStatus.fulfilled, (state, action) => {
      if (state.profile) {
        state.profile.status = action.payload.status as any;
      }
    });

    // Assigned jobs
    builder
      .addCase(fetchAssignedJobs.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAssignedJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.jobs = action.payload;
      })
      .addCase(fetchAssignedJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Completed jobs
    builder.addCase(fetchCompletedJobs.fulfilled, (state, action) => {
      state.completedJobs = action.payload;
    });

    // Accept job
    builder.addCase(acceptJob.fulfilled, (state, action) => {
      const index = state.jobs.findIndex((j) => j.id === action.payload.id);
      if (index !== -1) state.jobs[index] = action.payload;
    });

    // Decline job
    builder.addCase(declineJob.fulfilled, (state, action) => {
      state.jobs = state.jobs.filter((j) => j.id !== action.payload.id);
    });

    // Start job
    builder.addCase(startJob.fulfilled, (state, action) => {
      const index = state.jobs.findIndex((j) => j.id === action.payload.id);
      if (index !== -1) state.jobs[index] = action.payload;
    });

    // Complete job
    builder.addCase(completeJob.fulfilled, (state, action) => {
      state.jobs = state.jobs.filter((j) => j.id !== action.payload.id);
      state.completedJobs.unshift(action.payload);
    });
  },
});

export const { clearError, clearSelectedServiceBoy } = serviceBoysSlice.actions;
export default serviceBoysSlice.reducer;

// Selectors
export const selectServiceBoys = (state: { serviceBoys: ServiceBoysState }) => state.serviceBoys.serviceBoys;
export const selectSelectedServiceBoy = (state: { serviceBoys: ServiceBoysState }) =>
  state.serviceBoys.selectedServiceBoy;
export const selectServiceBoyProfile = (state: { serviceBoys: ServiceBoysState }) => state.serviceBoys.profile;
export const selectServiceBoyJobs = (state: { serviceBoys: ServiceBoysState }) => state.serviceBoys.jobs;
export const selectCompletedJobs = (state: { serviceBoys: ServiceBoysState }) => state.serviceBoys.completedJobs;
export const selectServiceBoyStats = (state: { serviceBoys: ServiceBoysState }) => state.serviceBoys.stats;
export const selectServiceBoysLoading = (state: { serviceBoys: ServiceBoysState }) => state.serviceBoys.isLoading;
export const selectServiceBoysError = (state: { serviceBoys: ServiceBoysState }) => state.serviceBoys.error;
