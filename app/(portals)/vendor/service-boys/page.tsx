"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchVendorServiceBoys,
  createServiceBoy,
  updateServiceBoy,
  deleteServiceBoy,
  selectServiceBoys,
  selectServiceBoysLoading,
  selectServiceBoysError,
} from "@/store/slices/serviceBoysSlice";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Edit,
  Loader2,
  Mail,
  MoreHorizontal,
  Phone,
  Plus,
  RefreshCw,
  Search,
  Star,
  Trash2,
  User,
  UserPlus,
  Users,
  XCircle,
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

export default function VendorServiceBoysPage() {
  const dispatch = useAppDispatch();

  // Redux state
  const serviceBoys = useAppSelector(selectServiceBoys);
  const isLoading = useAppSelector(selectServiceBoysLoading);
  const error = useAppSelector(selectServiceBoysError);

  // Local state
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [selectedServiceBoy, setSelectedServiceBoy] = useState<ServiceBoy | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    skills: "",
  });

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchVendorServiceBoys());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchVendorServiceBoys());
  };

  // Filter service boys
  const filteredServiceBoys = serviceBoys.filter(
    (sb) =>
      sb.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sb.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sb.phone?.includes(searchQuery)
  );

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      password: "",
      skills: "",
    });
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateOpen(true);
  };

  const openEditDialog = (sb: ServiceBoy) => {
    setSelectedServiceBoy(sb);
    setFormData({
      name: sb.name || "",
      email: sb.email || "",
      phone: sb.phone || "",
      password: "",
      skills: sb.skills?.join(", ") || "",
    });
    setIsEditOpen(true);
  };

  const openDeleteDialog = (sb: ServiceBoy) => {
    setSelectedServiceBoy(sb);
    setIsDeleteOpen(true);
  };

  const handleCreate = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      toast.error("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      await dispatch(
        createServiceBoy({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
        })
      ).unwrap();
      toast.success("Service boy created successfully");
      setIsCreateOpen(false);
      resetForm();
      dispatch(fetchVendorServiceBoys());
    } catch (err: any) {
      toast.error(err || "Failed to create service boy");
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedServiceBoy) return;
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Please fill all required fields");
      return;
    }

    setActionLoading(true);
    try {
      await dispatch(
        updateServiceBoy({
          id: selectedServiceBoy.id,
          data: {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            skills: formData.skills.split(",").map((s) => s.trim()).filter(Boolean),
          },
        })
      ).unwrap();
      toast.success("Service boy updated successfully");
      setIsEditOpen(false);
      setSelectedServiceBoy(null);
      resetForm();
      dispatch(fetchVendorServiceBoys());
    } catch (err: any) {
      toast.error(err || "Failed to update service boy");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedServiceBoy) return;

    setActionLoading(true);
    try {
      await dispatch(deleteServiceBoy(selectedServiceBoy.id)).unwrap();
      toast.success("Service boy removed successfully");
      setIsDeleteOpen(false);
      setSelectedServiceBoy(null);
      dispatch(fetchVendorServiceBoys());
    } catch (err: any) {
      toast.error(err || "Failed to remove service boy");
    } finally {
      setActionLoading(false);
    }
  };

  // Stats
  const stats = {
    total: serviceBoys.length,
    available: serviceBoys.filter((sb) => sb.status === "available").length,
    busy: serviceBoys.filter((sb) => sb.status === "busy").length,
    offline: serviceBoys.filter((sb) => sb.status === "offline").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Service Boys</h1>
          <p className="text-muted-foreground">Manage your team members</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button onClick={openCreateDialog}>
            <UserPlus className="h-4 w-4 mr-2" />
            Add Service Boy
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Team</CardTitle>
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

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
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
          <span className="ml-2">Loading team...</span>
        </div>
      ) : filteredServiceBoys.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>
              {searchQuery
                ? "No service boys found matching your search"
                : "No service boys added yet"}
            </p>
            {!searchQuery && (
              <Button className="mt-4" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Service Boy
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact</TableHead>
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
                        <p className="text-xs text-gray-500">completed</p>
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
                          <DropdownMenuItem onClick={() => openEditDialog(sb)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => openDeleteDialog(sb)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Remove
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

      {/* Create Service Boy Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              Add Service Boy
            </DialogTitle>
            <DialogDescription>
              Create a new service boy account for your team
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                placeholder="e.g., Plumbing, Electrical, Cleaning"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Create
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Service Boy Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Service Boy
            </DialogTitle>
            <DialogDescription>Update service boy details</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Full Name *</Label>
              <Input
                id="edit-name"
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-email">Email *</Label>
              <Input
                id="edit-email"
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-phone">Phone *</Label>
              <Input
                id="edit-phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-skills">Skills (comma separated)</Label>
              <Input
                id="edit-skills"
                placeholder="e.g., Plumbing, Electrical, Cleaning"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Remove Service Boy
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this service boy from your team?
            </DialogDescription>
          </DialogHeader>
          {selectedServiceBoy && (
            <div className="py-4">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Avatar name={selectedServiceBoy.name} size="md" />
                <div>
                  <p className="font-medium">{selectedServiceBoy.name}</p>
                  <p className="text-sm text-gray-500">{selectedServiceBoy.email}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-gray-500">
                This action cannot be undone. The service boy will lose access to the
                platform.
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={actionLoading}>
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
