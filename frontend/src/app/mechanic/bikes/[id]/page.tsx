"use client";

import { FormEvent, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AxiosError } from "axios";
import { BikeHistoryView } from "@/components/bikes/BikeHistoryView";
import { serviceService } from "@/services/serviceService";

export default function MechanicBikeDetailPage() {
  const params = useParams<{ id: string }>();
  const bikeId = Number(params.id);
  const router = useRouter();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [odometer, setOdometer] = useState(0);
  const [complaint, setComplaint] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const service = await serviceService.create({ bikeId, odometer, complaint: complaint || undefined, labourAmount: 0 });
      router.push(`/mechanic/services/${service.id}`);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not start service.");
      setIsSubmitting(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Bike Details</h1>
        <button
          onClick={() => setIsFormOpen((open) => !open)}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          {isFormOpen ? "Cancel" : "Start New Service"}
        </button>
      </div>

      {isFormOpen && (
        <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Odometer (km)</label>
            <input
              type="number"
              min={0}
              required
              value={odometer}
              onChange={(e) => setOdometer(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Customer Complaint</label>
            <input
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
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
              {isSubmitting ? "Starting..." : "Start service"}
            </button>
          </div>
        </form>
      )}

      <div className="mt-6">
        <BikeHistoryView bikeId={bikeId} />
      </div>
    </div>
  );
}
