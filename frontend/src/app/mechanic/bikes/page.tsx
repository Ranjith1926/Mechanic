"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { bikeService } from "@/services/bikeService";
import { Bike } from "@/types/domain";

export default function BikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadBikes(q?: string) {
    setIsLoading(true);
    try {
      const data = await bikeService.list({ q });
      setBikes(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadBikes();
  }, []);

  async function handleSearch(event: FormEvent) {
    event.preventDefault();
    await loadBikes(searchTerm.trim() || undefined);
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Bikes</h1>

      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by registration, brand, or model"
          className="w-full max-w-md rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Search
        </button>
      </form>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : bikes.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No bikes found.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Registration</th>
                <th className="px-4 py-2">Bike</th>
                <th className="px-4 py-2">Owner</th>
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
                  <td className="px-4 py-2 text-gray-600">{bike.clientName}</td>
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
