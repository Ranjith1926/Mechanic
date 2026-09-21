"use client";

import { RoleGuard } from "@/components/layout/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/client" },
  { label: "My Bikes", href: "/client/bikes" },
  { label: "Service History", href: "/client/service-history" },
  { label: "Invoices", href: "/client/invoices" },
  { label: "Notifications", href: "/client/notifications" },
  { label: "Profile", href: "/client/profile" },
];

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="Client">
      <AppShell navItems={NAV_ITEMS}>{children}</AppShell>
    </RoleGuard>
  );
}
