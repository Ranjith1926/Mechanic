"use client";

import { useAuth } from "@/hooks/useAuth";

export default function ClientDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Welcome, {user?.name}</h1>
      <p className="mt-1 text-sm text-gray-500">
        Your bikes, recent services and follow-ups will appear here.
      </p>
    </div>
  );
}
