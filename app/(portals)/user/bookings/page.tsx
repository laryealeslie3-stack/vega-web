"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCustomerBookings,
  selectBookings,
  selectBookingsLoading,
  selectBookingsError,
} from "@/store/slices/bookingsSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Calendar,
  Check,
  Clock,
  Eye,
  Filter,
  Loader2,
  MapPin,
  MoreHorizontal,
  Phone,
  Play,
  RefreshCw,
  Search,
  Star,
  User,
  XCircle,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";
import type { Booking, BookingStatus } from "@/lib/api/types";

const statusBadge: Record<BookingStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { 
    label: "Pending", 
    icon: <Clock className="mr-1 h-3 w-3" />, 
    className: "bg-amber-100 text-amber-700" 
  },
  confirmed: { 
    label: "Confirmed", 
    icon: <Check className="mr-1 h-3 w-3" />, 
    className: "bg-blue-100 text-blue-700" 
  },
  assigned: { 
    label: "Assigned", 
    icon: <User className="mr-1 h-3 w-3" />, 
    className: "bg-indigo-100 text-indigo-700" 
  },
  in_progress: { 
    label: "In Progress", 
    icon: <Play className="mr-1 h-3 w-3" />, 
    className: "bg-purple-100 text-purple-700" 
  },
  completed: { 
    label: "Completed", 
    icon: <CheckCircle className="mr-1 h-3 w-3" />, 
    className: "bg-emerald-100 text-emerald-700" 
  },
  cancelled: { 
    label: "Cancelled", 
    icon: <XCircle className="mr-1 h-3 w-3" />, 
    className: "bg-red-100 text-red-700" 
  },
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
  if (!dateStr) return "N/A";
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

function getStatusBadge(status: BookingStatus) {
  const config = statusBadge[status] || statusBadge.pending;
  return (
    <Badge className={`${config.className} hover:${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

export default function UserBookingsPage() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const bookings = useAppSelector(selectBookings);
  const isLoading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCustomerBookings({}));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchCustomerBookings({}));
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Separate bookings
  const activeBookings = filteredBookings.filter(
    b => !["completed", "cancelled"].includes(b.status)
  );
  const pastBookings = filteredBookings.filter(
    b => ["completed", "cancelled"].includes(b.status)
  );

  const openDetailDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  // Count by status
  const counts = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    active: bookings.filter(b => ["confirmed", "assigned", "in_progress"].includes(b.status)).length,
    completed: bookings.filter(b => b.status === "completed").length,
    cancelled: bookings.filter(b => b.status === "cancelled").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bookings</h1>
          <p className="text-muted-foreground">Manage your upcoming and past bookings</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/user/services">
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Book New
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts.active}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{counts.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search bookings..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="assigned">Assigned</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error loading bookings</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && bookings.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading bookings...</span>
        </div>
      ) : filteredBookings.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchQuery || statusFilter !== "all"
                ? "No bookings found matching your filters"
                : "No bookings yet"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Link href="/user/services">
                <Button variant="outline" className="mt-4">
                  Book a Service
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        /* Tabs */
        <Tabs defaultValue="active">
          <TabsList>
            <TabsTrigger value="active">Active ({activeBookings.length})</TabsTrigger>
            <TabsTrigger value="past">Past ({pastBookings.length})</TabsTrigger>
          </TabsList>

          {/* Active Bookings Tab */}
          <TabsContent value="active" className="mt-4">
            {activeBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No active bookings</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Schedule</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {activeBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.categoryName}</p>
                              <p className="text-xs text-gray-500">{booking.serviceName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.vendorName}</p>
                              {booking.serviceBoyName && (
                                <p className="text-xs text-gray-500">
                                  Assigned: {booking.serviceBoyName}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-sm">
                              <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                              {formatDate(booking.scheduledDate)}
                            </div>
                            <p className="text-xs text-gray-500">{booking.scheduledTime}</p>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-start gap-1 text-sm max-w-[150px]">
                              <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                              <span className="truncate">{booking.city}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{formatCurrency(booking.finalAmount)}</p>
                            <Badge
                              variant="outline"
                              className={
                                booking.paymentStatus === "paid"
                                  ? "text-emerald-700 border-emerald-200"
                                  : "text-amber-700 border-amber-200"
                              }
                            >
                              {booking.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openDetailDialog(booking)}>
                                  <Eye className="mr-2 h-4 w-4" />
                                  View Details
                                </DropdownMenuItem>
                                {booking.serviceBoyName && (
                                  <DropdownMenuItem asChild>
                                    <a href={`tel:${booking.customerPhone}`}>
                                      <Phone className="mr-2 h-4 w-4" />
                                      Contact Vendor
                                    </a>
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Past Bookings Tab */}
          <TabsContent value="past" className="mt-4">
            {pastBookings.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No past bookings</p>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Service</TableHead>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Rating</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pastBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{booking.categoryName}</p>
                              <p className="text-xs text-gray-500">{booking.serviceName}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{booking.vendorName}</p>
                          </TableCell>
                          <TableCell>
                            {formatDate(booking.completedAt || booking.cancelledAt || booking.scheduledDate)}
                          </TableCell>
                          <TableCell>
                            <p className="font-medium">{formatCurrency(booking.finalAmount)}</p>
                          </TableCell>
                          <TableCell>{getStatusBadge(booking.status)}</TableCell>
                          <TableCell>
                            {booking.status === "completed" && booking.rating ? (
                              <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-warning text-warning" />
                                <span>{booking.rating}</span>
                              </div>
                            ) : booking.status === "completed" ? (
                              <Button variant="outline" size="sm" className="h-7 text-xs">
                                Rate
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => openDetailDialog(booking)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Booking Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Booking ID: {selectedBooking?.id?.substring(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              {/* Service Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Service</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Category:</span> {selectedBooking.categoryName}</p>
                  <p><span className="text-gray-500">Service:</span> {selectedBooking.serviceName}</p>
                  <p><span className="text-gray-500">Vendor:</span> {selectedBooking.vendorName}</p>
                  {selectedBooking.serviceBoyName && (
                    <p><span className="text-gray-500">Assigned To:</span> {selectedBooking.serviceBoyName}</p>
                  )}
                </div>
              </div>

              {/* Schedule */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Schedule</h4>
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(selectedBooking.scheduledDate)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {selectedBooking.scheduledTime}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Location</h4>
                <p className="text-sm flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  {selectedBooking.address}, {selectedBooking.city}
                </p>
              </div>

              {/* Payment */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Payment</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Amount:</span> {formatCurrency(selectedBooking.finalAmount)}</p>
                  {selectedBooking.discount && selectedBooking.discount > 0 && (
                    <p><span className="text-gray-500">Discount:</span> -{formatCurrency(selectedBooking.discount)}</p>
                  )}
                  <p>
                    <span className="text-gray-500">Status:</span>{" "}
                    <Badge variant="outline">{selectedBooking.paymentStatus}</Badge>
                  </p>
                  {selectedBooking.paymentMethod && (
                    <p><span className="text-gray-500">Method:</span> {selectedBooking.paymentMethod}</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Status:</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Review */}
              {selectedBooking.status === "completed" && selectedBooking.rating && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Your Review</h4>
                  <div className="flex items-center gap-2 mb-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < selectedBooking.rating! ? "fill-warning text-warning" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  {selectedBooking.review && (
                    <p className="text-sm text-muted-foreground">{selectedBooking.review}</p>
                  )}
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
