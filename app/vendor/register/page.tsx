"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogoMark } from "@/components/ui/logo";
import {
  AlertCircle,
  ArrowRight,
  Building2,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  Store,
  User,
} from "lucide-react";
import Link from "next/link";
import apiClient from "@/lib/api/client";

interface VendorRegisterData {
  businessName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  description: string;
  ownerName: string;
}

export default function VendorRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<VendorRegisterData>({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    description: "",
    ownerName: "",
  });

  const updateField = (field: keyof VendorRegisterData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const validateStep1 = () => {
    if (!formData.businessName.trim()) {
      setError("Business name is required");
      return false;
    }
    if (!formData.ownerName.trim()) {
      setError("Owner name is required");
      return false;
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      setError("Valid phone number is required");
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Valid email is required");
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep2()) return;

    setIsLoading(true);
    setError("");

    try {
      await apiClient.post("/api/v1/vendor/register", {
        businessName: formData.businessName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        description: formData.description,
        name: formData.ownerName,
      });

      // Success - show confirmation
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1b1e85] p-12 flex-col justify-between text-white">
        <div>
          <LogoMark className="text-white" />
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Grow Your Business
            <br />
            With Vega
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Join hundreds of vendors and reach thousands of customers. Register your business and start accepting bookings today.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Easy Onboarding</p>
                <p className="text-sm text-white/70">Get started in minutes</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Manage Everything</p>
                <p className="text-sm text-white/70">Bookings, team & payments</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Check className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Grow Revenue</p>
                <p className="text-sm text-white/70">Reach more customers</p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/60">
          © 2024 Vega Services. All rights reserved.
        </p>
      </div>

      {/* Right Side - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <LogoMark />
          </div>

          {/* Step indicator */}
          {step < 3 && (
            <div className="flex items-center justify-center gap-4">
              <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 1 ? "bg-primary text-white" : "bg-muted"}`}>
                  {step > 1 ? <Check className="h-4 w-4" /> : "1"}
                </div>
                <span className="text-sm">Business Info</span>
              </div>
              <div className="h-px w-8 bg-border" />
              <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${step >= 2 ? "bg-primary text-white" : "bg-muted"}`}>
                  2
                </div>
                <span className="text-sm">Account</span>
              </div>
            </div>
          )}

          {/* Step 1: Business Info */}
          {step === 1 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Register Your Business</CardTitle>
                <CardDescription>Tell us about your business</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="businessName">Business Name *</Label>
                  <div className="relative">
                    <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="businessName"
                      placeholder="Your business name"
                      value={formData.businessName}
                      onChange={(e) => updateField("businessName", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="ownerName">Owner Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="ownerName"
                      placeholder="Your full name"
                      value={formData.ownerName}
                      onChange={(e) => updateField("ownerName", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number"
                      value={formData.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="description">Business Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell customers about your services..."
                    value={formData.description}
                    onChange={(e) => updateField("description", e.target.value)}
                    rows={3}
                  />
                </div>

                <Button onClick={handleNext} className="w-full" size="lg">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Account Setup */}
          {step === 2 && (
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Create Account</CardTitle>
                <CardDescription>Set up your login credentials</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      {error}
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email Address *</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="business@example.com"
                        value={formData.email}
                        onChange={(e) => updateField("email", e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password *</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Minimum 8 characters"
                        value={formData.password}
                        onChange={(e) => updateField("password", e.target.value)}
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password *</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={(e) => updateField("confirmPassword", e.target.value)}
                    />
                  </div>

                  <div className="flex gap-3">
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
                      disabled={isLoading}
                      className="flex-1"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Register"
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <Card>
              <CardContent className="pt-6 text-center space-y-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mx-auto">
                  <Check className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Registration Submitted!</h2>
                  <p className="text-muted-foreground mt-2">
                    Your vendor application has been submitted successfully. Our team will review your application and get back to you within 24-48 hours.
                  </p>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-left">
                  <p className="text-sm font-medium mb-2">What's next?</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• We'll review your business details</li>
                    <li>• You'll receive an email once approved</li>
                    <li>• Login and set up your services</li>
                  </ul>
                </div>
                <Link href="/login">
                  <Button className="w-full" size="lg">
                    Go to Login
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

          {step < 3 && (
            <p className="text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign In
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
