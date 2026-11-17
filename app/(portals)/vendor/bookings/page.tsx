"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchVendorBookings,
  fetchVendorBookingCounts,
  acceptBooking,
  rejectBooking,
  assignServiceBoy,
  selectBookings,
  selectBookingCounts,
  selectBookingsLoading,
  selectBookingsError,
} from "@/store/slices/bookingsSlice";
import {
  fetchVendorServiceBoys,
  selectServiceBoys,
} from "@/store/slices/serviceBoysSlice";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  RefreshCw,
  Search,
  UserPlus,
  Users,
  X,
  XCircle,
  CheckCircle,
  Play,
} from "lucide-react";
import type { Booking, BookingStatus, ServiceBoy } from "@/lib/api/types";

const statusBadge: Record<BookingStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: { 
    label: "Pending", 
    icon: <Clock className="mr-1 h-3 w-3" />, 
    className: "bg-amber-100 text-amber-700" 
  },
  confirmed: { 
    label: "Confirmed", 
    icon: <CheckCircle className="mr-1 h-3 w-3" />, 
    className: "bg-blue-100 text-blue-700" 
  },
  assigned: { 
    label: "Assigned", 
    icon: <Users className="mr-1 h-3 w-3" />, 
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

export default function VendorBookingsPage() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const bookings = useAppSelector(selectBookings);
  const bookingCounts = useAppSelector(selectBookingCounts);
  const serviceBoys = useAppSelector(selectServiceBoys);
  const isLoading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [selectedServiceBoy, setSelectedServiceBoy] = useState<string>("");
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchVendorBookings({}));
    dispatch(fetchVendorBookingCounts());
    dispatch(fetchVendorServiceBoys());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchVendorBookings({}));
    dispatch(fetchVendorBookingCounts());
  };

  // Filter bookings
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleAccept = async (booking: Booking) => {
    setActionLoading(true);
    try {
      await dispatch(acceptBooking(booking.id)).unwrap();
      dispatch(fetchVendorBookings({}));
      dispatch(fetchVendorBookingCounts());
    } catch (err) {
      console.error("Failed to accept booking:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectConfirm = async () => {
    if (!selectedBooking) return;
    setActionLoading(true);
    try {
      await dispatch(rejectBooking({ id: selectedBooking.id, reason: rejectReason })).unwrap();
      dispatch(fetchVendorBookings({}));
      dispatch(fetchVendorBookingCounts());
      setIsRejectOpen(false);
      setSelectedBooking(null);
      setRejectReason("");
    } catch (err) {
      console.error("Failed to reject booking:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAssignConfirm = async () => {
    if (!selectedBooking || !selectedServiceBoy) return;
    setActionLoading(true);
    try {
      await dispatch(assignServiceBoy({ 
        bookingId: selectedBooking.id, 
        serviceBoyId: selectedServiceBoy 
      })).unwrap();
      dispatch(fetchVendorBookings({}));
      setIsAssignOpen(false);
      setSelectedBooking(null);
      setSelectedServiceBoy("");
    } catch (err) {
      console.error("Failed to assign service boy:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsRejectOpen(true);
  };

  const openAssignDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsAssignOpen(true);
  };

  const openDetailDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailOpen(true);
  };

  // Get available service boys
  const availableServiceBoys = serviceBoys.filter(sb => sb.status === "available");

  const getStatusBadge = (status: BookingStatus) => {
    const config = statusBadge[status] || statusBadge.pending;
    return (
      <Badge className={`${config.className} hover:${config.className}`}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-muted-foreground">Manage all your customer bookings</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookingCounts?.total || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookingCounts?.pending || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">Confirmed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookingCounts?.confirmed || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600">Assigned</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookingCounts?.assigned || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookingCounts?.completed || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">Cancelled</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{bookingCounts?.cancelled || 0}</p>
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
      ) : (
        /* Bookings Table */
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Service Boy</TableHead>
                  <TableHead>Schedule</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      {searchQuery || statusFilter !== "all"
                        ? "No bookings found matching your filters"
                        : "No bookings found"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium font-mono text-xs">
                        {booking.id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-xs text-gray-500 flex items-center">
                            <Phone className="h-3 w-3 mr-1" />
                            {booking.customerPhone}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.categoryName}</p>
                          <p className="text-xs text-gray-500">{booking.serviceName}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {booking.serviceBoyName || (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                          {formatDate(booking.scheduledDate)}
                        </div>
                        <p className="text-xs text-gray-500">{booking.scheduledTime}</p>
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
                            
                            {booking.status === "pending" && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => handleAccept(booking)}
                                  className="text-emerald-600"
                                >
                                  <Check className="mr-2 h-4 w-4" />
                                  Accept Booking
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => openRejectDialog(booking)}
                                  className="text-red-600"
                                >
                                  <X className="mr-2 h-4 w-4" />
                                  Reject Booking
                                </DropdownMenuItem>
                              </>
                            )}
                            
                            {(booking.status === "confirmed" || booking.status === "assigned") && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => openAssignDialog(booking)}>
                                  <UserPlus className="mr-2 h-4 w-4" />
                                  {booking.serviceBoyId ? "Reassign" : "Assign"} Service Boy
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Booking Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
            <DialogDescription>
              Booking ID: {selectedBooking?.id}
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              {/* Customer Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Customer</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Name:</span>{" "}
                    {selectedBooking.customerName}
                  </div>
                  <div>
                    <span className="text-gray-500">Phone:</span>{" "}
                    {selectedBooking.customerPhone}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Email:</span>{" "}
                    {selectedBooking.customerEmail}
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Address:</span>{" "}
                    {selectedBooking.address}, {selectedBooking.city}
                  </div>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Service</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Category:</span>{" "}
                    {selectedBooking.categoryName}
                  </div>
                  <div>
                    <span className="text-gray-500">Service:</span>{" "}
                    {selectedBooking.serviceName}
                  </div>
                  <div>
                    <span className="text-gray-500">Service Boy:</span>{" "}
                    {selectedBooking.serviceBoyName || "Not assigned"}
                  </div>
                </div>
              </div>

              {/* Schedule & Payment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Schedule</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-500">Date:</span>{" "}
                      {formatDate(selectedBooking.scheduledDate)}
                    </div>
                    <div>
                      <span className="text-gray-500">Time:</span>{" "}
                      {selectedBooking.scheduledTime}
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Payment</h4>
                  <div className="text-sm space-y-1">
                    <div>
                      <span className="text-gray-500">Amount:</span>{" "}
                      {formatCurrency(selectedBooking.finalAmount)}
                    </div>
                    <div>
                      <span className="text-gray-500">Status:</span>{" "}
                      <Badge variant="outline">{selectedBooking.paymentStatus}</Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Current Status:</span>
                {getStatusBadge(selectedBooking.status)}
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm">{selectedBooking.notes}</p>
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

      {/* Assign Service Boy Dialog */}
      <Dialog open={isAssignOpen} onOpenChange={setIsAssignOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Assign Service Boy
            </DialogTitle>
            <DialogDescription>
              Select a service boy to assign to this booking
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedBooking && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedBooking.customerName}</p>
                <p className="text-sm text-gray-500">
                  {selectedBooking.serviceName} • {formatDate(selectedBooking.scheduledDate)}
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Service Boy</Label>
              <Select value={selectedServiceBoy} onValueChange={setSelectedServiceBoy}>
                <SelectTrigger>
                  <SelectValue placeholder="Select service boy" />
                </SelectTrigger>
                <SelectContent>
                  {availableServiceBoys.length === 0 ? (
                    <SelectItem value="" disabled>
                      No available service boys
                    </SelectItem>
                  ) : (
                    availableServiceBoys.map((sb) => (
                      <SelectItem key={sb.id} value={sb.id}>
                        {sb.name} - ⭐ {sb.rating?.toFixed(1) || "N/A"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssignOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignConfirm}
              disabled={!selectedServiceBoy || actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Booking Dialog */}
      <Dialog open={isRejectOpen} onOpenChange={setIsRejectOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Reject Booking
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to reject this booking?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedBooking && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedBooking.customerName}</p>
                <p className="text-sm text-gray-500">
                  {selectedBooking.serviceName} • {formatDate(selectedBooking.scheduledDate)}
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Enter reason for rejection..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleRejectConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Rejecting...
                </>
              ) : (
                "Reject Booking"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
