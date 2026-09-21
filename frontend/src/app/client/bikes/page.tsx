"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bikeService } from "@/services/bikeService";
import { Bike } from "@/types/domain";

export default function MyBikesPage() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bikeService
      .list()
      .then(setBikes)
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">My Bikes</h1>

      {isLoading ? (
        <p className="mt-4 text-sm text-gray-500">Loading...</p>
      ) : bikes.length === 0 ? (
        <p className="mt-4 text-sm text-gray-500">No bikes registered yet. Visit the workshop to add one.</p>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {bikes.map((bike) => (
            <Link
              key={bike.id}
              href={`/client/bikes/${bike.id}`}
              className="rounded-lg border border-gray-200 bg-white p-4 hover:border-blue-300"
            >
              <p className="font-medium text-gray-900">
                {bike.brand} {bike.model}
              </p>
              <p className="mt-1 text-sm text-gray-500">Registration: {bike.registrationNumber}</p>
              <p className="mt-1 text-sm text-gray-500">Odometer: {bike.currentOdometer.toLocaleString()} km</p>
              <p className="mt-1 text-sm text-gray-500">
                Last Service: {bike.lastServiceDate ? new Date(bike.lastServiceDate).toLocaleDateString() : "—"}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
