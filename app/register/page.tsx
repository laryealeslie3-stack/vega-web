"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  register,
  clearError,
  selectIsAuthenticated,
  selectIsLoading,
  selectAuthError,
  selectUser,
  roleDashboards,
} from "@/store/slices/authSlice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogoMark } from "@/components/ui/logo";
import {
  AlertCircle,
  Calendar,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Mail,
  Phone,
  ShoppingBag,
  Star,
  User,
} from "lucide-react";
import Link from "next/link";

export default function CustomerRegisterPage() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  // Redux state
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectIsLoading);
  const authError = useAppSelector(selectAuthError);
  const user = useAppSelector(selectUser);

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState("");

  // Redirect if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const dashboard = roleDashboards[user.role];
      router.push(dashboard);
    }
  }, [isAuthenticated, user, router]);

  // Clear errors on unmount
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const validateForm = () => {
    if (!name.trim()) {
      setLocalError("Name is required");
      return false;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setLocalError("Valid email is required");
      return false;
    }
    if (!password || password.length < 8) {
      setLocalError("Password must be at least 8 characters");
      return false;
    }
    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    dispatch(clearError());

    if (!validateForm()) return;

    const result = await dispatch(
      register({
        name,
        email,
        password,
        phone: phone || undefined,
      })
    );

    if (register.fulfilled.match(result)) {
      // Registration successful - redirect will happen via useEffect
      router.push("/user/dashboard");
    }
  };

  const displayError = localError || authError;

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1b1e85] p-12 flex-col justify-between text-white">
        <div>
          <LogoMark className="text-white" />
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Book Services
            <br />
            With Ease
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            Join thousands of happy customers. Find and book the best service providers in your area.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Easy Booking</p>
                <p className="text-sm text-white/70">Book services in seconds</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Verified Vendors</p>
                <p className="text-sm text-white/70">Quality assured services</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/10">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">Real Reviews</p>
                <p className="text-sm text-white/70">From genuine customers</p>
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

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Create Your Account</CardTitle>
              <CardDescription>Sign up to start booking services</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {displayError && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{displayError}</span>
                  </div>
                )}

                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setLocalError("");
                      }}
                      className="pl-10"
                      disabled={isLoading}
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setLocalError("");
                      }}
                      className="pl-10"
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter phone number (optional)"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10"
                      disabled={isLoading}
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
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setLocalError("");
                      }}
                      className="pr-10"
                      disabled={isLoading}
                      autoComplete="new-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
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
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setLocalError("");
                    }}
                    disabled={isLoading}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground text-center">
                By creating an account, you agree to our{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
              </p>
            </CardContent>
          </Card>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-primary hover:underline">
                Sign In
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              Want to register as a vendor?{" "}
              <Link href="/vendor/register" className="font-medium text-primary hover:underline">
                Register Business
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
