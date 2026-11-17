"use client";

import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { selectUser } from "@/store/slices/authSlice";
import {
  fetchServiceBoyProfile,
  fetchServiceBoyStats,
  fetchAssignedJobs,
  fetchCompletedJobs,
  updateServiceBoyStatus,
  acceptJob,
  startJob,
  completeJob,
  selectServiceBoyProfile,
  selectServiceBoyJobs,
  selectCompletedJobs,
  selectServiceBoyStats,
  selectServiceBoysLoading,
  selectServiceBoysError,
} from "@/store/slices/serviceBoysSlice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Loader2,
  MapPin,
  Navigation,
  Phone,
  Play,
  RefreshCw,
  Star,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { ServiceBoyJob } from "@/lib/api/types";

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
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === tomorrow.toDateString()) return "Tomorrow";
    return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}

const jobStatusBadge: Record<string, { label: string; variant: "success" | "warning" | "default" | "info" | "destructive" }> = {
  assigned: { label: "Assigned", variant: "info" },
  accepted: { label: "Accepted", variant: "info" },
  in_progress: { label: "In Progress", variant: "warning" },
  completed: { label: "Completed", variant: "success" },
  declined: { label: "Declined", variant: "destructive" },
};

export default function ServiceBoyDashboard() {
  const dispatch = useAppDispatch();
  
  // Redux state
  const user = useAppSelector(selectUser);
  const profile = useAppSelector(selectServiceBoyProfile);
  const jobs = useAppSelector(selectServiceBoyJobs);
  const completedJobs = useAppSelector(selectCompletedJobs);
  const stats = useAppSelector(selectServiceBoyStats);
  const isLoading = useAppSelector(selectServiceBoysLoading);
  const error = useAppSelector(selectServiceBoysError);
  
  // Local state
  const [isCompleteDialogOpen, setIsCompleteDialogOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<ServiceBoyJob | null>(null);
  const [completeNotes, setCompleteNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchServiceBoyProfile());
    dispatch(fetchServiceBoyStats());
    dispatch(fetchAssignedJobs());
    dispatch(fetchCompletedJobs());
  }, [dispatch]);

  const handleRefresh = () => {
    dispatch(fetchServiceBoyProfile());
    dispatch(fetchServiceBoyStats());
    dispatch(fetchAssignedJobs());
    dispatch(fetchCompletedJobs());
  };

  const handleToggleStatus = async () => {
    const newStatus = profile?.status === "available" ? "offline" : "available";
    await dispatch(updateServiceBoyStatus(newStatus));
  };

  const handleAcceptJob = async (job: ServiceBoyJob) => {
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

  const handleStartJob = async (job: ServiceBoyJob) => {
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

  const openCompleteDialog = (job: ServiceBoyJob) => {
    setSelectedJob(job);
    setIsCompleteDialogOpen(true);
  };

  const handleCompleteJob = async () => {
    if (!selectedJob) return;
    setActionLoading(true);
    try {
      await dispatch(completeJob({ id: selectedJob.id, notes: completeNotes })).unwrap();
      dispatch(fetchAssignedJobs());
      dispatch(fetchCompletedJobs());
      dispatch(fetchServiceBoyStats());
      setIsCompleteDialogOpen(false);
      setSelectedJob(null);
      setCompleteNotes("");
    } catch (err) {
      console.error("Failed to complete job:", err);
    } finally {
      setActionLoading(false);
    }
  };

  // Get current job (in_progress)
  const currentJob = jobs.find(j => j.status === "in_progress");
  
  // Get upcoming jobs (assigned or accepted)
  const upcomingJobs = jobs.filter(j => j.status === "assigned" || j.status === "accepted");

  // Stats data
  const statsCards = [
    { 
      title: "Today's Earnings", 
      value: formatCurrency(stats?.weeklyEarnings ? stats.weeklyEarnings / 7 : 0), 
      icon: DollarSign, 
      variant: "primary" as const 
    },
    { 
      title: "Jobs Completed", 
      value: stats?.totalCompletedJobs || profile?.completedJobs || 0, 
      icon: Check, 
      variant: "success" as const 
    },
    { 
      title: "Pending Jobs", 
      value: stats?.pendingJobs || upcomingJobs.length, 
      icon: Calendar, 
      variant: "info" as const 
    },
    { 
      title: "My Rating", 
      value: stats?.rating?.toFixed(1) || profile?.rating?.toFixed(1) || "N/A", 
      icon: Star, 
      variant: "warning" as const 
    },
  ];

  if (isLoading && !profile) {
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
          <h1 className="text-2xl font-bold">Hello, {user?.name?.split(" ")[0] || "there"}! 💪</h1>
          <p className="text-muted-foreground">
            You have {upcomingJobs.length} job{upcomingJobs.length !== 1 ? "s" : ""} assigned
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Button
            variant="outline"
            onClick={handleToggleStatus}
            className={
              profile?.status === "available"
                ? "bg-success/10 text-success border-success/30 hover:bg-success/20"
                : profile?.status === "busy"
                ? "bg-amber-500/10 text-amber-600 border-amber-500/30"
                : "bg-gray-100 text-gray-600"
            }
          >
            <span className={`h-2 w-2 rounded-full mr-2 ${
              profile?.status === "available" ? "bg-success animate-pulse" : 
              profile?.status === "busy" ? "bg-amber-500" : "bg-gray-400"
            }`} />
            {profile?.status === "available" ? "Online & Available" : 
             profile?.status === "busy" ? "Busy" : "Offline"}
          </Button>
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
            icon={<stat.icon className="h-4 w-4" />}
            variant={stat.variant}
          />
        ))}
      </div>

      {/* Current Job */}
      {currentJob && (
        <Card className="border-[#1b1e85]/50 bg-[#1b1e85]/5">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-white">
                  <Navigation className="h-4 w-4" />
                </div>
                Current Job
              </CardTitle>
              <Badge variant="warning">In Progress</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 lg:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <p className="text-lg font-semibold">{currentJob.serviceName}</p>
                  <p className="text-sm text-muted-foreground">
                    {currentJob.categoryName} • Booking #{currentJob.bookingId?.substring(0, 8)}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{currentJob.customerName}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{currentJob.customerPhone}</span>
                    <a href={`tel:${currentJob.customerPhone}`}>
                      <Button size="sm" variant="outline" className="h-7 ml-2">
                        Call
                      </Button>
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(currentJob.scheduledDate)} at {currentJob.scheduledTime}</span>
                  </div>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <span>{currentJob.address}, {currentJob.city}</span>
                  </div>
                </div>

                {currentJob.notes && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Job Notes</p>
                    <p className="text-sm">{currentJob.notes}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex-1 rounded-lg bg-muted/50 flex items-center justify-center min-h-[150px]">
                  <div className="text-center text-muted-foreground">
                    <MapPin className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Map View</p>
                    <p className="text-xs">{currentJob.lat && currentJob.lng ? "Location available" : "No coordinates"}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button className="flex-1" variant="outline" asChild>
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(currentJob.address + ", " + currentJob.city)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Get Directions
                    </a>
                  </Button>
                  <Button 
                    className="flex-1 bg-success hover:bg-success/90"
                    onClick={() => openCompleteDialog(currentJob)}
                    disabled={actionLoading}
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Complete Job
                  </Button>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p className="text-xl font-bold text-primary">{formatCurrency(currentJob.amount)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Jobs
              </CardTitle>
              <Link href="/serviceboy/jobs" className="text-sm text-primary flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingJobs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming jobs
              </div>
            ) : (
              upcomingJobs.slice(0, 3).map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <span className="text-[10px] font-medium">{formatDate(job.scheduledDate)}</span>
                      <span className="text-xs font-bold">{job.scheduledTime?.split(":")[0]}</span>
                    </div>
                    <div>
                      <p className="font-medium">{job.serviceName}</p>
                      <p className="text-xs text-muted-foreground">{job.customerName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">{formatCurrency(job.amount)}</p>
                    <div className="flex gap-1 mt-1">
                      {job.status === "assigned" && (
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-7 text-xs"
                          onClick={() => handleAcceptJob(job)}
                          disabled={actionLoading}
                        >
                          Accept
                        </Button>
                      )}
                      {job.status === "accepted" && (
                        <Button 
                          size="sm" 
                          className="h-7 text-xs"
                          onClick={() => handleStartJob(job)}
                          disabled={actionLoading}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Start
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Completed Jobs */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-success" />
                Recent Earnings
              </CardTitle>
              <Link href="/serviceboy/jobs?tab=completed" className="text-sm text-primary flex items-center gap-1">
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {completedJobs.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No completed jobs yet
              </div>
            ) : (
              <div className="space-y-3">
                {completedJobs.slice(0, 3).map((job) => (
                  <div key={job.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium">{job.customerName}</p>
                      <p className="text-xs text-muted-foreground">
                        {job.serviceName} • {formatDate(job.completedAt)}
                      </p>
                    </div>
                    <p className="font-semibold text-success">+{formatCurrency(job.amount)}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">This Week Total</span>
                <span className="text-lg font-bold text-success">{formatCurrency(stats?.weeklyEarnings)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Banner */}
      <Card className="bg-[#1b1e85] text-white">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                {stats?.totalCompletedJobs 
                  ? `Great work! You've completed ${stats.totalCompletedJobs} jobs` 
                  : "Welcome to your dashboard!"}
              </h3>
              <p className="text-white/80">
                {stats?.rating 
                  ? `Your average rating is ${stats.rating.toFixed(1)} ⭐` 
                  : "Start accepting jobs to earn money"}
              </p>
            </div>
            <Link href="/serviceboy/jobs">
              <Button variant="secondary" className="bg-white text-orange-600 hover:bg-white/90">
                View All Jobs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Complete Job Dialog */}
      <Dialog open={isCompleteDialogOpen} onOpenChange={setIsCompleteDialogOpen}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-success">
              <Check className="h-5 w-5" />
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
            <Button variant="outline" onClick={() => setIsCompleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-success hover:bg-success/90"
              onClick={handleCompleteJob}
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
