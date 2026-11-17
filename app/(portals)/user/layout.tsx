"use client";

import { AuthGuard } from "@/components/auth";
import { UserSidebar } from "./_components/user-sidebar";
import { UserHeader } from "./_components/user-header";

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["user"]}>
      <div className="flex h-screen overflow-hidden bg-background">
        <UserSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <UserHeader />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
