"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCategories,
  fetchVendors,
  selectCategories,
  selectVendorsList,
  selectCatalogLoading,
} from "@/store/slices/catalogSlice";
import { createBooking } from "@/store/slices/bookingsSlice";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  Loader2,
  MapPin,
  Star,
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { Vendor, Category } from "@/lib/api/types";

export default function NewBookingPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get URL params
  const vendorIdParam = searchParams.get("vendor");
  const categoryIdParam = searchParams.get("category");

  // Redux state
  const categories = useAppSelector(selectCategories);
  const vendors = useAppSelector(selectVendorsList);
  const isLoading = useAppSelector(selectCatalogLoading);

  // Form state
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryIdParam || "");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Available time slots
  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM",
    "05:00 PM", "06:00 PM"
  ];

  // Fetch categories on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch vendors when category changes
  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchVendors({ categoryId: selectedCategory }));
    }
  }, [dispatch, selectedCategory]);

  // Set vendor from URL param
  useEffect(() => {
    if (vendorIdParam && vendors.length > 0) {
      const vendor = vendors.find(v => v.id === vendorIdParam);
      if (vendor) {
        setSelectedVendor(vendor);
        setStep(2);
      }
    }
  }, [vendorIdParam, vendors]);

  const filteredVendors = vendors.filter(v => v.status === "approved" && v.isStoreOpen);
  const selectedCategoryObj = categories.find(c => c.id === selectedCategory);

  // Get minimum date (today)
  const today = new Date().toISOString().split('T')[0];

  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedCategory || !selectedVendor || !scheduledDate || !scheduledTime || !address || !city) {
      toast.error("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await dispatch(createBooking({
        vendorId: selectedVendor.id,
        categoryId: selectedCategory,
        serviceId: selectedCategory, // Using category as service for now
        options: {},
        scheduledDate,
        scheduledTime,
        address,
        city,
        notes,
      })).unwrap();

      toast.success("Booking created successfully!");
      router.push("/user/bookings");
    } catch (err: any) {
      toast.error(err || "Failed to create booking");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/user/services">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Book a Service</h1>
          <p className="text-muted-foreground">
            {step === 1 ? "Select a vendor" : "Enter booking details"}
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 1 ? "bg-primary text-white" : "bg-muted"}`}>
            {step > 1 ? <Check className="h-4 w-4" /> : "1"}
          </div>
          <span className="text-sm font-medium">Select Vendor</span>
        </div>
        <div className="h-px w-12 bg-border" />
        <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step >= 2 ? "bg-primary text-white" : "bg-muted"}`}>
            2
          </div>
          <span className="text-sm font-medium">Booking Details</span>
        </div>
      </div>

      {/* Step 1: Select Vendor */}
      {step === 1 && (
        <div className="space-y-6">
          {/* Category Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Category</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a service category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Vendor List */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  Available Vendors
                  {selectedCategoryObj && ` for ${selectedCategoryObj.name}`}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2">Loading vendors...</span>
                  </div>
                ) : filteredVendors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No vendors available for this category</p>
                  </div>
                ) : (
                  <div className="grid gap-4 sm:grid-cols-2">
                    {filteredVendors.map((vendor) => (
                      <div
                        key={vendor.id}
                        onClick={() => handleVendorSelect(vendor)}
                        className="cursor-pointer rounded-xl border border-border p-4 transition-all hover:border-primary hover:shadow-md"
                      >
                        <div className="flex items-start gap-4">
                          <Avatar name={vendor.businessName} size="lg" />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold">{vendor.businessName}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <Star className="h-4 w-4 fill-warning text-warning" />
                              <span className="text-sm">{vendor.rating.toFixed(1)}</span>
                              <span className="text-xs text-muted-foreground">
                                ({vendor.completedBookings} bookings)
                              </span>
                            </div>
                            {vendor.locations && vendor.locations[0] && (
                              <p className="text-xs text-muted-foreground mt-1 flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {vendor.locations[0].city}
                              </p>
                            )}
                          </div>
                          <Badge variant="success">Open</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Step 2: Booking Details */}
      {step === 2 && selectedVendor && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Selected Vendor Card */}
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={selectedVendor.businessName} size="lg" />
                  <div>
                    <p className="font-semibold">{selectedVendor.businessName}</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedCategoryObj?.name}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-warning text-warning" />
                      <span className="text-sm">{selectedVendor.rating.toFixed(1)}</span>
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep(1)}
                >
                  Change
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Schedule */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="date">Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    min={today}
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Time Slot *</Label>
                  <Select value={scheduledTime} onValueChange={setScheduledTime} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select time" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((slot) => (
                        <SelectItem key={slot} value={slot}>
                          {slot}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Service Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  placeholder="Enter your complete address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Any special instructions or requirements..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(1)}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Booking...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Confirm Booking
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
