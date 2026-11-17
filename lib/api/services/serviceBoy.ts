import apiClient from "../client";
import type { ServiceBoy, ServiceBoyJob, ServiceBoyStats } from "../types";

// ==================== Service Boy Profile API ====================

export const serviceBoyProfileApi = {
  // Get profile
  async getProfile() {
    const response = await apiClient.get<ServiceBoy>("/api/v1/service-boy/profile");
    return response.data;
  },

  // Update profile
  async updateProfile(data: {
    name?: string;
    phone?: string;
    avatar?: string;
    skills?: string[];
  }) {
    const response = await apiClient.put<ServiceBoy>("/api/v1/service-boy/profile", data);
    return response.data;
  },

  // Get stats
  async getStats() {
    const response = await apiClient.get<ServiceBoyStats>("/api/v1/service-boy/stats");
    return response.data;
  },

  // Update status (online/offline)
  async updateStatus(status: "available" | "offline") {
    const response = await apiClient.patch<{ status: string }>("/api/v1/service-boy/status", { status });
    return response.data;
  },

  // Update location
  async updateLocation(lat: number, lng: number) {
    const response = await apiClient.post<{ message: string }>("/api/v1/service-boy/location", { lat, lng });
    return response.data;
  },
};

// ==================== Service Boy Jobs API ====================

export const serviceBoyJobsApi = {
  // Get assigned jobs
  async getAssignedJobs() {
    const response = await apiClient.get<ServiceBoyJob[]>("/api/v1/service-boy/jobs/assigned");
    return response.data;
  },

  // Get completed jobs
  async getCompletedJobs() {
    const response = await apiClient.get<ServiceBoyJob[]>("/api/v1/service-boy/jobs/completed");
    return response.data;
  },

  // Get job by ID
  async getJob(id: string) {
    const response = await apiClient.get<ServiceBoyJob>(`/api/v1/service-boy/jobs/${id}`);
    return response.data;
  },

  // Accept job
  async acceptJob(id: string) {
    const response = await apiClient.patch<ServiceBoyJob>(`/api/v1/service-boy/jobs/${id}/accept`);
    return response.data;
  },

  // Decline job
  async declineJob(id: string, reason?: string) {
    const response = await apiClient.patch<ServiceBoyJob>(`/api/v1/service-boy/jobs/${id}/decline`, { reason });
    return response.data;
  },

  // Start job
  async startJob(id: string) {
    const response = await apiClient.patch<ServiceBoyJob>(`/api/v1/service-boy/jobs/${id}/start`);
    return response.data;
  },

  // Complete job
  async completeJob(id: string, data?: { notes?: string }) {
    const response = await apiClient.patch<ServiceBoyJob>(`/api/v1/service-boy/jobs/${id}/complete`, data);
    return response.data;
  },

  // Update job status
  async updateJobStatus(id: string, status: string) {
    const response = await apiClient.patch<ServiceBoyJob>(`/api/v1/service-boy/jobs/${id}/status`, { status });
    return response.data;
  },
};
