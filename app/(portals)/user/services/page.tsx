"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCategories,
  fetchVendors,
  selectCategories,
  selectVendorsList,
  selectCatalogLoading,
  selectCatalogError,
} from "@/store/slices/catalogSlice";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Filter,
  Loader2,
  MapPin,
  Phone,
  RefreshCw,
  Search,
  Star,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import type { Category, Vendor } from "@/lib/api/types";

// Service icons and colors
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

function getCategoryIcon(slug: string): string {
  return categoryIcons[slug?.toLowerCase()] || categoryIcons.default;
}

function getCategoryColor(slug: string): string {
  return categoryColors[slug?.toLowerCase()] || categoryColors.default;
}

export default function ServicesPage() {
  const dispatch = useAppDispatch();
  const searchParams = useSearchParams();
  
  // Redux state
  const categories = useAppSelector(selectCategories);
  const vendors = useAppSelector(selectVendorsList);
  const isLoading = useAppSelector(selectCatalogLoading);
  const error = useAppSelector(selectCatalogError);
  
  // Local state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    searchParams.get("category")
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [isVendorDialogOpen, setIsVendorDialogOpen] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  // Fetch vendors when category changes
  useEffect(() => {
    if (selectedCategory) {
      dispatch(fetchVendors({ categoryId: selectedCategory }));
    } else {
      dispatch(fetchVendors({}));
    }
  }, [dispatch, selectedCategory]);

  const handleRefresh = () => {
    dispatch(fetchCategories());
    if (selectedCategory) {
      dispatch(fetchVendors({ categoryId: selectedCategory }));
    } else {
      dispatch(fetchVendors({}));
    }
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const openVendorDialog = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setIsVendorDialogOpen(true);
  };

  // Filter vendors based on search
  const filteredVendors = vendors
    .filter(v => v.status === "approved")
    .filter(v => 
      v.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Get selected category details
  const currentCategory = categories.find(c => c.id === selectedCategory);

  // Categories View
  if (!selectedCategory) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Browse Services</h1>
            <p className="text-muted-foreground">Find the perfect service provider for your needs</p>
          </div>
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4 flex items-center gap-2 text-red-700">
              <XCircle className="h-5 w-5" />
              <span>Failed to load services: {error}</span>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && categories.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading services...</span>
          </div>
        ) : categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No services available</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((category) => (
              <Card
                key={category.id}
                className="cursor-pointer hover:border-primary transition-colors"
                onClick={() => handleCategorySelect(category.id)}
              >
                <CardContent className="p-6 flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-xl ${getCategoryColor(category.slug)} text-white text-2xl`}>
                    {category.icon || getCategoryIcon(category.slug)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-lg">{category.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {category.servicesCount || 0} services available
                    </p>
                    {category.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Vendors View
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={handleBackToCategories}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{currentCategory?.name || "Vendors"}</h1>
          <p className="text-muted-foreground">
            {filteredVendors.length} vendor{filteredVendors.length !== 1 ? "s" : ""} available
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>
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
      </div>

      {/* Error State */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-2 text-red-700">
            <XCircle className="h-5 w-5" />
            <span>Failed to load vendors: {error}</span>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {isLoading && vendors.length === 0 ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading vendors...</span>
        </div>
      ) : filteredVendors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No vendors found</p>
            {searchQuery && (
              <Button variant="outline" className="mt-4" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredVendors.map((vendor) => (
            <Card
              key={vendor.id}
              className="cursor-pointer hover:border-primary transition-colors"
              onClick={() => openVendorDialog(vendor)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar name={vendor.businessName} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold">{vendor.businessName}</p>
                      <Badge 
                        variant={vendor.isStoreOpen ? "success" : "default"}
                        className="text-xs"
                      >
                        {vendor.isStoreOpen ? "Open" : "Closed"}
                      </Badge>
                    </div>
                    {vendor.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {vendor.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-warning text-warning" />
                      <span className="font-medium">{vendor.rating.toFixed(1)}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      ({vendor.completedBookings} bookings)
                    </span>
                  </div>
                </div>

                {vendor.locations && vendor.locations.length > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    <span className="truncate">
                      {vendor.locations[0].city}
                      {vendor.locations.length > 1 && ` +${vendor.locations.length - 1} more`}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Vendor Detail Dialog */}
      <Dialog open={isVendorDialogOpen} onOpenChange={setIsVendorDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Vendor Details</DialogTitle>
          </DialogHeader>
          {selectedVendor && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar name={selectedVendor.businessName} size="xl" />
                <div>
                  <h3 className="font-semibold text-lg">{selectedVendor.businessName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Star className="h-4 w-4 fill-warning text-warning" />
                    <span className="font-medium">{selectedVendor.rating.toFixed(1)}</span>
                    <span className="text-sm text-muted-foreground">
                      ({selectedVendor.completedBookings} completed)
                    </span>
                  </div>
                  <Badge 
                    variant={selectedVendor.isStoreOpen ? "success" : "default"}
                    className="mt-2"
                  >
                    {selectedVendor.isStoreOpen ? "Open Now" : "Closed"}
                  </Badge>
                </div>
              </div>

              {selectedVendor.description && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">About</h4>
                  <p className="text-sm text-muted-foreground">{selectedVendor.description}</p>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium mb-2">Contact</h4>
                <div className="space-y-2 text-sm">
                  <p className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedVendor.phone}
                  </p>
                </div>
              </div>

              {selectedVendor.locations && selectedVendor.locations.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Service Locations</h4>
                  <div className="space-y-2 text-sm">
                    {selectedVendor.locations.filter(l => l.isActive).map((location) => (
                      <div key={location.id} className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{location.address}, {location.city}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedVendor.services && selectedVendor.services.length > 0 && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Services</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedVendor.services.map((service, i) => (
                      <Badge key={i} variant="outline">{service}</Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-primary">{selectedVendor.totalBookings}</p>
                  <p className="text-xs text-muted-foreground">Total Bookings</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-2xl font-bold text-emerald-600">{selectedVendor.completedBookings}</p>
                  <p className="text-xs text-muted-foreground">Completed</p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsVendorDialogOpen(false)}>
              Close
            </Button>
            <Link href={`/user/bookings/new?vendor=${selectedVendor?.id}&category=${selectedCategory}`}>
              <Button disabled={!selectedVendor?.isStoreOpen}>
                <Calendar className="h-4 w-4 mr-2" />
                Book Now
              </Button>
            </Link>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
