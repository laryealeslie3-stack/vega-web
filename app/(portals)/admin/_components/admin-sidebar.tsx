"use client";

import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  BarChart3,
  Calendar,
  Home,
  Settings,
  Shield,
  Store,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { title: "Dashboard", href: "/admin/dashboard", icon: Home },
  { title: "Vendors", href: "/admin/vendors", icon: Store },
  { title: "Bookings", href: "/admin/booking", icon: Calendar },
  { title: "Service Boys", href: "/admin/serviceboys", icon: Users },
  { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { title: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-border bg-card transition-transform duration-200 lg:relative lg:z-auto lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border px-4">
          <Link href="/admin/dashboard">
            <LogoMark />
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-red-600 dark:text-red-400">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-medium">Admin Portal</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t border-border p-4">
          <div className="rounded-lg bg-[#1b1e85] p-4 text-white">
            <p className="text-sm font-semibold">System Status</p>
            <p className="mt-1 text-xs text-white/80">All systems operational</p>
            <div className="mt-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs">Healthy</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
