"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAssignedJobs,
  fetchCompletedJobs,
  acceptJob,
  declineJob,
  startJob,
  completeJob,
  selectServiceBoyJobs,
  selectCompletedJobs,
  selectServiceBoysLoading,
  selectServiceBoysError,
} from "@/store/slices/serviceBoysSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Calendar,
  Check,
  Clock,
  Eye,
  Loader2,
  MapPin,
  MoreHorizontal,
  Navigation,
  Phone,
  Play,
  RefreshCw,
  X,
  XCircle,
  CheckCircle,
  User,
} from "lucide-react";
import type { ServiceBoyJob } from "@/lib/api/types";

const jobStatusBadge: Record<string, { label: string; icon: React.ReactNode; className: string }> = {
  assigned: { 
    label: "Assigned", 
    icon: <Clock className="mr-1 h-3 w-3" />, 
    className: "bg-blue-100 text-blue-700" 
  },
  accepted: { 
    label: "Accepted", 
    icon: <Check className="mr-1 h-3 w-3" />, 
    className: "bg-indigo-100 text-indigo-700" 
  },
  in_progress: { 
    label: "In Progress", 
    icon: <Play className="mr-1 h-3 w-3" />, 
    className: "bg-amber-100 text-amber-700" 
  },
  completed: { 
    label: "Completed", 
    icon: <CheckCircle className="mr-1 h-3 w-3" />, 
    className: "bg-emerald-100 text-emerald-700" 
  },
  declined: { 
    label: "Declined", 
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
    const date = new Date(dateStr);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function getStatusBadge(status: string) {
  const config = jobStatusBadge[status] || jobStatusBadge.assigned;
  return (
    <Badge className={`${config.className} hover:${config.className}`}>
      {config.icon}
      {config.label}
    </Badge>
  );
}

export default function ServiceBoyJobsPage() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const jobs = useAppSelector(selectServiceBoyJobs);
  const completedJobs = useAppSelector(selectCompletedJobs);
  const isLoading = useAppSelector(selectServiceBoysLoading);
  const error = useAppSelector(selectServiceBoysError);
  
  // Local state
  const [selectedJob, setSelectedJob] = useState<ServiceBoyJob | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isDeclineOpen, setIsDeclineOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);
  const [declineReason, setDeclineReason] = useState("");
  const [completeNotes, setCompleteNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchAssignedJobs());
    dispatch(fetchCompletedJobs());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchAssignedJobs());
    dispatch(fetchCompletedJobs());
  };

  const handleAccept = async (job: ServiceBoyJob) => {
    setActionLoading(true);
    try {
      await dispatch(acceptJob(job.id)).unwrap();
      dispatch(fetchAssignedJobs());
    } catch (err) {
      console.error("Failed to accept job:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStart = async (job: ServiceBoyJob) => {
    setActionLoading(true);
    try {
      await dispatch(startJob(job.id)).unwrap();
      dispatch(fetchAssignedJobs());
    } catch (err) {
      console.error("Failed to start job:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const openDeclineDialog = (job: ServiceBoyJob) => {
    setSelectedJob(job);
    setIsDeclineOpen(true);
  };

  const handleDeclineConfirm = async () => {
    if (!selectedJob) return;
    setActionLoading(true);
    try {
      await dispatch(declineJob({ id: selectedJob.id, reason: declineReason })).unwrap();
      dispatch(fetchAssignedJobs());
      setIsDeclineOpen(false);
      setSelectedJob(null);
      setDeclineReason("");
    } catch (err) {
      console.error("Failed to decline job:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const openCompleteDialog = (job: ServiceBoyJob) => {
    setSelectedJob(job);
    setIsCompleteOpen(true);
  };

  const handleCompleteConfirm = async () => {
    if (!selectedJob) return;
    setActionLoading(true);
    try {
      await dispatch(completeJob({ id: selectedJob.id, notes: completeNotes })).unwrap();
      dispatch(fetchAssignedJobs());
      dispatch(fetchCompletedJobs());
      setIsCompleteOpen(false);
      setSelectedJob(null);
      setCompleteNotes("");
    } catch (err) {
      console.error("Failed to complete job:", err);
    } finally {
      setActionLoading(false);
    }
  };

  const openDetailDialog = (job: ServiceBoyJob) => {
    setSelectedJob(job);
    setIsDetailOpen(true);
  };

  // Count jobs by status
  const assignedCount = jobs.filter(j => j.status === "assigned").length;
  const acceptedCount = jobs.filter(j => j.status === "accepted").length;
  const inProgressCount = jobs.filter(j => j.status === "in_progress").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Jobs</h1>
          <p className="text-muted-foreground">View and manage your assigned jobs</p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600">New Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{assignedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-indigo-600">Accepted</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{acceptedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-amber-600">In Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{inProgressCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600">Completed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{completedJobs.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <p className="font-medium">Error loading jobs</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Jobs ({jobs.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedJobs.length})</TabsTrigger>
        </TabsList>

        {/* Active Jobs Tab */}
        <TabsContent value="active" className="mt-4">
          {isLoading && jobs.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2">Loading jobs...</span>
            </div>
          ) : jobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No active jobs assigned to you</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.serviceName}</p>
                            <p className="text-xs text-gray-500">{job.categoryName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.customerName}</p>
                            <p className="text-xs text-gray-500 flex items-center">
                              <Phone className="h-3 w-3 mr-1" />
                              {job.customerPhone}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 text-sm max-w-[200px]">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{job.address}, {job.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center text-sm">
                            <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                            {formatDate(job.scheduledDate)}
                          </div>
                          <p className="text-xs text-gray-500">{job.scheduledTime}</p>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{formatCurrency(job.amount)}</p>
                        </TableCell>
                        <TableCell>{getStatusBadge(job.status)}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openDetailDialog(job)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a 
                                  href={`https://maps.google.com/?q=${encodeURIComponent(job.address + ", " + job.city)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <Navigation className="mr-2 h-4 w-4" />
                                  Get Directions
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={`tel:${job.customerPhone}`}>
                                  <Phone className="mr-2 h-4 w-4" />
                                  Call Customer
                                </a>
                              </DropdownMenuItem>
                              
                              {job.status === "assigned" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleAccept(job)}
                                    className="text-emerald-600"
                                  >
                                    <Check className="mr-2 h-4 w-4" />
                                    Accept Job
                                  </DropdownMenuItem>
                                  <DropdownMenuItem 
                                    onClick={() => openDeclineDialog(job)}
                                    className="text-red-600"
                                  >
                                    <X className="mr-2 h-4 w-4" />
                                    Decline Job
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {job.status === "accepted" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => handleStart(job)}
                                    className="text-amber-600"
                                  >
                                    <Play className="mr-2 h-4 w-4" />
                                    Start Job
                                  </DropdownMenuItem>
                                </>
                              )}
                              
                              {job.status === "in_progress" && (
                                <>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem 
                                    onClick={() => openCompleteDialog(job)}
                                    className="text-emerald-600"
                                  >
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    Complete Job
                                  </DropdownMenuItem>
                                </>
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

        {/* Completed Jobs Tab */}
        <TabsContent value="completed" className="mt-4">
          {completedJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No completed jobs yet</p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job Details</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {completedJobs.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{job.serviceName}</p>
                            <p className="text-xs text-gray-500">{job.categoryName}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-medium">{job.customerName}</p>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-1 text-sm max-w-[200px]">
                            <MapPin className="h-3 w-3 mt-0.5 flex-shrink-0 text-gray-400" />
                            <span className="truncate">{job.city}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {formatDate(job.completedAt)}
                        </TableCell>
                        <TableCell>
                          <p className="font-medium text-emerald-600">{formatCurrency(job.amount)}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => openDetailDialog(job)}
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

      {/* Job Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Job Details</DialogTitle>
            <DialogDescription>
              Booking #{selectedJob?.bookingId?.substring(0, 8)}...
            </DialogDescription>
          </DialogHeader>
          {selectedJob && (
            <div className="space-y-4 py-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Service</h4>
                <div className="text-sm space-y-1">
                  <p><span className="text-gray-500">Category:</span> {selectedJob.categoryName}</p>
                  <p><span className="text-gray-500">Service:</span> {selectedJob.serviceName}</p>
                  <p><span className="text-gray-500">Amount:</span> {formatCurrency(selectedJob.amount)}</p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Customer</h4>
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    {selectedJob.customerName}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    {selectedJob.customerPhone}
                  </p>
                  <p className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                    {selectedJob.address}, {selectedJob.city}
                  </p>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Schedule</h4>
                <div className="text-sm space-y-1">
                  <p className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    {formatDate(selectedJob.scheduledDate)}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    {selectedJob.scheduledTime}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <span className="text-gray-500">Status:</span>
                {getStatusBadge(selectedJob.status)}
              </div>

              {selectedJob.notes && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Notes</h4>
                  <p className="text-sm">{selectedJob.notes}</p>
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

      {/* Decline Job Dialog */}
      <Dialog open={isDeclineOpen} onOpenChange={setIsDeclineOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-5 w-5" />
              Decline Job
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to decline this job?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedJob && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedJob.customerName}</p>
                <p className="text-sm text-gray-500">
                  {selectedJob.serviceName} • {formatDate(selectedJob.scheduledDate)}
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Reason (optional)</Label>
              <Textarea
                placeholder="Enter reason for declining..."
                value={declineReason}
                onChange={(e) => setDeclineReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeclineOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeclineConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Declining...
                </>
              ) : (
                "Decline Job"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complete Job Dialog */}
      <Dialog open={isCompleteOpen} onOpenChange={setIsCompleteOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-600">
              <CheckCircle className="h-5 w-5" />
              Complete Job
            </DialogTitle>
            <DialogDescription>
              Mark this job as completed
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {selectedJob && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedJob.customerName}</p>
                <p className="text-sm text-gray-500">
                  {selectedJob.serviceName} • {formatCurrency(selectedJob.amount)}
                </p>
              </div>
            )}
            
            <div className="grid gap-2">
              <Label>Completion Notes (optional)</Label>
              <Textarea
                placeholder="Add any notes about the completed job..."
                value={completeNotes}
                onChange={(e) => setCompleteNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCompleteOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleCompleteConfirm}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Complete Job
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
