"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminBookings,
  selectBookings,
  selectBookingsLoading,
  selectBookingsError,
} from "@/store/slices/bookingsSlice";
import {
  fetchAdminServiceBoys,
  selectServiceBoys,
} from "@/store/slices/serviceBoysSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  CheckCircle,
  Clock,
  XCircle,
  Eye,
  UserCog,
  AlertTriangle,
  Calendar,
  Users,
  Play,
  Pause,
  RotateCcw,
  Loader2,
  RefreshCw,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Booking, BookingStatus, ServiceBoy } from "@/lib/api/types";

const getBookingStatusBadge = (status: BookingStatus) => {
  const config: Record<
    BookingStatus,
    { icon: React.ReactNode; label: string; className: string }
  > = {
    pending: {
      icon: <Clock className="mr-1 h-3 w-3" />,
      label: "Pending",
      className: "bg-amber-100 text-amber-700",
    },
    confirmed: {
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
      label: "Confirmed",
      className: "bg-blue-100 text-blue-700",
    },
    assigned: {
      icon: <Users className="mr-1 h-3 w-3" />,
      label: "Assigned",
      className: "bg-indigo-100 text-indigo-700",
    },
    in_progress: {
      icon: <Play className="mr-1 h-3 w-3" />,
      label: "In Progress",
      className: "bg-purple-100 text-purple-700",
    },
    completed: {
      icon: <CheckCircle className="mr-1 h-3 w-3" />,
      label: "Completed",
      className: "bg-emerald-100 text-emerald-700",
    },
    cancelled: {
      icon: <XCircle className="mr-1 h-3 w-3" />,
      label: "Cancelled",
      className: "bg-red-100 text-red-700",
    },
  };
  const { icon, label, className } = config[status] || {
    icon: <Clock className="mr-1 h-3 w-3" />,
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return (
    <Badge className={`${className} hover:${className}`}>
      {icon}
      {label}
    </Badge>
  );
};

const getServiceBoyStatusBadge = (status: ServiceBoy["status"]) => {
  const config: Record<
    ServiceBoy["status"],
    { label: string; className: string }
  > = {
    available: { label: "Available", className: "bg-emerald-100 text-emerald-700" },
    busy: { label: "Busy", className: "bg-amber-100 text-amber-700" },
    offline: { label: "Offline", className: "bg-gray-100 text-gray-700" },
  };
  const { label, className } = config[status] || {
    label: status,
    className: "bg-gray-100 text-gray-700",
  };
  return <Badge className={`${className} hover:${className}`}>{label}</Badge>;
};

const formatDate = (dateStr: string | undefined) => {
  if (!dateStr) return "N/A";
  try {
    return new Date(dateStr).toLocaleDateString();
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount: number | undefined) => {
  if (amount === undefined || amount === null) return "₹0";
  return `₹${amount.toLocaleString()}`;
};

export default function BookingView() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const bookings = useAppSelector(selectBookings);
  const serviceBoys = useAppSelector(selectServiceBoys);
  const isLoading = useAppSelector(selectBookingsLoading);
  const error = useAppSelector(selectBookingsError);
  
  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [isAdminControlOpen, setIsAdminControlOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [adminAction, setAdminAction] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAdminBookings({}));
    dispatch(fetchAdminServiceBoys({}));
  }, [dispatch]);

  // Filter bookings based on search and status
  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.vendorName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      booking.serviceName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesFilter;
  });

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    assigned: bookings.filter((b) => b.status === "assigned").length,
    inProgress: bookings.filter((b) => b.status === "in_progress").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };

  const handleRefresh = () => {
    dispatch(fetchAdminBookings({}));
    dispatch(fetchAdminServiceBoys({}));
  };

  const openDetailDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDetailDialogOpen(true);
  };

  const openAdminControl = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsAdminControlOpen(true);
  };

  const handleAdminAction = () => {
    if (!selectedBooking || !adminAction) return;
    
    // In a real implementation, this would call an API
    // For now, we'll just close the dialog
    console.log("Admin action:", adminAction, "for booking:", selectedBooking.id, "notes:", adminNotes);
    
    setIsAdminControlOpen(false);
    setSelectedBooking(null);
    setAdminAction("");
    setAdminNotes("");
    
    // Refresh data
    dispatch(fetchAdminBookings({}));
  };

  // Bookings Tab Content
  const BookingsTab = () => (
    <div className="space-y-4">
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
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
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
                  <TableHead>Vendor</TableHead>
                  <TableHead>Service Boy</TableHead>
                  <TableHead>Service</TableHead>
                  <TableHead>Scheduled</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-gray-500">
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
                      <TableCell>{booking.vendorName}</TableCell>
                      <TableCell>
                        {booking.serviceBoyName || (
                          <span className="text-gray-400">Not assigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div>
                          <Badge variant="outline">{booking.categoryName}</Badge>
                          <p className="text-xs text-gray-500 mt-1">{booking.serviceName}</p>
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
                        <p className="font-medium">{formatCurrency(booking.finalAmount)}</p>
                        {booking.discount && booking.discount > 0 && (
                          <p className="text-xs text-gray-500 line-through">
                            {formatCurrency(booking.amount)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            booking.paymentStatus === "paid"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : booking.paymentStatus === "refunded"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }
                        >
                          {booking.paymentStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{getBookingStatusBadge(booking.status)}</TableCell>
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
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => openAdminControl(booking)}
                              className="text-red-600"
                            >
                              <UserCog className="mr-2 h-4 w-4" />
                              Admin Control
                            </DropdownMenuItem>
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
    </div>
  );

  // Service Boys Tab
  const ServiceBoysTab = () => (
    <div className="space-y-4">
      {serviceBoys.length === 0 ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          No service boys found
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Boy</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {serviceBoys.map((sb) => (
                  <TableRow key={sb.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sb.name}</p>
                        <p className="text-xs text-gray-500 font-mono">
                          {sb.id?.substring(0, 8)}...
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="text-sm flex items-center">
                          <Mail className="h-3 w-3 mr-1" />
                          {sb.email}
                        </p>
                        <p className="text-sm flex items-center">
                          <Phone className="h-3 w-3 mr-1" />
                          {sb.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{sb.vendorName}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {sb.skills?.map((skill) => (
                          <Badge key={skill} variant="outline">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{getServiceBoyStatusBadge(sb.status)}</TableCell>
                    <TableCell>
                      <span className="font-medium">{sb.rating?.toFixed(1) || "N/A"} ⭐</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{sb.completedJobs || 0}</p>
                        <p className="text-xs text-gray-500">of {sb.totalJobs || 0}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Schedule
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Pause className="mr-2 h-4 w-4" />
                            Suspend
                          </DropdownMenuItem>
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
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bookings</h1>
          <p className="text-gray-500">Manage all bookings and service boys</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Total Bookings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pending}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">
              Confirmed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.confirmed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-purple-600">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.inProgress}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.completed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-red-600">
              Cancelled
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.cancelled}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="bookings">
        <TabsList>
          <TabsTrigger value="bookings">Bookings</TabsTrigger>
          <TabsTrigger value="serviceBoys">Service Boys</TabsTrigger>
        </TabsList>
        <TabsContent value="bookings" className="mt-4">
          <BookingsTab />
        </TabsContent>
        <TabsContent value="serviceBoys" className="mt-4">
          <ServiceBoysTab />
        </TabsContent>
      </Tabs>

      {/* Booking Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
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
                    <span className="text-gray-500">Vendor:</span>{" "}
                    {selectedBooking.vendorName}
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
                    {selectedBooking.paymentMethod && (
                      <div>
                        <span className="text-gray-500">Method:</span>{" "}
                        {selectedBooking.paymentMethod}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Current Status:</span>
                {getBookingStatusBadge(selectedBooking.status)}
              </div>

              {/* Notes */}
              {selectedBooking.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm">{selectedBooking.notes}</p>
                </div>
              )}

              {/* Timeline */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Timeline</h4>
                <div className="text-sm space-y-1">
                  <div>
                    <span className="text-gray-500">Created:</span>{" "}
                    {formatDate(selectedBooking.createdAt)}
                  </div>
                  {selectedBooking.confirmedAt && (
                    <div>
                      <span className="text-gray-500">Confirmed:</span>{" "}
                      {formatDate(selectedBooking.confirmedAt)}
                    </div>
                  )}
                  {selectedBooking.assignedAt && (
                    <div>
                      <span className="text-gray-500">Assigned:</span>{" "}
                      {formatDate(selectedBooking.assignedAt)}
                    </div>
                  )}
                  {selectedBooking.startedAt && (
                    <div>
                      <span className="text-gray-500">Started:</span>{" "}
                      {formatDate(selectedBooking.startedAt)}
                    </div>
                  )}
                  {selectedBooking.completedAt && (
                    <div>
                      <span className="text-gray-500">Completed:</span>{" "}
                      {formatDate(selectedBooking.completedAt)}
                    </div>
                  )}
                  {selectedBooking.cancelledAt && (
                    <div>
                      <span className="text-gray-500">Cancelled:</span>{" "}
                      {formatDate(selectedBooking.cancelledAt)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Admin Control Dialog */}
      <Dialog open={isAdminControlOpen} onOpenChange={setIsAdminControlOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Admin Control Panel
            </DialogTitle>
            <DialogDescription>
              Emergency admin actions for booking {selectedBooking?.id?.substring(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          {selectedBooking && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedBooking.customerName}</p>
                <p className="text-sm text-gray-500">
                  {selectedBooking.vendorName} • {selectedBooking.serviceName}
                </p>
                <p className="text-sm mt-2">
                  Current Status: {getBookingStatusBadge(selectedBooking.status)}
                </p>
              </div>

              <div className="grid gap-2">
                <Label>Admin Action</Label>
                <Select value={adminAction} onValueChange={setAdminAction}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="reassign">
                      <div className="flex items-center">
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Reassign to another vendor/service boy
                      </div>
                    </SelectItem>
                    <SelectItem value="restart">
                      <div className="flex items-center">
                        <Play className="mr-2 h-4 w-4" />
                        Restart booking
                      </div>
                    </SelectItem>
                    <SelectItem value="complete">
                      <div className="flex items-center">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Mark as completed
                      </div>
                    </SelectItem>
                    <SelectItem value="cancel">
                      <div className="flex items-center">
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancel booking
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>Admin Notes</Label>
                <Textarea
                  placeholder="Add notes about this action..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAdminControlOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleAdminAction}
              disabled={!adminAction}
              className="bg-red-600 hover:bg-red-700"
            >
              Execute Action
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
