"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bikeService } from "@/services/bikeService";

interface InvoiceRow {
  invoiceId: number;
  invoiceNumber: string;
  invoiceTotal: number;
  serviceDate: string;
  bikeLabel: string;
  bikeRegistrationNumber: string;
}

export default function ClientInvoicesPage() {
  const [rows, setRows] = useState<InvoiceRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const bikes = await bikeService.list();
      const histories = await Promise.all(
        bikes.map(async (bike) => {
          const history = await bikeService.getHistory(bike.id);
          return history
            .filter((item) => item.invoiceId && item.invoiceNumber)
            .map((item) => ({
              invoiceId: item.invoiceId!,
              invoiceNumber: item.invoiceNumber!,
              invoiceTotal: item.invoiceTotal ?? 0,
              serviceDate: item.serviceDate,
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
      <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : rows.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No invoices yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Invoice</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Bike</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.invoiceId}>
                  <td className="px-4 py-2 font-medium text-gray-900">{row.invoiceNumber}</td>
                  <td className="px-4 py-2 text-gray-600">{new Date(row.serviceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {row.bikeLabel} ({row.bikeRegistrationNumber})
                  </td>
                  <td className="px-4 py-2 text-gray-600">Rs. {row.invoiceTotal.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/client/invoices/${row.invoiceId}`} className="text-blue-600 hover:underline">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
