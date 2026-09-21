"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { bikeService } from "@/services/bikeService";
import { Bike } from "@/types/domain";

export default function CustomerDetailPage() {
  const params = useParams<{ id: string }>();
  const clientId = Number(params.id);

  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);

  async function loadBikes() {
    setIsLoading(true);
    try {
      const data = await bikeService.list({ clientId });
      setBikes(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBikes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Customer Bikes</h1>
        <button
          onClick={() => setIsFormOpen((open) => !open)}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isFormOpen ? "Cancel" : "Add Bike"}
        </button>
      </div>

      {isFormOpen && (
        <NewBikeForm
          clientId={clientId}
          onCreated={() => {
            setIsFormOpen(false);
            loadBikes();
          }}
        />
      )}

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : bikes.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No bikes registered for this customer yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Registration</th>
                <th className="px-4 py-2">Bike</th>
                <th className="px-4 py-2">Odometer</th>
                <th className="px-4 py-2">Last Service</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {bikes.map((bike) => (
                <tr key={bike.id}>
                  <td className="px-4 py-2 font-medium text-gray-900">{bike.registrationNumber}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {bike.brand} {bike.model}
                  </td>
                  <td className="px-4 py-2 text-gray-600">{bike.currentOdometer.toLocaleString()} km</td>
                  <td className="px-4 py-2 text-gray-600">
                    {bike.lastServiceDate ? new Date(bike.lastServiceDate).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/mechanic/bikes/${bike.id}`} className="text-blue-600 hover:underline">
                      View History
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

function NewBikeForm({ clientId, onCreated }: { clientId: number; onCreated: () => void }) {
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [currentOdometer, setCurrentOdometer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await bikeService.create({ clientId, registrationNumber, brand, model, currentOdometer });
      setRegistrationNumber("");
      setBrand("");
      setModel("");
      setCurrentOdometer(0);
      onCreated();
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not add bike.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Registration Number</label>
        <input
          required
          value={registrationNumber}
          onChange={(e) => setRegistrationNumber(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Odometer (km)</label>
        <input
          type="number"
          min={0}
          value={currentOdometer}
          onChange={(e) => setCurrentOdometer(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Brand</label>
        <input
          required
          value={brand}
          onChange={(e) => setBrand(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Model</label>
        <input
          required
          value={model}
          onChange={(e) => setModel(e.target.value)}
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
          {isSubmitting ? "Saving..." : "Save bike"}
        </button>
      </div>
    </form>
  );
}
