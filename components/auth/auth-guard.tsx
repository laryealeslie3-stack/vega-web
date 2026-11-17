"use client";

import { useAppSelector } from "@/store";
import {
  selectUser,
  selectIsAuthenticated,
  selectIsInitialized,
  selectIsLoading,
  roleDashboards,
  type UserRole,
} from "@/store/slices/authSlice";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

interface AuthGuardProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

/**
 * Client-side auth guard component using Redux.
 * Wraps protected pages to ensure user is authenticated and has required role.
 */
export function AuthGuard({
  children,
  allowedRoles,
  fallbackPath = "/login",
}: AuthGuardProps) {
  const user = useAppSelector(selectUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isInitialized = useAppSelector(selectIsInitialized);
  const isLoading = useAppSelector(selectIsLoading);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isInitialized) return;

    // Not authenticated - redirect to login
    if (!isAuthenticated) {
      const loginUrl = `${fallbackPath}?redirect=${encodeURIComponent(pathname)}`;
      router.push(loginUrl);
      return;
    }

    // Check role authorization
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      // Redirect to correct dashboard for their role
      const correctDashboard = roleDashboards[user.role];
      router.push(correctDashboard);
    }
  }, [isInitialized, isAuthenticated, user, allowedRoles, router, pathname, fallbackPath]);

  // Show loading while checking auth
  if (!isInitialized || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  // Wrong role
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Redirecting to your dashboard...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * HOC to wrap a page component with auth guard
 */
export function withAuthGuard<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  allowedRoles?: UserRole[]
) {
  return function AuthGuardedComponent(props: P) {
    return (
      <AuthGuard allowedRoles={allowedRoles}>
        <WrappedComponent {...props} />
      </AuthGuard>
    );
  };
}
