"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bikeService } from "@/services/bikeService";
import { BikeHistoryItem } from "@/types/domain";

interface HistoryRow extends BikeHistoryItem {
  bikeLabel: string;
  bikeRegistrationNumber: string;
}

export default function ClientServiceHistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const bikes = await bikeService.list();
      const histories = await Promise.all(
        bikes.map(async (bike) => {
          const history = await bikeService.getHistory(bike.id);
          return history.map((item) => ({
            ...item,
            bikeLabel: `${bike.brand} ${bike.model}`,
            bikeRegistrationNumber: bike.registrationNumber,
          }));
        })
      );
      const merged = histories.flat().sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
      setRows(merged);
      setIsLoading(false);
    }

    load();
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Service History</h1>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No service records yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {rows.map((item) => (
            <li key={item.serviceId} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">{new Date(item.serviceDate).toLocaleDateString()}</p>
                <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">{item.status}</span>
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {item.bikeLabel} ({item.bikeRegistrationNumber})
              </p>

              {item.workPerformed && <p className="mt-2 text-sm text-gray-700">{item.workPerformed}</p>}

              {item.parts.length > 0 && (
                <ul className="mt-2 space-y-0.5 text-sm text-gray-500">
                  {item.parts.map((part, index) => (
                    <li key={index}>
                      {part.partName} — {part.action}
                    </li>
                  ))}
                </ul>
              )}

              {item.invoiceNumber && item.invoiceId && (
                <p className="mt-2 text-sm text-gray-500">
                  Invoice {item.invoiceNumber}: Rs. {item.invoiceTotal?.toLocaleString()}{" "}
                  <Link href={`/client/invoices/${item.invoiceId}`} className="text-blue-600 hover:underline">
                    View Invoice
                  </Link>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
