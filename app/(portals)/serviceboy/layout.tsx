"use client";

import { AuthGuard } from "@/components/auth";
import { ServiceBoySidebar } from "./_components/serviceboy-sidebar";
import { ServiceBoyHeader } from "./_components/serviceboy-header";

export default function ServiceBoyLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard allowedRoles={["serviceBoy"]}>
      <div className="flex h-screen overflow-hidden bg-background">
        <ServiceBoySidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <ServiceBoyHeader />
          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
