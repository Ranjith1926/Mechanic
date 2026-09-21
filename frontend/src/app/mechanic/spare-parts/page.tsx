"use client";

import { FormEvent, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { sparePartService } from "@/services/sparePartService";
import { SparePart } from "@/types/domain";

export default function SparePartsPage() {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  function loadParts() {
    setIsLoading(true);
    sparePartService
      .list()
      .then(setParts)
      .finally(() => setIsLoading(false));
  }

  useEffect(() => {
    loadParts();
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Spare Parts Catalog</h1>
        <button
          onClick={() => setIsFormOpen((open) => !open)}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isFormOpen ? "Cancel" : "Add Part"}
        </button>
      </div>

      {isFormOpen && (
        <NewSparePartForm
          onCreated={() => {
            setIsFormOpen(false);
            loadParts();
          }}
        />
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : parts.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No spare parts yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Brand</th>
                <th className="px-4 py-2">Part No.</th>
                <th className="px-4 py-2">Default Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {parts.map((part) => (
                <tr key={part.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{part.name}</td>
                  <td className="px-4 py-2 text-gray-600">{part.brand ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600">{part.partNumber ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600">Rs. {part.defaultPrice.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function NewSparePartForm({ onCreated }: { onCreated: () => void }) {
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [defaultPrice, setDefaultPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await sparePartService.create({
        name,
        brand: brand || undefined,
        partNumber: partNumber || undefined,
        defaultPrice,
      });
      setName("");
      setBrand("");
      setPartNumber("");
      setDefaultPrice(0);
      onCreated();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not add spare part.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Name</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Default Price (Rs.)</label>
        <input
          type="number"
          min={0}
          step="0.01"
          value={defaultPrice}
          onChange={(e) => setDefaultPrice(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Brand (optional)</label>
        <input
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Part Number (optional)</label>
        <input
          value={partNumber}
          onChange={(e) => setPartNumber(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {error && <p className="col-span-full text-sm text-red-600">{error}</p>}

      <div className="col-span-full">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Saving..." : "Save part"}
        </button>
      </div>
    </form>
  );
}
