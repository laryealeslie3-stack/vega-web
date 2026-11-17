"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  fetchAdminDashboardStats,
  fetchAdminRecentBookings,
  fetchAdminTopVendors,
  fetchAdminServiceBoyStats,
  selectAdminDashboardStats,
  selectAdminRecentBookings,
  selectAdminTopVendors,
  selectAdminServiceBoyStats,
  selectAdminDashboardLoading,
  selectAdminDashboardError,
} from "@/store/slices/dashboardSlice";
import { fetchPendingVendors, selectPendingVendors } from "@/store/slices/vendorsSlice";
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
  RefreshCw,
  Star,
  Store,
  TrendingUp,
  Users,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { BookingStatus } from "@/lib/api/types";

const statusBadge: Record<string, { label: string; variant: "success" | "warning" | "info" | "default" | "destructive" }> = {
  completed: { label: "Completed", variant: "success" },
  in_progress: { label: "In Progress", variant: "warning" },
  confirmed: { label: "Confirmed", variant: "info" },
  assigned: { label: "Assigned", variant: "info" },
  pending: { label: "Pending", variant: "default" },
  cancelled: { label: "Cancelled", variant: "destructive" },
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
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) return "Just now";
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return dateStr;
  }
}

export default function AdminDashboard() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const user = useAppSelector(selectUser);
  const stats = useAppSelector(selectAdminDashboardStats);
  const recentBookings = useAppSelector(selectAdminRecentBookings);
  const topVendors = useAppSelector(selectAdminTopVendors);
  const serviceBoyStats = useAppSelector(selectAdminServiceBoyStats);
  const pendingVendors = useAppSelector(selectPendingVendors);
  const isLoading = useAppSelector(selectAdminDashboardLoading);
  const error = useAppSelector(selectAdminDashboardError);

  // Fetch dashboard data on mount
  useEffect(() => {
    dispatch(fetchAdminDashboardStats());
    dispatch(fetchAdminRecentBookings(5));
    dispatch(fetchAdminTopVendors(5));
    dispatch(fetchAdminServiceBoyStats());
    dispatch(fetchPendingVendors());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAdminDashboardStats());
    dispatch(fetchAdminRecentBookings(5));
    dispatch(fetchAdminTopVendors(5));
    dispatch(fetchAdminServiceBoyStats());
    dispatch(fetchPendingVendors());
  };

  // Calculate completion rate
  const completionRate = stats?.totalBookings 
    ? ((stats.completedBookings / stats.totalBookings) * 100).toFixed(1)
    : "0";

  // Stats data
  const statsCards = [
    { 
      title: "Total Revenue", 
      value: formatCurrency(stats?.totalRevenue), 
      change: stats?.monthlyRevenue ? ((stats.monthlyRevenue / (stats.totalRevenue || 1)) * 100).toFixed(1) : 0,
      icon: DollarSign, 
      variant: "primary" as const 
    },
    { 
      title: "Total Bookings", 
      value: stats?.totalBookings?.toLocaleString() || "0", 
      change: 0,
      icon: Calendar, 
      variant: "success" as const 
    },
    { 
      title: "Active Vendors", 
      value: stats?.activeVendors?.toString() || "0", 
      change: 0,
      icon: Store, 
      variant: "ocean" as const 
    },
    { 
      title: "Completion Rate", 
      value: `${completionRate}%`, 
      change: 0,
      icon: TrendingUp, 
      variant: "sunset" as const 
    },
  ];

  // Service boy status data
  const serviceBoyStatusData = [
    { status: "Available", count: serviceBoyStats?.available || 0, color: "bg-success" },
    { status: "Busy", count: serviceBoyStats?.busy || 0, color: "bg-warning" },
    { status: "Offline", count: serviceBoyStats?.offline || 0, color: "bg-muted-foreground" },
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
          <h1 className="text-2xl font-bold">Welcome back, {user?.name || "Admin"}! 🛡️</h1>
          <p className="text-muted-foreground">Here's your complete business overview</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/admin/vendors">
            <Button variant="outline">
              <Store className="h-4 w-4 mr-2" />
              Manage Vendors
            </Button>
          </Link>
          <Link href="/admin/booking">
            <Button>
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
            <span>Failed to load some dashboard data: {error}</span>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((stat) => (
          <GradientCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            change={Number(stat.change)}
            icon={<stat.icon className="h-4 w-4" />}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-success/10 text-success">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xs text-muted-foreground">Service Boys</p>
              <p className="text-lg font-bold">
                {serviceBoyStats?.available || 0} / {serviceBoyStats?.total || stats?.totalServiceBoys || 0}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/10 text-warning">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xs text-muted-foreground">Pending Approvals</p>
              <p className="text-lg font-bold">{pendingVendors?.length || stats?.pendingVendors || 0} vendors</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xs text-muted-foreground">Pending Bookings</p>
              <p className="text-lg font-bold">{stats?.pendingBookings || 0}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xs text-muted-foreground">Total Customers</p>
              <p className="text-lg font-bold">{stats?.totalCustomers?.toLocaleString() || 0}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Recent Bookings
              </CardTitle>
              <Link href="/admin/booking" className="text-sm text-primary flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentBookings.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No recent bookings
              </div>
            ) : (
              recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between py-2 border-b border-border last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Avatar name={booking.customerName} size="sm" />
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-xs text-muted-foreground">{booking.vendorName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(booking.finalAmount)}</p>
                    <Badge variant={statusBadge[booking.status]?.variant || "default"}>
                      {statusBadge[booking.status]?.label || booking.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Pending Vendor Approvals */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-warning" />
                Pending Approvals
                <Badge variant="warning">{pendingVendors?.length || 0}</Badge>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {!pendingVendors || pendingVendors.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No pending vendor approvals
              </div>
            ) : (
              <>
                {pendingVendors.slice(0, 3).map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar name={vendor.businessName} size="sm" />
                      <div>
                        <p className="font-medium">{vendor.businessName}</p>
                        <p className="text-xs text-muted-foreground">
                          {vendor.email} • {formatDate(vendor.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-success hover:bg-success/10">
                        <Check className="h-4 w-4" />
                      </Button>
                      <Link href={`/admin/vendors?id=${vendor.id}`}>
                        <Button size="sm" variant="outline" className="h-8">
                          Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
                <Link href="/admin/vendors">
                  <Button variant="outline" className="w-full mt-2">
                    View All Pending
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Store className="h-5 w-5 text-emerald-500" />
                Top Performing Vendors
              </CardTitle>
              <Link href="/admin/vendors" className="text-sm text-primary flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {topVendors.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No vendors found
              </div>
            ) : (
              topVendors.map((vendor, i) => (
                <div key={vendor.id} className="flex items-center gap-3 py-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{vendor.businessName}</p>
                    <p className="text-xs text-muted-foreground">
                      {vendor.totalBookings} bookings • {vendor.completedBookings} completed
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                    <span className="text-sm font-medium">{vendor.rating?.toFixed(1) || "N/A"}</span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Service Boy Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-500" />
                Service Boys Status
              </CardTitle>
              <Link href="/admin/booking" className="text-sm text-primary flex items-center gap-1">
                Manage <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              {serviceBoyStatusData.map((stat) => (
                <div key={stat.status} className="rounded-lg border border-border p-4 text-center">
                  <div className={`mx-auto mb-2 h-3 w-3 rounded-full ${stat.color}`} />
                  <p className="text-2xl font-bold">{stat.count}</p>
                  <p className="text-xs text-muted-foreground">{stat.status}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Total Service Boys</span>
                <span className="font-semibold">{serviceBoyStats?.total || stats?.totalServiceBoys || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Banner */}
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
            <Link href="/admin/booking">
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                View Analytics
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
