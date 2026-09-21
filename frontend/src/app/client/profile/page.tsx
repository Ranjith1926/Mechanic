"use client";

import { useAuth } from "@/hooks/useAuth";

export default function ClientProfilePage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Profile</h1>
      <div className="mt-4 max-w-md rounded-lg border border-gray-200 bg-white p-4 text-sm">
        <p>
          <span className="text-gray-500">Name:</span> {user?.name}
        </p>
        <p className="mt-2">
          <span className="text-gray-500">Phone:</span> {user?.phone}
        </p>
        <p className="mt-2">
          <span className="text-gray-500">Email:</span> {user?.email ?? "—"}
        </p>
      </div>
    </div>
  );
}
