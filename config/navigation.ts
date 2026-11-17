import type { NavGroup } from "@/types";
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Store,
} from "lucide-react";

export const navigation: NavGroup[] = [
  {
    label: "Menu",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Vendors", href: "/vendors", icon: Store },
      { title: "Booking", href: "/booking", icon: Calendar },
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];
