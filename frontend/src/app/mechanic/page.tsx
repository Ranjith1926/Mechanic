"use client";

import { useAuth } from "@/hooks/useAuth";

export default function MechanicDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Welcome back, {user?.name}</h1>
      <p className="mt-1 text-sm text-gray-500">
        The revenue and follow-up dashboard will appear here once services and invoices are in the system.
      </p>
    </div>
  );
}
