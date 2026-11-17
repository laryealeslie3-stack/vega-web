"use client";

import { AuthGuard } from "@/components/auth";
import { VendorSidebar } from "./_components/vendor-sidebar";
import { VendorHeader } from "./_components/vendor-header";

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["vendor"]}>
      <div className="flex h-screen overflow-hidden bg-background">
        <VendorSidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <VendorHeader />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
