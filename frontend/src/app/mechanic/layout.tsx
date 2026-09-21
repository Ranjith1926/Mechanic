"use client";

import { RoleGuard } from "@/components/layout/RoleGuard";
import { AppShell } from "@/components/layout/AppShell";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/mechanic" },
  { label: "Customers", href: "/mechanic/customers" },
  { label: "Bikes", href: "/mechanic/bikes" },
  { label: "Services", href: "/mechanic/services" },
  { label: "Spare Parts", href: "/mechanic/spare-parts" },
  { label: "Invoices", href: "/mechanic/invoices" },
  { label: "Follow-ups", href: "/mechanic/follow-ups" },
  { label: "Notifications", href: "/mechanic/notifications" },
  { label: "Profile", href: "/mechanic/profile" },
];

export default function MechanicLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGuard allow="Mechanic">
      <AppShell navItems={NAV_ITEMS}>{children}</AppShell>
    </RoleGuard>
  );
}
