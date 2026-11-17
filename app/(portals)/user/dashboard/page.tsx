"use client";

import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  fetchCategories,
  fetchVendors,
  selectCategories,
  selectVendorsList,
  selectCatalogLoading,
} from "@/store/slices/catalogSlice";
import {
  fetchCustomerBookings,
  selectBookings,
  selectBookingsLoading,
} from "@/store/slices/bookingsSlice";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import {
  ArrowRight,
  Calendar,
  Clock,
  Heart,
  Loader2,
  MapPin,
  RefreshCw,
  Sparkles,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { BookingStatus } from "@/lib/api/types";

// Service icons mapping
const categoryIcons: Record<string, string> = {
  cleaning: "🧹",
  electrical: "⚡",
  plumbing: "🔧",
  painting: "🎨",
  carpentry: "🪚",
  photography: "📷",
  catering: "🍽️",
  decoration: "🎉",
  music: "🎵",
  transport: "🚗",
  makeup: "💄",
  default: "🔧",
};

const categoryColors: Record<string, string> = {
  cleaning: "bg-blue-500",
  electrical: "bg-amber-500",
  plumbing: "bg-cyan-500",
  painting: "bg-pink-500",
  carpentry: "bg-orange-500",
  photography: "bg-indigo-500",
  catering: "bg-red-500",
  decoration: "bg-purple-500",
  music: "bg-violet-500",
  transport: "bg-emerald-500",
  makeup: "bg-rose-500",
  default: "bg-gray-500",
};

const statusColors: Record<BookingStatus, "success" | "warning" | "default" | "info" | "destructive"> = {
  confirmed: "success",
  pending: "warning",
  assigned: "info",
  in_progress: "warning",
  completed: "success",
  cancelled: "destructive",
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

function getCategoryIcon(slug: string): string {
  return categoryIcons[slug?.toLowerCase()] || categoryIcons.default;
}

function getCategoryColor(slug: string): string {
  return categoryColors[slug?.toLowerCase()] || categoryColors.default;
}

export default function UserDashboard() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const user = useAppSelector(selectUser);
  const categories = useAppSelector(selectCategories);
  const vendors = useAppSelector(selectVendorsList);
  const bookings = useAppSelector(selectBookings);
  const catalogLoading = useAppSelector(selectCatalogLoading);
  const bookingsLoading = useAppSelector(selectBookingsLoading);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchVendors({}));
    dispatch(fetchCustomerBookings({}));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCategories());
    dispatch(fetchVendors({}));
    dispatch(fetchCustomerBookings({}));
  };

  const isLoading = catalogLoading || bookingsLoading;

  // Filter upcoming bookings (not completed or cancelled)
  const upcomingBookings = bookings.filter(
    b => !["completed", "cancelled"].includes(b.status)
  ).slice(0, 3);
  
  // Count completed bookings
  const completedCount = bookings.filter(b => b.status === "completed").length;
  
  // Get top vendors
  const topVendors = vendors
    .filter(v => v.status === "approved" && v.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3);

  // Stats data
  const stats = [
    { title: "Active Bookings", value: upcomingBookings.length.toString(), icon: Calendar, variant: "primary" as const },
    { title: "Completed", value: completedCount.toString(), icon: Star, variant: "success" as const },
    { title: "Categories", value: categories.length.toString(), icon: Heart, variant: "info" as const },
    { title: "Vendors", value: vendors.filter(v => v.status === "approved").length.toString(), icon: Sparkles, variant: "warning" as const },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {user?.name?.split(" ")[0] || "there"}! 👋</h1>
          <p className="text-muted-foreground">Find and book the best services for your needs</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/user/services">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Book New Service
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <GradientCard
            key={stat.title}
            title={stat.title}
            value={stat.value}
            icon={<stat.icon className="h-4 w-4" />}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Browse Services */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Browse Services</CardTitle>
            <Link href="/user/services" className="text-sm text-primary flex items-center gap-1">
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {catalogLoading && categories.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading services...</span>
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No services available
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {categories.slice(0, 6).map((category) => (
                <Link
                  key={category.id}
                  href={`/user/services?category=${category.id}`}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border p-4 transition-all hover:border-primary hover:shadow-md"
                >
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${getCategoryColor(category.slug)} text-white text-2xl`}>
                    {category.icon || getCategoryIcon(category.slug)}
                  </div>
                  <p className="text-sm font-medium text-center">{category.name}</p>
                  <p className="text-xs text-muted-foreground">{category.servicesCount || 0} services</p>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Upcoming Bookings</CardTitle>
              <Link href="/user/bookings" className="text-sm text-primary flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {bookingsLoading && bookings.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : upcomingBookings.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming bookings</p>
                <Link href="/user/services">
                  <Button variant="outline" className="mt-4">
                    Book a Service
                  </Button>
                </Link>
              </div>
            ) : (
              upcomingBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-start gap-4 rounded-lg border border-border p-4"
                >
                  <div className="flex h-12 w-12 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-xs font-medium">{formatDate(booking.scheduledDate).split(" ")[0]}</span>
                    <span className="text-sm font-bold">{formatDate(booking.scheduledDate).split(" ")[1]}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-medium">{booking.vendorName}</p>
                        <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                      </div>
                      <Badge variant={statusColors[booking.status] || "default"}>
                        {booking.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {booking.scheduledTime}
                      </span>
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {booking.city}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Top Vendors */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Top Rated Vendors</CardTitle>
              <Link href="/user/services" className="text-sm text-primary flex items-center gap-1">
                Explore <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {catalogLoading && vendors.length === 0 ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : topVendors.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No vendors available yet</p>
              </div>
            ) : (
              topVendors.map((vendor) => (
                <div
                  key={vendor.id}
                  className="flex items-center gap-4 rounded-lg border border-border p-4 transition-all hover:border-primary hover:shadow-sm"
                >
                  <Avatar name={vendor.businessName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{vendor.businessName}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {vendor.services?.join(", ") || "Multiple services"}
                    </p>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-warning text-warning" />
                        <span className="text-sm font-medium">{vendor.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({vendor.completedBookings} bookings)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge 
                      variant={vendor.isStoreOpen ? "success" : "default"}
                      className="text-xs"
                    >
                      {vendor.isStoreOpen ? "Open" : "Closed"}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-[#1b1e85] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">Need a Service?</h3>
              <p className="text-white/80">Browse our catalog to find the perfect service provider</p>
            </div>
            <Link href="/user/services">
              <Button variant="secondary" className="bg-white text-primary hover:bg-white/90">
                Browse Services
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
