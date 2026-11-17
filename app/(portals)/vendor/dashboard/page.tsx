"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  fetchVendorDashboardStats,
  selectVendorDashboardStats,
  selectVendorDashboardLoading,
  selectVendorDashboardError,
} from "@/store/slices/dashboardSlice";
import {
  fetchVendorBookings,
  fetchVendorBookingCounts,
  selectBookings,
  selectBookingCounts,
  acceptBooking,
  rejectBooking,
} from "@/store/slices/bookingsSlice";
import {
  fetchVendorServiceBoys,
  selectServiceBoys,
} from "@/store/slices/serviceBoysSlice";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  RefreshCw,
  Star,
  TrendingUp,
  Users,
  X,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { BookingStatus, ServiceBoyStatus } from "@/lib/api/types";

const statusBadge: Record<string, { label: string; variant: "success" | "warning" | "default" | "info" | "destructive" }> = {
  pending: { label: "Pending", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "info" },
  assigned: { label: "Assigned", variant: "info" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  cancelled: { label: "Cancelled", variant: "destructive" },
};

const teamStatus: Record<ServiceBoyStatus, { label: string; color: string }> = {
  available: { label: "Available", color: "bg-success" },
  busy: { label: "Busy", color: "bg-warning" },
  offline: { label: "Offline", color: "bg-muted-foreground" },
};

function formatCurrency(amount: number | undefined): string {
  if (!amount) return "₹0";
  return new Intl.NumberFormat("en-IN", { 
    style: "currency", 
    currency: "INR", 
    maximumFractionDigits: 0 
  }).format(amount);
}

function formatDate(dateStr: string | undefined): string {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return "";
  return timeStr;
}

export default function VendorDashboard() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const user = useAppSelector(selectUser);
  const stats = useAppSelector(selectVendorDashboardStats);
  const bookings = useAppSelector(selectBookings);
  const bookingCounts = useAppSelector(selectBookingCounts);
  const serviceBoys = useAppSelector(selectServiceBoys);
  const isLoading = useAppSelector(selectVendorDashboardLoading);
  const error = useAppSelector(selectVendorDashboardError);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchVendorDashboardStats());
    dispatch(fetchVendorBookings({}));
    dispatch(fetchVendorBookingCounts());
    dispatch(fetchVendorServiceBoys());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchVendorDashboardStats());
    dispatch(fetchVendorBookings({}));
    dispatch(fetchVendorBookingCounts());
    dispatch(fetchVendorServiceBoys());
  };

  const handleAcceptBooking = async (bookingId: string) => {
    await dispatch(acceptBooking(bookingId));
    dispatch(fetchVendorBookings({}));
    dispatch(fetchVendorBookingCounts());
  };

  const handleRejectBooking = async (bookingId: string) => {
    await dispatch(rejectBooking({ id: bookingId }));
    dispatch(fetchVendorBookings({}));
    dispatch(fetchVendorBookingCounts());
  };

  // Filter pending bookings for requests section
  const pendingBookings = bookings.filter(b => b.status === "pending");
  
  // Filter today's or upcoming bookings
  const today = new Date().toISOString().split("T")[0];
  const activeBookings = bookings.filter(b => 
    ["confirmed", "assigned", "in_progress"].includes(b.status)
  ).slice(0, 3);

  // Stats data
  const statsCards = [
    { 
      title: "Total Earnings", 
      value: formatCurrency(stats?.totalRevenue), 
      change: stats?.monthlyRevenue ? ((stats.monthlyRevenue / (stats.totalRevenue || 1)) * 100) : 0,
      icon: DollarSign, 
      variant: "primary" as const 
    },
    { 
      title: "Active Bookings", 
      value: (bookingCounts?.inProgress || 0) + (bookingCounts?.assigned || 0) + (bookingCounts?.confirmed || 0), 
      change: 0,
      icon: Calendar, 
      variant: "success" as const 
    },
    { 
      title: "Team Members", 
      value: serviceBoys.length || stats?.activeServiceBoys || 0, 
      icon: Users, 
      variant: "info" as const 
    },
    { 
      title: "Avg Rating", 
      value: stats?.rating?.toFixed(1) || "N/A", 
      icon: Star, 
      variant: "warning" as const 
    },
  ];

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {user?.name}! 🎉</h1>
          <p className="text-muted-foreground">Here's what's happening with your business today</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/vendor/bookings">
            <Button variant="outline">
              <Calendar className="h-4 w-4 mr-2" />
              View Bookings
            </Button>
          </Link>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <span>Failed to load some data: {error}</span>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <GradientCard
            key={stat.title}
            title={stat.title}
            value={String(stat.value)}
            change={Number(stat.change) || undefined}
            icon={<stat.icon className="h-4 w-4" />}
            variant={stat.variant}
          />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Active Bookings
              </CardTitle>
              <Link href="/vendor/bookings" className="text-sm text-primary flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeBookings.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No active bookings
              </div>
            ) : (
              activeBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{booking.customerName}</p>
                        <Badge variant={statusBadge[booking.status]?.variant || "default"}>
                          {statusBadge[booking.status]?.label || booking.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                    </div>
                    <p className="font-semibold text-emerald-600">{formatCurrency(booking.finalAmount)}</p>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDate(booking.scheduledDate)} at {formatTime(booking.scheduledTime)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {booking.address}, {booking.city}
                    </span>
                    {booking.serviceBoyName && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {booking.serviceBoyName}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Pending Requests
                <Badge variant="warning">{pendingBookings.length}</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {pendingBookings.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No pending booking requests
              </div>
            ) : (
              pendingBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="flex-1">
                    <p className="font-medium">{booking.customerName}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking.serviceName} • {formatDate(booking.scheduledDate)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.address}, {booking.city}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-primary">{formatCurrency(booking.finalAmount)}</p>
                    <div className="flex gap-1">
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8 text-success hover:bg-success/10"
                        onClick={() => handleAcceptBooking(booking.id)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="outline" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => handleRejectBooking(booking.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
            {pendingBookings.length > 3 && (
              <Link href="/vendor/bookings?status=pending">
                <Button variant="outline" className="w-full mt-2">
                  View All Pending ({pendingBookings.length})
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Team Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-info" />
                Service Boys Status
              </CardTitle>
              <Link href="/vendor/service-boys" className="text-sm text-primary flex items-center gap-1">
                Manage <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {serviceBoys.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No service boys registered
              </div>
            ) : (
              <div className="space-y-3">
                {serviceBoys.slice(0, 4).map((member) => (
                  <div key={member.id} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Avatar name={member.name} size="sm" />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-card ${teamStatus[member.status]?.color || "bg-gray-400"}`} />
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {member.currentJobId ? `Working on job` : teamStatus[member.status]?.label || member.status}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-sm font-medium">{member.rating?.toFixed(1) || "N/A"}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{member.completedJobs || 0} jobs</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Booking Overview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-bold text-amber-600">{bookingCounts?.pending || 0}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{bookingCounts?.confirmed || 0}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{bookingCounts?.inProgress || 0}</p>
                <p className="text-xs text-muted-foreground">In Progress</p>
              </div>
              <div className="rounded-lg border border-border p-4 text-center">
                <p className="text-2xl font-bold text-emerald-600">{bookingCounts?.completed || 0}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Bookings</span>
                <span className="font-semibold">{bookingCounts?.total || stats?.totalBookings || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Banner */}
      <Card className="bg-[#1b1e85] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">Monthly Revenue</h3>
                <p className="text-white/80">{formatCurrency(stats?.monthlyRevenue)} this month</p>
              </div>
            </div>
            <Link href="/vendor/bookings">
              <Button variant="secondary" className="bg-white text-emerald-600 hover:bg-white/90">
                View All Bookings
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
