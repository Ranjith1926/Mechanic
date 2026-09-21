"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { invoiceService } from "@/services/invoiceService";
import { Invoice } from "@/types/domain";

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    invoiceService
      .list()
      .then(setInvoices)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Invoices</h1>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : invoices.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No invoices yet. Generate one from a completed service.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Invoice</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Bike</th>
                <th className="px-4 py-2">Total</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">
                    {invoice.invoiceNumber}
                    {invoice.isVoided && <span className="ml-2 text-xs text-red-600">VOID</span>}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-gray-600">{invoice.clientName}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {invoice.bikeLabel} ({invoice.bikeRegistrationNumber})
                  </td>
                  <td className="px-4 py-2 text-gray-600">Rs. {invoice.totalAmount.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/mechanic/invoices/${invoice.id}`} className="text-blue-600 hover:underline">
                      Open
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
