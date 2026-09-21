"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { bikeService } from "@/services/bikeService";
import { followUpService } from "@/services/followUpService";
import { Bike, BikeHistoryItem, FollowUp } from "@/types/domain";

interface LatestServiceRow extends BikeHistoryItem {
  bikeId: number;
  bikeLabel: string;
}

export default function ClientDashboardPage() {
  const { user } = useAuth();
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [latestService, setLatestService] = useState<LatestServiceRow | null>(null);
  const [latestInvoice, setLatestInvoice] = useState<LatestServiceRow | null>(null);
  const [nextFollowUp, setNextFollowUp] = useState<FollowUp | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [myBikes, upcoming] = await Promise.all([bikeService.list(), followUpService.upcoming()]);
      setBikes(myBikes);
      setNextFollowUp(upcoming[0] ?? null);

      const histories = await Promise.all(
        myBikes.map(async (bike) => {
          const history = await bikeService.getHistory(bike.id);
          return history.map((item) => ({ ...item, bikeId: bike.id, bikeLabel: `${bike.brand} ${bike.model}` }));
        })
      );
      const merged = histories.flat().sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
      setLatestService(merged[0] ?? null);
      setLatestInvoice(merged.find((item) => item.invoiceId) ?? null);
      setIsLoading(false);
    }

    load();
  }, []);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Welcome, {user?.name}</h1>

      <h2 className="mt-6 text-sm font-semibold uppercase text-gray-500">My Bikes</h2>
      {bikes.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No bikes registered yet.</p>
      ) : (
        <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {bikes.map((bike) => (
            <Link
              key={bike.id}
              href={`/client/bikes/${bike.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300"
            >
              <p className="font-medium text-gray-900">
                {bike.brand} {bike.model}
              </p>
              <p className="text-sm text-gray-500">{bike.registrationNumber}</p>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Recent Service</p>
          {latestService ? (
            <>
              <p className="mt-1 font-medium text-gray-900">{new Date(latestService.serviceDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">{latestService.bikeLabel}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-500">None yet</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Next Follow-up</p>
          {nextFollowUp ? (
            <>
              <p className="mt-1 font-medium text-gray-900">{new Date(nextFollowUp.followUpDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-500">{nextFollowUp.bikeLabel}</p>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-500">None scheduled</p>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <p className="text-xs uppercase text-gray-500">Latest Invoice</p>
          {latestInvoice ? (
            <>
              <p className="mt-1 font-medium text-gray-900">{latestInvoice.invoiceNumber}</p>
              <Link href={`/client/invoices/${latestInvoice.invoiceId}`} className="text-sm text-blue-600 hover:underline">
                View Invoice
              </Link>
            </>
          ) : (
            <p className="mt-1 text-sm text-gray-500">None yet</p>
          )}
        </div>
      </div>
    </div>
  );
}
