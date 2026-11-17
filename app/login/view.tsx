"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LogoMark } from "@/components/ui/logo";
import { useAppDispatch, useAppSelector } from "@/store";
import {
  login,
  clearError,
  selectUser,
  selectIsAuthenticated,
  selectIsInitialized,
  selectIsLoading,
  selectAuthError,
  roleDashboards,
} from "@/store/slices/authSlice";
import { cn } from "@/lib/utils";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Shield,
  ShoppingBag,
  User,
  Wrench,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

// Role display options (for UI only - actual role comes from API)
const roleDisplayOptions: {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
  color: string;
}[] = [
  {
    id: "admin",
    label: "Admin",
    description: "Full system access",
    icon: Shield,
    color: "text-red-500 bg-red-500/10 border-red-500/20",
  },
  {
    id: "user",
    label: "Customer",
    description: "Book services",
    icon: User,
    color: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  },
  {
    id: "vendor",
    label: "Vendor",
    description: "Manage your business",
    icon: ShoppingBag,
    color: "text-emerald-500 bg-emerald-500/10 border-emerald-500/20",
  },
  {
    id: "serviceBoy",
    label: "Service Boy",
    description: "Handle jobs",
    icon: Wrench,
    color: "text-orange-500 bg-orange-500/10 border-orange-500/20",
  },
];

export default function LoginView() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectIsLoading);
  const authError = useAppSelector(selectAuthError);

  const [selectedRoleDisplay, setSelectedRoleDisplay] = useState("admin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isInitialized && isAuthenticated && user) {
      const dashboard = roleDashboards[user.role];
      router.push(dashboard);
    }
  }, [isInitialized, isAuthenticated, user, router]);

  // Clear error when unmounting or when user starts typing
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());

    if (!email.trim() || !password.trim()) {
      return;
    }

    const result = await dispatch(login({ email, password }));

    if (login.fulfilled.match(result)) {
      // Login successful - redirect will happen via useEffect
      const loggedInUser = result.payload;
      const dashboard = roleDashboards[loggedInUser.role];
      router.push(dashboard);
    }
  };

  // Show loading while checking auth state
  if (!isInitialized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (will redirect)
  if (isAuthenticated && user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">
            Redirecting to dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#1b1e85] p-12 flex-col justify-between text-white">
        <div>
          <LogoMark className="text-white" />
        </div>
        <div className="space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Welcome to Vega
            <br />
            Services Portal
          </h1>
          <p className="text-lg text-white/80 max-w-md">
            One platform for all your service needs. Manage bookings, vendors,
            and services seamlessly.
          </p>
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-3xl font-bold">1,200+</p>
              <p className="text-sm text-white/70">Active Bookings</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-3xl font-bold">86</p>
              <p className="text-sm text-white/70">Verified Vendors</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-3xl font-bold">52</p>
              <p className="text-sm text-white/70">Service Professionals</p>
            </div>
            <div className="rounded-lg bg-white/10 p-4">
              <p className="text-3xl font-bold">4.8★</p>
              <p className="text-sm text-white/70">Average Rating</p>
            </div>
          </div>
        </div>
        <p className="text-sm text-white/60">
          © 2024 Vega Services. All rights reserved.
        </p>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center">
            <LogoMark />
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter your credentials to access your portal
            </p>
          </div>

          {/* Role Display (informational only - API determines actual role) */}
          <div className="grid grid-cols-2 gap-3">
            {roleDisplayOptions.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRoleDisplay === role.id;
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRoleDisplay(role.id)}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all duration-200",
                    isSelected
                      ? `${role.color} border-current`
                      : "border-border bg-card hover:border-muted-foreground/40"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg",
                      isSelected ? role.color : "bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        "text-sm font-semibold",
                        isSelected ? "" : "text-foreground"
                      )}
                    >
                      {role.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-current text-white">
                      <svg
                        className="h-3 w-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            Your role is determined by your account. Select your role type above
            for reference.
          </p>

          {/* Login Form */}
          <Card>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                {authError && (
                  <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                    <span>{authError}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (authError) dispatch(clearError());
                      }}
                      placeholder="Enter your email"
                      className="pl-10"
                      disabled={isLoading}
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (authError) dispatch(clearError());
                      }}
                      placeholder="Enter your password"
                      className="pl-10 pr-10"
                      disabled={isLoading}
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-border h-4 w-4"
                      disabled={isLoading}
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading || !email.trim() || !password.trim()}
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <p className="text-xs font-medium text-muted-foreground mb-2">
                How it works
              </p>
              <p className="text-xs text-muted-foreground">
                Enter your email and password. The system will automatically
                direct you to the appropriate portal based on your account type
                (Admin, Customer, Vendor, or Service Boy).
              </p>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/register"
              className="font-medium text-primary hover:underline"
            >
              Register as Customer
            </Link>{" "}
            or{" "}
            <Link
              href="/vendor/register"
              className="font-medium text-primary hover:underline"
            >
              Register as Vendor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
