import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminBookingsApi } from "@/lib/api/services/admin";
import { vendorBookingsApi } from "@/lib/api/services/vendor";
import { customerBookingsApi } from "@/lib/api/services/customer";
import type { Booking, BookingCounts } from "@/lib/api/types";

interface BookingsState {
  bookings: Booking[];
  selectedBooking: Booking | null;
  counts: BookingCounts | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: BookingsState = {
  bookings: [],
  selectedBooking: null,
  counts: null,
  isLoading: false,
  error: null,
};

// ==================== Admin Thunks ====================

export const fetchAdminBookings = createAsyncThunk(
  "bookings/fetchAdminBookings",
  async (params: { status?: string; vendorId?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await adminBookingsApi.getBookings(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
);

export const fetchAdminBooking = createAsyncThunk(
  "bookings/fetchAdminBooking",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await adminBookingsApi.getBooking(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch booking");
    }
  }
);

// ==================== Vendor Thunks ====================

export const fetchVendorBookings = createAsyncThunk(
  "bookings/fetchVendorBookings",
  async (params: { status?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await vendorBookingsApi.getBookings(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
);

export const fetchVendorBookingCounts = createAsyncThunk(
  "bookings/fetchVendorBookingCounts",
  async (_, { rejectWithValue }) => {
    try {
      const data = await vendorBookingsApi.getBookingCounts();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch booking counts");
    }
  }
);

export const acceptBooking = createAsyncThunk(
  "bookings/acceptBooking",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await vendorBookingsApi.acceptBooking(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to accept booking");
    }
  }
);

export const rejectBooking = createAsyncThunk(
  "bookings/rejectBooking",
  async ({ id, reason }: { id: string; reason?: string }, { rejectWithValue }) => {
    try {
      const data = await vendorBookingsApi.rejectBooking(id, reason);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to reject booking");
    }
  }
);

export const assignServiceBoy = createAsyncThunk(
  "bookings/assignServiceBoy",
  async ({ bookingId, serviceBoyId }: { bookingId: string; serviceBoyId: string }, { rejectWithValue }) => {
    try {
      const data = await vendorBookingsApi.assignServiceBoy(bookingId, serviceBoyId);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to assign service boy");
    }
  }
);

// ==================== Customer Thunks ====================

export const fetchCustomerBookings = createAsyncThunk(
  "bookings/fetchCustomerBookings",
  async (params: { status?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await customerBookingsApi.getBookings(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch bookings");
    }
  }
);

export const createBooking = createAsyncThunk(
  "bookings/createBooking",
  async (
    data: {
      vendorId: string;
      categoryId: string;
      serviceId: string;
      options: Record<string, any>;
      scheduledDate: string;
      scheduledTime: string;
      address: string;
      city: string;
      lat?: number;
      lng?: number;
      notes?: string;
      paymentMethod?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const booking = await customerBookingsApi.createBooking(data);
      return booking;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create booking");
    }
  }
);

const bookingsSlice = createSlice({
  name: "bookings",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedBooking: (state) => {
      state.selectedBooking = null;
    },
    setSelectedBooking: (state, action) => {
      state.selectedBooking = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Admin bookings
    builder
      .addCase(fetchAdminBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAdminBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchAdminBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchAdminBooking.fulfilled, (state, action) => {
      state.selectedBooking = action.payload;
    });

    // Vendor bookings
    builder
      .addCase(fetchVendorBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchVendorBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchVendorBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder.addCase(fetchVendorBookingCounts.fulfilled, (state, action) => {
      state.counts = action.payload;
    });

    // Accept booking
    builder.addCase(acceptBooking.fulfilled, (state, action) => {
      const index = state.bookings.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) state.bookings[index] = action.payload;
    });

    // Reject booking
    builder.addCase(rejectBooking.fulfilled, (state, action) => {
      const index = state.bookings.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) state.bookings[index] = action.payload;
    });

    // Assign service boy
    builder.addCase(assignServiceBoy.fulfilled, (state, action) => {
      const index = state.bookings.findIndex((b) => b.id === action.payload.id);
      if (index !== -1) state.bookings[index] = action.payload;
    });

    // Customer bookings
    builder
      .addCase(fetchCustomerBookings.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerBookings.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings = action.payload;
      })
      .addCase(fetchCustomerBookings.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Create booking
    builder
      .addCase(createBooking.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.bookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, clearSelectedBooking, setSelectedBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;

// Selectors
export const selectBookings = (state: { bookings: BookingsState }) => state.bookings.bookings;
export const selectSelectedBooking = (state: { bookings: BookingsState }) => state.bookings.selectedBooking;
export const selectBookingCounts = (state: { bookings: BookingsState }) => state.bookings.counts;
export const selectBookingsLoading = (state: { bookings: BookingsState }) => state.bookings.isLoading;
export const selectBookingsError = (state: { bookings: BookingsState }) => state.bookings.error;
