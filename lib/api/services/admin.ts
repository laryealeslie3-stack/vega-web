import apiClient from "../client";
import type {
  Vendor,
  VendorRequest,
  Booking,
  BookingCounts,
  ServiceBoy,
  User,
  Category,
  ServiceArea,
  PricingOption,
  QuoteRequest,
  PaginationParams,
  AdminDashboardStats,
} from "../types";

// ==================== Admin Dashboard API ====================

export const adminDashboardApi = {
  // Get dashboard stats
  async getStats() {
    const response = await apiClient.get<AdminDashboardStats>("/api/v1/admin/dashboard/stats");
    return response.data;
  },

  // Get recent bookings for dashboard
  async getRecentBookings(limit: number = 5) {
    const response = await apiClient.get<Booking[]>("/api/v1/admin/bookings", { 
      params: { limit, sort: "-createdAt" } 
    });
    return response.data;
  },

  // Get top vendors by revenue
  async getTopVendors(limit: number = 5) {
    const response = await apiClient.get<Vendor[]>("/api/v1/admin/vendors", { 
      params: { limit, sort: "-totalBookings", status: "approved" } 
    });
    return response.data;
  },

  // Get service boy stats summary
  async getServiceBoyStats() {
    const response = await apiClient.get<{
      available: number;
      busy: number;
      offline: number;
      total: number;
    }>("/api/v1/admin/service-boys/stats");
    return response.data;
  },
};

// ==================== Admin Vendors API ====================

export const adminVendorsApi = {
  // Get all vendors
  async getVendors(params?: PaginationParams & { status?: string }) {
    const response = await apiClient.get<Vendor[]>("/api/v1/admin/vendors", { params });
    return response.data;
  },

  // Get pending vendors
  async getPendingVendors() {
    const response = await apiClient.get<Vendor[]>("/api/v1/admin/vendors/pending");
    return response.data;
  },

  // Get vendor by ID
  async getVendor(id: string) {
    const response = await apiClient.get<Vendor>(`/api/v1/admin/vendors/${id}`);
    return response.data;
  },

  // Create vendor (by admin)
  async createVendor(data: {
    businessName: string;
    email: string;
    phone: string;
    password: string;
    description?: string;
  }) {
    const response = await apiClient.post<Vendor>("/api/v1/admin/vendors", data);
    return response.data;
  },

  // Approve vendor
  async approveVendor(id: string) {
    const response = await apiClient.patch<Vendor>(`/api/v1/admin/vendors/${id}/approve`);
    return response.data;
  },

  // Reject vendor
  async rejectVendor(id: string, reason?: string) {
    const response = await apiClient.patch<Vendor>(`/api/v1/admin/vendors/${id}/reject`, { reason });
    return response.data;
  },

  // Suspend vendor
  async suspendVendor(id: string, reason?: string) {
    const response = await apiClient.patch<Vendor>(`/api/v1/admin/vendors/${id}/suspend`, { reason });
    return response.data;
  },

  // Reactivate vendor
  async reactivateVendor(id: string) {
    const response = await apiClient.patch<Vendor>(`/api/v1/admin/vendors/${id}/reactivate`);
    return response.data;
  },

  // Get vendor requests
  async getVendorRequests(params?: PaginationParams) {
    const response = await apiClient.get<VendorRequest[]>("/api/v1/admin/vendor-requests", { params });
    return response.data;
  },

  // Get vendor request by ID
  async getVendorRequest(id: string) {
    const response = await apiClient.get<VendorRequest>(`/api/v1/admin/vendor-requests/${id}`);
    return response.data;
  },

  // Approve vendor request
  async approveVendorRequest(id: string) {
    const response = await apiClient.patch<VendorRequest>(`/api/v1/admin/vendor-requests/${id}/approve`);
    return response.data;
  },

  // Reject vendor request
  async rejectVendorRequest(id: string, reason?: string) {
    const response = await apiClient.patch<VendorRequest>(`/api/v1/admin/vendor-requests/${id}/reject`, { reason });
    return response.data;
  },
};

// ==================== Admin Bookings API ====================

export const adminBookingsApi = {
  // Get all bookings
  async getBookings(params?: PaginationParams & { status?: string; vendorId?: string }) {
    const response = await apiClient.get<Booking[]>("/api/v1/admin/bookings", { params });
    return response.data;
  },

  // Get booking by ID
  async getBooking(id: string) {
    const response = await apiClient.get<Booking>(`/api/v1/admin/bookings/${id}`);
    return response.data;
  },
};

// ==================== Admin Service Boys API ====================

export const adminServiceBoysApi = {
  // Get all service boys
  async getServiceBoys(params?: PaginationParams & { vendorId?: string; status?: string }) {
    const response = await apiClient.get<ServiceBoy[]>("/api/v1/admin/service-boys", { params });
    return response.data;
  },

  // Get service boy by ID
  async getServiceBoy(id: string) {
    const response = await apiClient.get<ServiceBoy>(`/api/v1/admin/service-boys/${id}`);
    return response.data;
  },

  // Update service boy status
  async updateServiceBoyStatus(id: string, status: "active" | "suspended") {
    const response = await apiClient.patch<ServiceBoy>(`/api/v1/admin/service-boys/${id}/status`, { status });
    return response.data;
  },
};

// ==================== Admin Users API ====================

export const adminUsersApi = {
  // Get all users (customers)
  async getUsers(params?: PaginationParams & { role?: string }) {
    const response = await apiClient.get<User[]>("/api/v1/admin/users", { params });
    return response.data;
  },

  // Get user by ID
  async getUser(id: string) {
    const response = await apiClient.get<User>(`/api/v1/admin/users/${id}`);
    return response.data;
  },

  // Update user status
  async updateUserStatus(id: string, status: "active" | "suspended") {
    const response = await apiClient.patch<User>(`/api/v1/admin/users/${id}/status`, { status });
    return response.data;
  },
};

// ==================== Admin Catalog API ====================

export const adminCatalogApi = {
  // Categories
  async getCategories() {
    const response = await apiClient.get<Category[]>("/api/v1/admin/categories");
    return response.data;
  },

  async createCategory(data: { name: string; description?: string; icon?: string; image?: string }) {
    const response = await apiClient.post<Category>("/api/v1/admin/categories", data);
    return response.data;
  },

  async updateCategory(id: string, data: Partial<Category>) {
    const response = await apiClient.put<Category>(`/api/v1/admin/categories/${id}`, data);
    return response.data;
  },

  async deleteCategory(id: string) {
    await apiClient.delete(`/api/v1/admin/categories/${id}`);
  },

  // Service Areas
  async getAreas() {
    const response = await apiClient.get<ServiceArea[]>("/api/v1/admin/areas");
    return response.data;
  },

  async createArea(data: { name: string; city: string; state: string; pincode: string }) {
    const response = await apiClient.post<ServiceArea>("/api/v1/admin/areas", data);
    return response.data;
  },

  async updateArea(id: string, data: Partial<ServiceArea>) {
    const response = await apiClient.put<ServiceArea>(`/api/v1/admin/areas/${id}`, data);
    return response.data;
  },

  async toggleArea(id: string) {
    const response = await apiClient.patch<ServiceArea>(`/api/v1/admin/areas/${id}/toggle`);
    return response.data;
  },

  // Services
  async getServices() {
    const response = await apiClient.get<any[]>("/api/v1/admin/services");
    return response.data;
  },

  // Service Requests
  async getServiceRequests() {
    const response = await apiClient.get<any[]>("/api/v1/admin/service-requests");
    return response.data;
  },

  async getServiceRequest(id: string) {
    const response = await apiClient.get<any>(`/api/v1/admin/service-requests/${id}`);
    return response.data;
  },

  async approveServiceRequest(id: string) {
    const response = await apiClient.patch<any>(`/api/v1/admin/service-requests/${id}/approve`);
    return response.data;
  },

  async rejectServiceRequest(id: string, reason?: string) {
    const response = await apiClient.patch<any>(`/api/v1/admin/service-requests/${id}/reject`, { reason });
    return response.data;
  },
};

// ==================== Admin Pricing API ====================

export const adminPricingApi = {
  // Get pricing for category
  async getPricing(category: string) {
    const response = await apiClient.get<PricingOption[]>(`/api/v1/admin/pricing/${category}`);
    return response.data;
  },

  // Update pricing option
  async updatePricing(category: string, key: string, data: Partial<PricingOption>) {
    const response = await apiClient.put<PricingOption>(`/api/v1/admin/pricing/${category}/${key}`, data);
    return response.data;
  },
};

// ==================== Admin Quote Requests API ====================

export const adminQuoteRequestsApi = {
  async getQuoteRequests(params?: PaginationParams) {
    const response = await apiClient.get<QuoteRequest[]>("/api/v1/admin/quote-requests", { params });
    return response.data;
  },
};
