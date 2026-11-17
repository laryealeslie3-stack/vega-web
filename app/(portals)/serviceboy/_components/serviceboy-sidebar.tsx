"use client";

import { LogoMark } from "@/components/ui/logo";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Clock,
  DollarSign,
  Home,
  MapPin,
  MessageSquare,
  Settings,
  Star,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const navigation = [
  { title: "Dashboard", href: "/serviceboy/dashboard", icon: Home },
  { title: "My Jobs", href: "/serviceboy/jobs", icon: Calendar },
  { title: "Schedule", href: "/serviceboy/schedule", icon: Clock },
  { title: "Earnings", href: "/serviceboy/earnings", icon: DollarSign },
  { title: "Locations", href: "/serviceboy/locations", icon: MapPin },
  { title: "Reviews", href: "/serviceboy/reviews", icon: Star },
  { title: "Messages", href: "/serviceboy/messages", icon: MessageSquare },
  { title: "Settings", href: "/serviceboy/settings", icon: Settings },
];

export function ServiceBoySidebar() {
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
          <Link href="/serviceboy/dashboard">
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
          <div className="flex items-center gap-2 rounded-lg bg-orange-500/10 px-3 py-2 text-orange-600 dark:text-orange-400">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-white text-xs font-bold">
              S
            </div>
            <span className="text-sm font-medium">Service Boy Portal</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
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
            <p className="text-sm font-semibold">Boost Your Rating</p>
            <p className="mt-1 text-xs text-white/80">Complete jobs on time for better reviews</p>
            <button className="mt-3 w-full rounded-md bg-white/20 px-3 py-1.5 text-xs font-medium hover:bg-white/30">
              View Tips
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
