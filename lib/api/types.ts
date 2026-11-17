// ==================== Common Types ====================

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ==================== User Types ====================

export type UserRole = "user" | "vendor" | "serviceBoy" | "admin";

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  mustChangePassword: boolean;
  status?: "active" | "suspended" | "pending";
  createdAt?: string;
}

// ==================== Vendor Types ====================

export type VendorStatus = "pending" | "approved" | "rejected" | "suspended";

export interface VendorLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  lat?: number;
  lng?: number;
  isActive: boolean;
}

export interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  email: string;
  phone: string;
  description?: string;
  logo?: string;
  status: VendorStatus;
  rating: number;
  totalBookings: number;
  completedBookings: number;
  locations: VendorLocation[];
  services: string[];
  isStoreOpen: boolean;
  createdAt: string;
  approvedAt?: string;
}

export interface VendorRequest {
  id: string;
  businessName: string;
  email: string;
  phone: string;
  description?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  rejectionReason?: string;
}

// ==================== Service Types ====================

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  isActive: boolean;
  servicesCount: number;
}

export interface ServiceArea {
  id: string;
  name: string;
  city: string;
  state: string;
  pincode: string;
  isActive: boolean;
}

export interface Service {
  id: string;
  categoryId: string;
  categoryName: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  basePrice: number;
  duration: number; // in minutes
  isActive: boolean;
}

export interface PricingOption {
  key: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  includedList?: string[];
  exampleModels?: string[];
}

// ==================== Booking Types ====================

export type BookingStatus = 
  | "pending" 
  | "confirmed" 
  | "assigned" 
  | "in_progress" 
  | "completed" 
  | "cancelled";

export interface Booking {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  vendorId: string;
  vendorName: string;
  serviceBoyId?: string;
  serviceBoyName?: string;
  categoryId: string;
  categoryName: string;
  serviceId: string;
  serviceName: string;
  status: BookingStatus;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  amount: number;
  discount?: number;
  finalAmount: number;
  paymentStatus: "pending" | "paid" | "refunded";
  paymentMethod?: string;
  notes?: string;
  rating?: number;
  review?: string;
  createdAt: string;
  confirmedAt?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
}

export interface BookingCounts {
  pending: number;
  confirmed: number;
  assigned: number;
  inProgress: number;
  completed: number;
  cancelled: number;
  total: number;
}

// ==================== Service Boy Types ====================

export type ServiceBoyStatus = "available" | "busy" | "offline";

export interface ServiceBoy {
  id: string;
  userId: string;
  vendorId: string;
  vendorName: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  status: ServiceBoyStatus;
  skills: string[];
  rating: number;
  totalJobs: number;
  completedJobs: number;
  currentJobId?: string;
  lastLocation?: {
    lat: number;
    lng: number;
    updatedAt: string;
  };
  isActive: boolean;
  createdAt: string;
}

export interface ServiceBoyJob {
  id: string;
  bookingId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  address: string;
  city: string;
  lat?: number;
  lng?: number;
  categoryName: string;
  serviceName: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "assigned" | "accepted" | "in_progress" | "completed" | "declined";
  amount: number;
  notes?: string;
  assignedAt: string;
  acceptedAt?: string;
  startedAt?: string;
  completedAt?: string;
}

export interface ServiceBoyStats {
  todayJobs: number;
  completedToday: number;
  pendingJobs: number;
  weeklyEarnings: number;
  monthlyEarnings: number;
  rating: number;
  totalCompletedJobs: number;
}

// ==================== Dashboard Types ====================

export interface AdminDashboardStats {
  totalVendors: number;
  pendingVendors: number;
  activeVendors: number;
  totalCustomers: number;
  totalServiceBoys: number;
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface VendorDashboardStats {
  totalBookings: number;
  pendingBookings: number;
  todayBookings: number;
  completedBookings: number;
  totalRevenue: number;
  monthlyRevenue: number;
  activeServiceBoys: number;
  rating: number;
}

// ==================== Quote Request Types ====================

export interface QuoteRequest {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  categoryId: string;
  categoryName: string;
  description: string;
  status: "pending" | "quoted" | "accepted" | "rejected";
  createdAt: string;
}
