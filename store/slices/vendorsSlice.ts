import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminVendorsApi } from "@/lib/api/services/admin";
import type { Vendor, VendorRequest } from "@/lib/api/types";

interface VendorsState {
  vendors: Vendor[];
  pendingVendors: Vendor[];
  vendorRequests: VendorRequest[];
  selectedVendor: Vendor | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: VendorsState = {
  vendors: [],
  pendingVendors: [],
  vendorRequests: [],
  selectedVendor: null,
  isLoading: false,
  error: null,
};

// Async Thunks
export const fetchVendors = createAsyncThunk(
  "vendors/fetchVendors",
  async (params: { status?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await adminVendorsApi.getVendors(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vendors");
    }
  }
);

export const fetchPendingVendors = createAsyncThunk(
  "vendors/fetchPendingVendors",
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminVendorsApi.getPendingVendors();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch pending vendors");
    }
  }
);

export const fetchVendor = createAsyncThunk(
  "vendors/fetchVendor",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await adminVendorsApi.getVendor(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vendor");
    }
  }
);

export const createVendor = createAsyncThunk(
  "vendors/createVendor",
  async (
    data: { businessName: string; email: string; phone: string; password: string; description?: string },
    { rejectWithValue }
  ) => {
    try {
      const vendor = await adminVendorsApi.createVendor(data);
      return vendor;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create vendor");
    }
  }
);

export const approveVendor = createAsyncThunk(
  "vendors/approveVendor",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await adminVendorsApi.approveVendor(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to approve vendor");
    }
  }
);

export const rejectVendor = createAsyncThunk(
  "vendors/rejectVendor",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const data = await adminVendorsApi.rejectVendor(id, reason);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject vendor");
    }
  }
);

export const suspendVendor = createAsyncThunk(
  "vendors/suspendVendor",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const data = await adminVendorsApi.suspendVendor(id, reason);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to suspend vendor");
    }
  }
);

export const reactivateVendor = createAsyncThunk(
  "vendors/reactivateVendor",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await adminVendorsApi.reactivateVendor(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reactivate vendor");
    }
  }
);

export const fetchVendorRequests = createAsyncThunk(
  "vendors/fetchVendorRequests",
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminVendorsApi.getVendorRequests();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vendor requests");
    }
  }
);

const vendorsSlice = createSlice({
  name: "vendors",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedVendor: (state) => {
      state.selectedVendor = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch vendors
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch pending vendors
    builder
      .addCase(fetchPendingVendors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchPendingVendors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pendingVendors = action.payload;
      })
      .addCase(fetchPendingVendors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single vendor
    builder
      .addCase(fetchVendor.fulfilled, (state, action) => {
        state.selectedVendor = action.payload;
      });

    // Create vendor
    builder
      .addCase(createVendor.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createVendor.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendors.push(action.payload);
      })
      .addCase(createVendor.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Approve vendor
    builder
      .addCase(approveVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) state.vendors[index] = action.payload;
        state.pendingVendors = state.pendingVendors.filter((v) => v.id !== action.payload.id);
      });

    // Reject vendor
    builder
      .addCase(rejectVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) state.vendors[index] = action.payload;
        state.pendingVendors = state.pendingVendors.filter((v) => v.id !== action.payload.id);
      });

    // Suspend vendor
    builder
      .addCase(suspendVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) state.vendors[index] = action.payload;
      });

    // Reactivate vendor
    builder
      .addCase(reactivateVendor.fulfilled, (state, action) => {
        const index = state.vendors.findIndex((v) => v.id === action.payload.id);
        if (index !== -1) state.vendors[index] = action.payload;
      });

    // Fetch vendor requests
    builder
      .addCase(fetchVendorRequests.fulfilled, (state, action) => {
        state.vendorRequests = action.payload;
      });
  },
});

export const { clearError, clearSelectedVendor } = vendorsSlice.actions;
export default vendorsSlice.reducer;

// Selectors
export const selectVendors = (state: { vendors: VendorsState }) => state.vendors.vendors;
export const selectPendingVendors = (state: { vendors: VendorsState }) => state.vendors.pendingVendors;
export const selectVendorRequests = (state: { vendors: VendorsState }) => state.vendors.vendorRequests;
export const selectSelectedVendor = (state: { vendors: VendorsState }) => state.vendors.selectedVendor;
export const selectVendorsLoading = (state: { vendors: VendorsState }) => state.vendors.isLoading;
export const selectVendorsError = (state: { vendors: VendorsState }) => state.vendors.error;
