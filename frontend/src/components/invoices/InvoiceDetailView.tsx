"use client";

import { useEffect, useState } from "react";
import { invoiceService } from "@/services/invoiceService";
import { Invoice } from "@/types/domain";
import { downloadBlob, openBlobForPrint, shareOrDownloadBlob } from "@/utils/pdf";

export function InvoiceDetailView({ invoiceId, canVoid = false }: { invoiceId: number; canVoid?: boolean }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    invoiceService
      .getById(invoiceId)
      .then(setInvoice)
      .catch(() => setError("Could not load this invoice."))
      .finally(() => setIsLoading(false));
  }, [invoiceId]);

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  if (!invoice) {
    return <p className="text-sm text-red-600">{error ?? "Invoice not found."}</p>;
  }

  async function handleDownload() {
    setIsBusy(true);
    try {
      const blob = await invoiceService.getPdfBlob(invoice!.id);
      downloadBlob(blob, `${invoice!.invoiceNumber}.pdf`);
    } finally {
      setIsBusy(false);
    }
  }

  async function handlePrint() {
    setIsBusy(true);
    try {
      const blob = await invoiceService.getPdfBlob(invoice!.id);
      openBlobForPrint(blob);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleShare() {
    setIsBusy(true);
    try {
      const blob = await invoiceService.getPdfBlob(invoice!.id);
      await shareOrDownloadBlob(blob, `${invoice!.invoiceNumber}.pdf`, invoice!.invoiceNumber);
    } finally {
      setIsBusy(false);
    }
  }

  async function handleVoid() {
    if (!confirm("Void this invoice? It will stay on record but be marked void.")) return;
    setIsBusy(true);
    try {
      const updated = await invoiceService.void(invoice!.id);
      setInvoice(updated);
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">{invoice.invoiceNumber}</h1>
          <p className="text-sm text-gray-500">{new Date(invoice.invoiceDate).toLocaleDateString()}</p>
        </div>
        {invoice.isVoided && (
          <span className="rounded-full bg-red-50 px-3 py-1 text-sm font-medium text-red-700">VOID</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <p className="text-xs uppercase text-gray-500">Bill To</p>
          <p className="mt-1 font-medium text-gray-900">{invoice.clientName}</p>
          <p className="text-gray-500">{invoice.clientPhone}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4 text-sm">
          <p className="text-xs uppercase text-gray-500">Vehicle</p>
          <p className="mt-1 font-medium text-gray-900">{invoice.bikeLabel}</p>
          <p className="text-gray-500">{invoice.bikeRegistrationNumber}</p>
        </div>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-2">Description</th>
              <th className="px-4 py-2">Qty</th>
              <th className="px-4 py-2">Unit Price</th>
              <th className="px-4 py-2">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {invoice.items.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-gray-900">{item.description}</td>
                <td className="px-4 py-2 text-gray-600">{item.quantity}</td>
                <td className="px-4 py-2 text-gray-600">Rs. {item.unitPrice.toLocaleString()}</td>
                <td className="px-4 py-2 text-gray-600">Rs. {item.amount.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="border-t border-gray-200 p-4 text-sm">
          <div className="flex justify-between py-0.5">
            <span className="text-gray-500">Labour</span>
            <span>Rs. {invoice.labourAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-0.5">
            <span className="text-gray-500">Spare Parts</span>
            <span>Rs. {invoice.sparePartsAmount.toLocaleString()}</span>
          </div>
          {invoice.discount > 0 && (
            <div className="flex justify-between py-0.5">
              <span className="text-gray-500">Discount</span>
              <span>- Rs. {invoice.discount.toLocaleString()}</span>
            </div>
          )}
          {invoice.tax > 0 && (
            <div className="flex justify-between py-0.5">
              <span className="text-gray-500">Tax</span>
              <span>Rs. {invoice.tax.toLocaleString()}</span>
            </div>
          )}
          <div className="mt-1 flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-900">
            <span>Total</span>
            <span>Rs. {invoice.totalAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={isBusy}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          Download PDF
        </button>
        <button
          onClick={handlePrint}
          disabled={isBusy}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Print
        </button>
        <button
          onClick={handleShare}
          disabled={isBusy}
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
        >
          Share
        </button>
        {canVoid && !invoice.isVoided && (
          <button
            onClick={handleVoid}
            disabled={isBusy}
            className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60"
          >
            Void Invoice
          </button>
        )}
      </div>
    </div>
  );
}
