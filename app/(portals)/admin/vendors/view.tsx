"use client";

import { useEffect, useState } from "react";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  CheckCircle,
  Clock,
  XCircle,
  Edit,
  Trash2,
  Eye,
  Ban,
  RefreshCw,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  fetchVendors,
  fetchPendingVendors,
  createVendor,
  approveVendor,
  rejectVendor,
  suspendVendor,
  reactivateVendor,
  selectVendors,
  selectPendingVendors,
  selectVendorsLoading,
  selectVendorsError,
  clearError,
} from "@/store/slices/vendorsSlice";
import type { Vendor, VendorStatus } from "@/lib/api/types";
import { toast } from "sonner";

const getStatusBadge = (status: VendorStatus) => {
  switch (status) {
    case "approved":
      return (
        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Active
        </Badge>
      );
    case "pending":
      return (
        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">
          <Clock className="mr-1 h-3 w-3" />
          Pending
        </Badge>
      );
    case "rejected":
      return (
        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" />
          Rejected
        </Badge>
      );
    case "suspended":
      return (
        <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">
          <Ban className="mr-1 h-3 w-3" />
          Suspended
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

export default function VendorsView() {
  const dispatch = useAppDispatch();
  const vendors = useAppSelector(selectVendors);
  const pendingVendors = useAppSelector(selectPendingVendors);
  const isLoading = useAppSelector(selectVendorsLoading);
  const error = useAppSelector(selectVendorsError);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "suspend" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newVendor, setNewVendor] = useState({
    businessName: "",
    email: "",
    phone: "",
    password: "",
    description: "",
  });

  // Fetch vendors on mount
  useEffect(() => {
    dispatch(fetchVendors({}));
    dispatch(fetchPendingVendors());
  }, [dispatch]);

  // Show error toast
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [error, dispatch]);

  const filterVendors = (status: string) => {
    let filtered = vendors;
    
    if (status !== "all") {
      filtered = vendors.filter((v) => v.status === status);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(
        (v) =>
          v.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          v.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const handleAddVendor = async () => {
    if (!newVendor.businessName || !newVendor.email || !newVendor.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createVendor(newVendor)).unwrap();
      toast.success("Vendor created successfully");
      setNewVendor({
        businessName: "",
        email: "",
        phone: "",
        password: "",
        description: "",
      });
      setIsAddDialogOpen(false);
      dispatch(fetchVendors({}));
    } catch (err: any) {
      toast.error(err || "Failed to create vendor");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVendorAction = async () => {
    if (!selectedVendor || !actionType) return;

    setIsSubmitting(true);
    try {
      switch (actionType) {
        case "approve":
          await dispatch(approveVendor(selectedVendor.id)).unwrap();
          toast.success("Vendor approved successfully");
          break;
        case "reject":
          await dispatch(rejectVendor({ id: selectedVendor.id, reason: actionReason })).unwrap();
          toast.success("Vendor rejected");
          break;
        case "suspend":
          await dispatch(suspendVendor({ id: selectedVendor.id, reason: actionReason })).unwrap();
          toast.success("Vendor suspended");
          break;
      }
      setIsActionDialogOpen(false);
      setSelectedVendor(null);
      setActionType(null);
      setActionReason("");
      dispatch(fetchVendors({}));
      dispatch(fetchPendingVendors());
    } catch (err: any) {
      toast.error(err || "Action failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReactivate = async (vendor: Vendor) => {
    try {
      await dispatch(reactivateVendor(vendor.id)).unwrap();
      toast.success("Vendor reactivated");
      dispatch(fetchVendors({}));
    } catch (err: any) {
      toast.error(err || "Failed to reactivate vendor");
    }
  };

  const openActionDialog = (vendor: Vendor, type: "approve" | "reject" | "suspend") => {
    setSelectedVendor(vendor);
    setActionType(type);
    setActionReason("");
    setIsActionDialogOpen(true);
  };

  const activeVendors = vendors.filter((v) => v.status === "approved");
  const suspendedVendors = vendors.filter((v) => v.status === "suspended");
  const rejectedVendors = vendors.filter((v) => v.status === "rejected");

  const VendorTable = ({ vendorList }: { vendorList: Vendor[] }) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Vendor</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Rating</TableHead>
          <TableHead>Bookings</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendorList.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-gray-500">
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading vendors...
                </div>
              ) : (
                "No vendors found"
              )}
            </TableCell>
          </TableRow>
        ) : (
          vendorList.map((vendor) => (
            <TableRow key={vendor.id}>
              <TableCell>
                <div>
                  <p className="font-medium">{vendor.businessName}</p>
                  <p className="text-sm text-gray-500">{vendor.description || "No description"}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  <p className="text-sm flex items-center">
                    <Mail className="h-3 w-3 mr-1" />
                    {vendor.email}
                  </p>
                  <p className="text-sm flex items-center">
                    <Phone className="h-3 w-3 mr-1" />
                    {vendor.phone}
                  </p>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(vendor.status)}</TableCell>
              <TableCell>
                {vendor.rating > 0 ? (
                  <span className="font-medium">{vendor.rating.toFixed(1)} ⭐</span>
                ) : (
                  <span className="text-gray-400">N/A</span>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{vendor.completedBookings}</p>
                  <p className="text-xs text-gray-500">of {vendor.totalBookings}</p>
                </div>
              </TableCell>
              <TableCell>
                {new Date(vendor.createdAt).toLocaleDateString()}
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
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {vendor.status === "pending" && (
                      <>
                        <DropdownMenuItem onClick={() => openActionDialog(vendor, "approve")}>
                          <CheckCircle className="mr-2 h-4 w-4 text-emerald-600" />
                          Approve
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openActionDialog(vendor, "reject")}>
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Reject
                        </DropdownMenuItem>
                      </>
                    )}
                    {vendor.status === "approved" && (
                      <DropdownMenuItem onClick={() => openActionDialog(vendor, "suspend")}>
                        <Ban className="mr-2 h-4 w-4 text-orange-600" />
                        Suspend
                      </DropdownMenuItem>
                    )}
                    {vendor.status === "suspended" && (
                      <DropdownMenuItem onClick={() => handleReactivate(vendor)}>
                        <RefreshCw className="mr-2 h-4 w-4 text-emerald-600" />
                        Reactivate
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Vendors</h1>
          <p className="text-gray-500">Manage your service vendors</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Vendor
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Vendor</DialogTitle>
              <DialogDescription>
                Create a new vendor account. They will receive login credentials via email.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  value={newVendor.businessName}
                  onChange={(e) => setNewVendor({ ...newVendor, businessName: e.target.value })}
                  placeholder="Enter business name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={newVendor.email}
                  onChange={(e) => setNewVendor({ ...newVendor, email: e.target.value })}
                  placeholder="Enter email address"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={newVendor.phone}
                  onChange={(e) => setNewVendor({ ...newVendor, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  type="password"
                  value={newVendor.password}
                  onChange={(e) => setNewVendor({ ...newVendor, password: e.target.value })}
                  placeholder="Set initial password"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newVendor.description}
                  onChange={(e) => setNewVendor({ ...newVendor, description: e.target.value })}
                  placeholder="Brief description of the business"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddVendor}
                disabled={isSubmitting}
                className="bg-red-600 hover:bg-red-700"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Add Vendor"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Vendors</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{vendors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-emerald-600">{activeVendors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-amber-600">{pendingVendors.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Suspended</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-600">{suspendedVendors.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search vendors..."
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
            <SelectItem value="approved">Active</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="suspended">Suspended</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => {
            dispatch(fetchVendors({}));
            dispatch(fetchPendingVendors());
          }}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">All ({vendors.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeVendors.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingVendors.length})</TabsTrigger>
          <TabsTrigger value="suspended">Suspended ({suspendedVendors.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <VendorTable vendorList={filterVendors("all")} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <VendorTable vendorList={activeVendors} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <VendorTable vendorList={pendingVendors} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="suspended" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <VendorTable vendorList={suspendedVendors} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" && "Approve Vendor"}
              {actionType === "reject" && "Reject Vendor"}
              {actionType === "suspend" && "Suspend Vendor"}
            </DialogTitle>
            <DialogDescription>
              {actionType === "approve" && `Approve "${selectedVendor?.businessName}" to start accepting bookings.`}
              {actionType === "reject" && `Reject the vendor application from "${selectedVendor?.businessName}".`}
              {actionType === "suspend" && `Suspend "${selectedVendor?.businessName}" from the platform.`}
            </DialogDescription>
          </DialogHeader>
          {(actionType === "reject" || actionType === "suspend") && (
            <div className="grid gap-2">
              <Label>Reason (optional)</Label>
              <Textarea
                value={actionReason}
                onChange={(e) => setActionReason(e.target.value)}
                placeholder="Provide a reason..."
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleVendorAction}
              disabled={isSubmitting}
              className={
                actionType === "approve"
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  {actionType === "approve" && "Approve"}
                  {actionType === "reject" && "Reject"}
                  {actionType === "suspend" && "Suspend"}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
