import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { adminCatalogApi } from "@/lib/api/services/admin";
import { catalogApi } from "@/lib/api/services/customer";
import type { Category, ServiceArea, Service, Vendor, PricingOption } from "@/lib/api/types";

interface CatalogState {
  categories: Category[];
  areas: ServiceArea[];
  services: Service[];
  vendors: Vendor[];
  pricing: PricingOption[];
  selectedCategory: Category | null;
  selectedService: Service | null;
  selectedVendor: Vendor | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CatalogState = {
  categories: [],
  areas: [],
  services: [],
  vendors: [],
  pricing: [],
  selectedCategory: null,
  selectedService: null,
  selectedVendor: null,
  isLoading: false,
  error: null,
};

// ==================== Public Catalog Thunks ====================

export const fetchCategories = createAsyncThunk(
  "catalog/fetchCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = await catalogApi.getCategories();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const fetchAreas = createAsyncThunk(
  "catalog/fetchAreas",
  async (_, { rejectWithValue }) => {
    try {
      const data = await catalogApi.getAreas();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch areas");
    }
  }
);

export const fetchServices = createAsyncThunk(
  "catalog/fetchServices",
  async (params: { categoryId?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await catalogApi.getServices(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch services");
    }
  }
);

export const fetchService = createAsyncThunk(
  "catalog/fetchService",
  async (id: string, { rejectWithValue }) => {
    try {
      const data = await catalogApi.getService(id);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch service");
    }
  }
);

export const fetchVendors = createAsyncThunk(
  "catalog/fetchVendors",
  async (params: { categoryId?: string; areaId?: string } | undefined, { rejectWithValue }) => {
    try {
      const data = await catalogApi.getVendors(params);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch vendors");
    }
  }
);

export const fetchPricing = createAsyncThunk(
  "catalog/fetchPricing",
  async (category: string, { rejectWithValue }) => {
    try {
      const data = await catalogApi.getPricing(category);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch pricing");
    }
  }
);

// ==================== Admin Catalog Thunks ====================

export const fetchAdminCategories = createAsyncThunk(
  "catalog/fetchAdminCategories",
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminCatalogApi.getCategories();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch categories");
    }
  }
);

export const createCategory = createAsyncThunk(
  "catalog/createCategory",
  async (
    data: { name: string; description?: string; icon?: string; image?: string },
    { rejectWithValue }
  ) => {
    try {
      const category = await adminCatalogApi.createCategory(data);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create category");
    }
  }
);

export const updateCategory = createAsyncThunk(
  "catalog/updateCategory",
  async ({ id, data }: { id: string; data: Partial<Category> }, { rejectWithValue }) => {
    try {
      const category = await adminCatalogApi.updateCategory(id, data);
      return category;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update category");
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "catalog/deleteCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      await adminCatalogApi.deleteCategory(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to delete category");
    }
  }
);

export const fetchAdminAreas = createAsyncThunk(
  "catalog/fetchAdminAreas",
  async (_, { rejectWithValue }) => {
    try {
      const data = await adminCatalogApi.getAreas();
      return data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch areas");
    }
  }
);

export const createArea = createAsyncThunk(
  "catalog/createArea",
  async (
    data: { name: string; city: string; state: string; pincode: string },
    { rejectWithValue }
  ) => {
    try {
      const area = await adminCatalogApi.createArea(data);
      return area;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to create area");
    }
  }
);

export const updateArea = createAsyncThunk(
  "catalog/updateArea",
  async ({ id, data }: { id: string; data: Partial<ServiceArea> }, { rejectWithValue }) => {
    try {
      const area = await adminCatalogApi.updateArea(id, data);
      return area;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to update area");
    }
  }
);

export const toggleArea = createAsyncThunk(
  "catalog/toggleArea",
  async (id: string, { rejectWithValue }) => {
    try {
      const area = await adminCatalogApi.toggleArea(id);
      return area;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || "Failed to toggle area");
    }
  }
);

const catalogSlice = createSlice({
  name: "catalog",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedCategory: (state, action) => {
      state.selectedCategory = action.payload;
    },
    setSelectedService: (state, action) => {
      state.selectedService = action.payload;
    },
    setSelectedVendor: (state, action) => {
      state.selectedVendor = action.payload;
    },
    clearSelections: (state) => {
      state.selectedCategory = null;
      state.selectedService = null;
      state.selectedVendor = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch categories
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Admin categories
    builder.addCase(fetchAdminCategories.fulfilled, (state, action) => {
      state.categories = action.payload;
    });

    // Create category
    builder.addCase(createCategory.fulfilled, (state, action) => {
      state.categories.push(action.payload);
    });

    // Update category
    builder.addCase(updateCategory.fulfilled, (state, action) => {
      const index = state.categories.findIndex((c) => c.id === action.payload.id);
      if (index !== -1) state.categories[index] = action.payload;
    });

    // Delete category
    builder.addCase(deleteCategory.fulfilled, (state, action) => {
      state.categories = state.categories.filter((c) => c.id !== action.payload);
    });

    // Fetch areas
    builder
      .addCase(fetchAreas.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAreas.fulfilled, (state, action) => {
        state.isLoading = false;
        state.areas = action.payload;
      })
      .addCase(fetchAreas.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Admin areas
    builder.addCase(fetchAdminAreas.fulfilled, (state, action) => {
      state.areas = action.payload;
    });

    // Create area
    builder.addCase(createArea.fulfilled, (state, action) => {
      state.areas.push(action.payload);
    });

    // Update area
    builder.addCase(updateArea.fulfilled, (state, action) => {
      const index = state.areas.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) state.areas[index] = action.payload;
    });

    // Toggle area
    builder.addCase(toggleArea.fulfilled, (state, action) => {
      const index = state.areas.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) state.areas[index] = action.payload;
    });

    // Fetch services
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch single service
    builder.addCase(fetchService.fulfilled, (state, action) => {
      state.selectedService = action.payload;
    });

    // Fetch vendors
    builder
      .addCase(fetchVendors.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchVendors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.vendors = action.payload;
      })
      .addCase(fetchVendors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch pricing
    builder
      .addCase(fetchPricing.fulfilled, (state, action) => {
        state.pricing = action.payload;
      });
  },
});

export const {
  clearError,
  setSelectedCategory,
  setSelectedService,
  setSelectedVendor,
  clearSelections,
} = catalogSlice.actions;
export default catalogSlice.reducer;

// Selectors
export const selectCategories = (state: { catalog: CatalogState }) => state.catalog.categories;
export const selectAreas = (state: { catalog: CatalogState }) => state.catalog.areas;
export const selectServices = (state: { catalog: CatalogState }) => state.catalog.services;
export const selectVendorsList = (state: { catalog: CatalogState }) => state.catalog.vendors;
export const selectPricing = (state: { catalog: CatalogState }) => state.catalog.pricing;
export const selectSelectedCategory = (state: { catalog: CatalogState }) => state.catalog.selectedCategory;
export const selectSelectedService = (state: { catalog: CatalogState }) => state.catalog.selectedService;
export const selectSelectedVendor = (state: { catalog: CatalogState }) => state.catalog.selectedVendor;
export const selectCatalogLoading = (state: { catalog: CatalogState }) => state.catalog.isLoading;
export const selectCatalogError = (state: { catalog: CatalogState }) => state.catalog.error;
