"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAdminServiceBoys,
  updateAdminServiceBoyStatus,
  selectServiceBoys,
  selectServiceBoysLoading,
  selectServiceBoysError,
} from "@/store/slices/serviceBoysSlice";
import { fetchVendors, selectVendors } from "@/store/slices/vendorsSlice";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  AlertTriangle,
  Ban,
  Calendar,
  CheckCircle,
  Eye,
  Filter,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  RefreshCw,
  Search,
  Star,
  Users,
} from "lucide-react";
import { toast } from "sonner";
import type { ServiceBoy, ServiceBoyStatus } from "@/lib/api/types";

const statusBadge: Record<ServiceBoyStatus, { label: string; className: string }> = {
  available: {
    label: "Available",
    className: "bg-emerald-100 text-emerald-700",
  },
  busy: {
    label: "Busy",
    className: "bg-amber-100 text-amber-700",
  },
  offline: {
    label: "Offline",
    className: "bg-gray-100 text-gray-700",
  },
};

function getStatusBadge(status: ServiceBoyStatus) {
  const config = statusBadge[status] || statusBadge.offline;
  return (
    <Badge className={`${config.className} hover:${config.className}`}>
      {config.label}
    </Badge>
  );
}

export default function AdminServiceBoysPage() {
  const dispatch = useAppDispatch();

  // Redux state
  const serviceBoys = useAppSelector(selectServiceBoys);
  const vendors = useAppSelector(selectVendors);
  const isLoading = useAppSelector(selectServiceBoysLoading);
  const error = useAppSelector(selectServiceBoysError);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [vendorFilter, setVendorFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isSuspendOpen, setIsSuspendOpen] = useState(false);
  const [selectedServiceBoy, setSelectedServiceBoy] = useState<ServiceBoy | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAdminServiceBoys({}));
    dispatch(fetchVendors({}));
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAdminServiceBoys({}));
  };

  // Filter service boys
  const filteredServiceBoys = serviceBoys.filter((sb) => {
    const matchesSearch =
      sb.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sb.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sb.phone?.includes(searchQuery) ||
      sb.vendorName?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesVendor =
      vendorFilter === "all" || sb.vendorId === vendorFilter;
    const matchesStatus =
      statusFilter === "all" || sb.status === statusFilter;
    return matchesSearch && matchesVendor && matchesStatus;
  });

  const openDetailDialog = (sb: ServiceBoy) => {
    setSelectedServiceBoy(sb);
    setIsDetailOpen(true);
  };

  const openSuspendDialog = (sb: ServiceBoy) => {
    setSelectedServiceBoy(sb);
    setIsSuspendOpen(true);
  };

  const handleSuspend = async () => {
    if (!selectedServiceBoy) return;

    setActionLoading(true);
    try {
      await dispatch(
        updateAdminServiceBoyStatus({
          id: selectedServiceBoy.id,
          status: "suspended",
        })
      ).unwrap();
      toast.success("Service boy suspended");
      setIsSuspendOpen(false);
      setSelectedServiceBoy(null);
      dispatch(fetchAdminServiceBoys({}));
    } catch (err: any) {
      toast.error(err || "Failed to suspend service boy");
    } finally {
      setActionLoading(false);
    }
  };

  const handleActivate = async (sb: ServiceBoy) => {
    try {
      await dispatch(
        updateAdminServiceBoyStatus({
          id: sb.id,
          status: "active",
        })
      ).unwrap();
      toast.success("Service boy activated");
      dispatch(fetchAdminServiceBoys({}));
    } catch (err: any) {
      toast.error(err || "Failed to activate service boy");
    }
  };

  // Stats
  const stats = {
    total: serviceBoys.length,
    available: serviceBoys.filter((sb) => sb.status === "available").length,
    busy: serviceBoys.filter((sb) => sb.status === "busy").length,
    offline: serviceBoys.filter((sb) => sb.status === "offline").length,
  };

  // Get unique vendors from service boys
  const uniqueVendors = Array.from(
    new Map(
      serviceBoys
        .filter((sb) => sb.vendorId && sb.vendorName)
        .map((sb) => [sb.vendorId, { id: sb.vendorId, name: sb.vendorName }])
    ).values()
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Boys</h1>
          <p className="text-muted-foreground">Manage all service boys across vendors</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">Busy</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.busy}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Offline</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.offline}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, email, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={vendorFilter} onValueChange={setVendorFilter}>
          <SelectTrigger className="w-[200px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by vendor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Vendors</SelectItem>
            {uniqueVendors.map((vendor) => (
              <SelectItem key={vendor.id} value={vendor.id!}>
                {vendor.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="busy">Busy</SelectItem>
            <SelectItem value="offline">Offline</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error loading service boys</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {isLoading && serviceBoys.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading service boys...</span>
        </div>
      ) : filteredServiceBoys.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchQuery || vendorFilter !== "all" || statusFilter !== "all"
                ? "No service boys found matching your filters"
                : "No service boys registered yet"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Service Boy</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Jobs</TableHead>
                  <TableHead>Skills</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServiceBoys.map((sb) => (
                  <TableRow key={sb.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar name={sb.name} size="sm" />
                        <div>
                          <p className="font-medium">{sb.name}</p>
                          <p className="text-xs text-gray-500 font-mono">
                            {sb.id?.substring(0, 8)}...
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="flex items-center gap-1">
                          <Mail className="h-3 w-3 text-gray-400" />
                          {sb.email}
                        </p>
                        <p className="flex items-center gap-1 text-gray-500">
                          <Phone className="h-3 w-3" />
                          {sb.phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{sb.vendorName}</p>
                    </TableCell>
                    <TableCell>{getStatusBadge(sb.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-warning text-warning" />
                        <span className="font-medium">{sb.rating?.toFixed(1) || "N/A"}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p className="font-medium">{sb.completedJobs || 0}</p>
                        <p className="text-xs text-gray-500">of {sb.totalJobs || 0}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      {sb.skills && sb.skills.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {sb.skills.slice(0, 2).map((skill, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {sb.skills.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{sb.skills.length - 2}
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No skills</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openDetailDialog(sb)}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Profile
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Calendar className="mr-2 h-4 w-4" />
                            View Jobs
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openSuspendDialog(sb)}
                            className="text-red-600"
                          >
                            <Ban className="mr-2 h-4 w-4" />
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

      {/* Service Boy Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Service Boy Profile</DialogTitle>
            <DialogDescription>ID: {selectedServiceBoy?.id}</DialogDescription>
          </DialogHeader>
          {selectedServiceBoy && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar name={selectedServiceBoy.name} size="xl" />
                <div>
                  <h3 className="font-semibold text-lg">{selectedServiceBoy.name}</h3>
                  {getStatusBadge(selectedServiceBoy.status)}
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">
                      {selectedServiceBoy.rating?.toFixed(1) || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Contact</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    {selectedServiceBoy.email}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedServiceBoy.phone}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Vendor</h4>
                <p className="text-sm">{selectedServiceBoy.vendorName}</p>
              </div>

              {selectedServiceBoy.skills && selectedServiceBoy.skills.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Skills</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedServiceBoy.skills.map((skill, i) => (
                      <Badge key={i} variant="outline">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-600">
                    {selectedServiceBoy.completedJobs || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Completed Jobs</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-primary">
                    {selectedServiceBoy.totalJobs || 0}
                  </p>
                  <p className="text-xs text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Suspend Confirmation Dialog */}
      <Dialog open={isSuspendOpen} onOpenChange={setIsSuspendOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Suspend Service Boy
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to suspend this service boy?
            </DialogDescription>
          </DialogHeader>
          {selectedServiceBoy && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar name={selectedServiceBoy.name} size="md" />
                <div>
                  <p className="font-medium">{selectedServiceBoy.name}</p>
                  <p className="text-sm text-gray-500">{selectedServiceBoy.vendorName}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                This will prevent the service boy from accepting new jobs. They can be
                reactivated later.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSuspendOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspend} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suspending...
                </>
              ) : (
                "Suspend"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
