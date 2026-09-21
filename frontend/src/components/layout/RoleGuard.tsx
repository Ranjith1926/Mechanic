"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { UserRole } from "@/types/auth";

export function RoleGuard({ allow, children }: { allow: UserRole; children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== allow) {
      router.replace(user.role === "Mechanic" ? "/mechanic" : "/client");
    }
  }, [user, isLoading, allow, router]);

  if (isLoading || !user || user.role !== allow) {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-gray-500">
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
