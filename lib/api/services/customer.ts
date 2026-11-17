import apiClient from "../client";
import type {
  Category,
  ServiceArea,
  Service,
  Vendor,
  Booking,
  PricingOption,
  QuoteRequest,
  PaginationParams,
} from "../types";

// ==================== Catalog API (Public) ====================

export const catalogApi = {
  // Get all categories
  async getCategories() {
    const response = await apiClient.get<Category[]>("/api/v1/categories");
    return response.data;
  },

  // Get all service areas
  async getAreas() {
    const response = await apiClient.get<ServiceArea[]>("/api/v1/areas");
    return response.data;
  },

  // Get all services
  async getServices(params?: { categoryId?: string }) {
    const response = await apiClient.get<Service[]>("/api/v1/services", { params });
    return response.data;
  },

  // Get service by ID
  async getService(id: string) {
    const response = await apiClient.get<Service>(`/api/v1/services/${id}`);
    return response.data;
  },

  // Get vendors
  async getVendors(params?: { categoryId?: string; areaId?: string }) {
    const response = await apiClient.get<Vendor[]>("/api/v1/vendors", { params });
    return response.data;
  },

  // Get vendor availability
  async getVendorAvailability(vendorId: string, date: string) {
    const response = await apiClient.get<{ slots: string[] }>(`/api/v1/vendors/${vendorId}/availability`, {
      params: { date },
    });
    return response.data;
  },

  // Get vendor pricing for category
  async getVendorPricing(vendorId: string, category: string) {
    const response = await apiClient.get<PricingOption[]>(`/api/v1/vendors/${vendorId}/pricing/${category}`);
    return response.data;
  },

  // Get general pricing for category
  async getPricing(category: string) {
    const response = await apiClient.get<PricingOption[]>(`/api/v1/pricing/${category}`);
    return response.data;
  },
};

// ==================== Customer Profile API ====================

export const customerProfileApi = {
  // Get current user
  async getProfile() {
    const response = await apiClient.get<{ user: any }>("/api/v1/me");
    return response.data.user;
  },

  // Update profile
  async updateProfile(data: { name?: string; phone?: string; avatar?: string }) {
    const response = await apiClient.put<{ user: any }>("/api/v1/me", data);
    return response.data.user;
  },

  // Update preferences
  async updatePreferences(data: { push?: boolean; sms?: boolean; email?: boolean; language?: string }) {
    const response = await apiClient.put<{ preferences: any }>("/api/v1/me/preferences", data);
    return response.data.preferences;
  },

  // Get saved location
  async getLocation() {
    const response = await apiClient.get<{ lat: number; lng: number; address?: string }>("/api/v1/me/location");
    return response.data;
  },

  // Update saved location
  async updateLocation(data: { lat: number; lng: number; address?: string }) {
    const response = await apiClient.put<{ lat: number; lng: number }>("/api/v1/me/location", data);
    return response.data;
  },

  // Register device token for push notifications
  async registerDeviceToken(token: string, platform: "ios" | "android" | "web") {
    const response = await apiClient.post<{ message: string }>("/api/v1/me/device-tokens", { token, platform });
    return response.data;
  },
};

// ==================== Customer Addresses API ====================

export const customerAddressesApi = {
  // Get all addresses
  async getAddresses() {
    const response = await apiClient.get<any[]>("/api/v1/me/addresses");
    return response.data;
  },

  // Create address
  async createAddress(data: {
    label: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number;
    lng?: number;
    isDefault?: boolean;
  }) {
    const response = await apiClient.post<any>("/api/v1/me/addresses", data);
    return response.data;
  },

  // Update address
  async updateAddress(id: string, data: any) {
    const response = await apiClient.put<any>(`/api/v1/me/addresses/${id}`, data);
    return response.data;
  },

  // Delete address
  async deleteAddress(id: string) {
    await apiClient.delete(`/api/v1/me/addresses/${id}`);
  },
};

// ==================== Customer Bookings API ====================

export const customerBookingsApi = {
  // Get all bookings
  async getBookings(params?: PaginationParams & { status?: string }) {
    const response = await apiClient.get<Booking[]>("/api/v1/bookings", { params });
    return response.data;
  },

  // Get booking by ID
  async getBooking(id: string) {
    const response = await apiClient.get<Booking>(`/api/v1/bookings/${id}`);
    return response.data;
  },

  // Get quote for booking
  async getQuote(data: {
    vendorId: string;
    categoryId: string;
    serviceId: string;
    options: Record<string, any>;
    scheduledDate: string;
    scheduledTime: string;
  }) {
    const response = await apiClient.post<{
      amount: number;
      discount: number;
      finalAmount: number;
      breakdown: any[];
    }>("/api/v1/bookings/quote", data);
    return response.data;
  },

  // Create booking
  async createBooking(data: {
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
  }) {
    const response = await apiClient.post<Booking>("/api/v1/bookings", data);
    return response.data;
  },
};

// ==================== Customer Quote Requests API ====================

export const customerQuoteRequestsApi = {
  // Get all quote requests
  async getQuoteRequests() {
    const response = await apiClient.get<QuoteRequest[]>("/api/v1/quote-requests");
    return response.data;
  },

  // Create quote request
  async createQuoteRequest(data: { categoryId: string; description: string }) {
    const response = await apiClient.post<QuoteRequest>("/api/v1/quote-requests", data);
    return response.data;
  },
};
