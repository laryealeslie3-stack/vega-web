import apiClient from "../client";
import type {
  Vendor,
  VendorLocation,
  Booking,
  BookingCounts,
  ServiceBoy,
  PricingOption,
  VendorDashboardStats,
  PaginationParams,
} from "../types";

// ==================== Vendor Profile API ====================

export const vendorProfileApi = {
  // Get vendor profile
  async getProfile() {
    const response = await apiClient.get<Vendor>("/api/v1/vendor/profile");
    return response.data;
  },

  // Update vendor profile
  async updateProfile(data: {
    businessName?: string;
    description?: string;
    phone?: string;
    logo?: string;
  }) {
    const response = await apiClient.put<Vendor>("/api/v1/vendor/profile", data);
    return response.data;
  },

  // Change password
  async changePassword(data: { currentPassword: string; newPassword: string }) {
    const response = await apiClient.post<{ message: string }>("/api/v1/vendor/change-password", data);
    return response.data;
  },

  // Toggle store status (open/closed)
  async toggleStoreStatus() {
    const response = await apiClient.patch<{ isStoreOpen: boolean }>("/api/v1/vendor/store-status");
    return response.data;
  },
};

// ==================== Vendor Dashboard API ====================

export const vendorDashboardApi = {
  // Get dashboard stats
  async getStats() {
    const response = await apiClient.get<VendorDashboardStats>("/api/v1/vendor/dashboard");
    return response.data;
  },

  // Get vendor stats
  async getVendorStats() {
    const response = await apiClient.get<any>("/api/v1/vendor/stats");
    return response.data;
  },
};

// ==================== Vendor Locations API ====================

export const vendorLocationsApi = {
  // Get all locations
  async getLocations() {
    const response = await apiClient.get<VendorLocation[]>("/api/v1/vendor/locations");
    return response.data;
  },

  // Create location
  async createLocation(data: {
    name: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
    lat?: number;
    lng?: number;
  }) {
    const response = await apiClient.post<VendorLocation>("/api/v1/vendor/locations", data);
    return response.data;
  },

  // Update location
  async updateLocation(id: string, data: Partial<VendorLocation>) {
    const response = await apiClient.put<VendorLocation>(`/api/v1/vendor/locations/${id}`, data);
    return response.data;
  },

  // Toggle location active status
  async toggleLocation(id: string) {
    const response = await apiClient.patch<VendorLocation>(`/api/v1/vendor/locations/${id}/toggle`);
    return response.data;
  },

  // Delete location
  async deleteLocation(id: string) {
    await apiClient.delete(`/api/v1/vendor/locations/${id}`);
  },
};

// ==================== Vendor Bookings API ====================

export const vendorBookingsApi = {
  // Get all bookings
  async getBookings(params?: PaginationParams & { status?: string }) {
    const response = await apiClient.get<Booking[]>("/api/v1/vendor/bookings", { params });
    return response.data;
  },

  // Get booking by ID
  async getBooking(id: string) {
    const response = await apiClient.get<Booking>(`/api/v1/vendor/bookings/${id}`);
    return response.data;
  },

  // Get booking counts
  async getBookingCounts() {
    const response = await apiClient.get<BookingCounts>("/api/v1/vendor/bookings/counts");
    return response.data;
  },

  // Accept booking
  async acceptBooking(id: string) {
    const response = await apiClient.patch<Booking>(`/api/v1/vendor/bookings/${id}/accept`);
    return response.data;
  },

  // Reject booking
  async rejectBooking(id: string, reason?: string) {
    const response = await apiClient.patch<Booking>(`/api/v1/vendor/bookings/${id}/reject`, { reason });
    return response.data;
  },

  // Assign service boy to booking
  async assignServiceBoy(bookingId: string, serviceBoyId: string) {
    const response = await apiClient.patch<Booking>(`/api/v1/vendor/bookings/${bookingId}/assign`, {
      serviceBoyId,
    });
    return response.data;
  },

  // Get assignable service boys for a booking
  async getAssignableServiceBoys(bookingId: string) {
    const response = await apiClient.get<ServiceBoy[]>(
      `/api/v1/vendor/bookings/${bookingId}/assignable-service-boys`
    );
    return response.data;
  },
};

// ==================== Vendor Service Boys API ====================

export const vendorServiceBoysApi = {
  // Get all service boys
  async getServiceBoys() {
    const response = await apiClient.get<ServiceBoy[]>("/api/v1/vendor/service-boys");
    return response.data;
  },

  // Get service boy by ID
  async getServiceBoy(id: string) {
    const response = await apiClient.get<ServiceBoy>(`/api/v1/vendor/service-boys/${id}`);
    return response.data;
  },

  // Create service boy
  async createServiceBoy(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    skills: string[];
  }) {
    const response = await apiClient.post<ServiceBoy>("/api/v1/vendor/service-boys", data);
    return response.data;
  },

  // Update service boy
  async updateServiceBoy(id: string, data: Partial<ServiceBoy>) {
    const response = await apiClient.put<ServiceBoy>(`/api/v1/vendor/service-boys/${id}`, data);
    return response.data;
  },

  // Delete service boy
  async deleteServiceBoy(id: string) {
    await apiClient.delete(`/api/v1/vendor/service-boys/${id}`);
  },
};

// ==================== Vendor Services API ====================

export const vendorServicesApi = {
  // Get vendor's services
  async getServices() {
    const response = await apiClient.get<any[]>("/api/v1/vendor/services");
    return response.data;
  },

  // Toggle service active status
  async toggleService(id: string) {
    const response = await apiClient.patch<any>(`/api/v1/vendor/services/${id}/toggle`);
    return response.data;
  },

  // Get service requests
  async getServiceRequests() {
    const response = await apiClient.get<any[]>("/api/v1/vendor/service-requests");
    return response.data;
  },

  // Get service request by ID
  async getServiceRequest(id: string) {
    const response = await apiClient.get<any>(`/api/v1/vendor/service-requests/${id}`);
    return response.data;
  },

  // Create service request
  async createServiceRequest(data: { categoryId: string; description: string }) {
    const response = await apiClient.post<any>("/api/v1/vendor/service-requests", data);
    return response.data;
  },

  // Resubmit service request
  async resubmitServiceRequest(id: string, data: { description: string }) {
    const response = await apiClient.post<any>(`/api/v1/vendor/service-requests/${id}/resubmit`, data);
    return response.data;
  },
};

// ==================== Vendor Pricing API ====================

export const vendorPricingApi = {
  // Get pricing for category
  async getPricing(category: string) {
    const response = await apiClient.get<PricingOption[]>(`/api/v1/vendor/pricing/${category}`);
    return response.data;
  },

  // Update pricing option
  async updatePricing(category: string, key: string, data: Partial<PricingOption>) {
    const response = await apiClient.put<PricingOption>(`/api/v1/vendor/pricing/${category}/${key}`, data);
    return response.data;
  },

  // Delete pricing option
  async deletePricing(category: string, key: string) {
    await apiClient.delete(`/api/v1/vendor/pricing/${category}/${key}`);
  },
};
