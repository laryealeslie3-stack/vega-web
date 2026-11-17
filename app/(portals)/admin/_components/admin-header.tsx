"use client";

import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useAppDispatch, useAppSelector } from "@/store";
import { logout, selectUser } from "@/store/slices/authSlice";
import { Bell, LogOut, Menu, Search, Settings, Shield, User } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function AdminHeader() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const user = useAppSelector(selectUser);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = async () => {
    await dispatch(logout());
    router.push("/login");
  };

  return (
    <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <button className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground lg:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <div className="hidden sm:flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Badge variant="destructive" className="hidden sm:flex items-center gap-1">
          <Shield className="h-3 w-3" />
          Super Admin
        </Badge>

        <button className="relative rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            7
          </span>
        </button>

        <div className="relative">
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-3 rounded-lg p-2 hover:bg-muted"
          >
            <Avatar name={user?.name || "Admin"} size="sm" />
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">Administrator</p>
            </div>
          </button>

          {showDropdown && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-lg border border-border bg-card p-2 shadow-lg">
                <div className="border-b border-border px-3 py-2 mb-2">
                  <p className="font-medium">{user?.name}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                  <Badge variant="destructive" className="mt-1 text-xs">Super Admin</Badge>
                </div>
                <a href="/admin/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                  <User className="h-4 w-4" />
                  My Profile
                </a>
                <a href="/admin/settings" className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted">
                  <Settings className="h-4 w-4" />
                  Settings
                </a>
                <hr className="my-2 border-border" />
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
