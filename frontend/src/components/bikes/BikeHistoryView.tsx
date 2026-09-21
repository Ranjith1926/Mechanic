"use client";

import { useEffect, useState } from "react";
import { bikeService } from "@/services/bikeService";
import { Bike, BikeHistoryItem } from "@/types/domain";

export function BikeHistoryView({ bikeId }: { bikeId: number }) {
  const [bike, setBike] = useState<Bike | null>(null);
  const [history, setHistory] = useState<BikeHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const [bikeData, historyData] = await Promise.all([
          bikeService.getById(bikeId),
          bikeService.getHistory(bikeId),
        ]);
        if (isMounted) {
          setBike(bikeData);
          setHistory(historyData);
        }
      } catch {
        if (isMounted) setError("Could not load bike history.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, [bikeId]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  if (error || !bike) {
    return <p className="text-sm text-red-600">{error ?? "Bike not found."}</p>;
  }

  return (
    <div>
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h1 className="text-lg font-semibold text-gray-900">
          {bike.brand} {bike.model}
          {bike.variant ? ` ${bike.variant}` : ""}
        </h1>
        <p className="mt-1 text-sm text-gray-500">Registration: {bike.registrationNumber}</p>
        <p className="mt-1 text-sm text-gray-500">Odometer: {bike.currentOdometer.toLocaleString()} km</p>
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-gray-500">Service History</h2>

      {history.length === 0 ? (
        <p className="mt-2 text-sm text-gray-500">No service records yet.</p>
      ) : (
        <ul className="mt-3 space-y-3">
          {history.map((item) => (
            <li key={item.serviceId} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  {new Date(item.serviceDate).toLocaleDateString()}
                </p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item.status}</span>
              </div>

              {item.workPerformed && <p className="mt-2 text-sm text-gray-700">{item.workPerformed}</p>}

              {item.parts.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-gray-600">
                  {item.parts.map((part, index) => (
                    <li key={index}>
                      {part.partName} — {part.action}
                      {part.action === "Replaced" && part.oldPartDescription && part.newPartDescription
                        ? ` (${part.oldPartDescription} → ${part.newPartDescription})`
                        : ""}
                    </li>
                  ))}
                </ul>
              )}

              {item.invoiceNumber && (
                <p className="mt-2 text-sm text-gray-500">
                  Invoice {item.invoiceNumber}: Rs. {item.invoiceTotal?.toLocaleString()}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
