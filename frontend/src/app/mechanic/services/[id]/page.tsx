"use client";

import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AxiosError } from "axios";
import { serviceService } from "@/services/serviceService";
import { Service, ServiceStatus } from "@/types/domain";
import { ServicePartsSection } from "@/components/services/ServicePartsSection";

const STATUS_OPTIONS: ServiceStatus[] = ["New", "InProgress", "Completed"];

export default function ServiceDetailPage() {
  const params = useParams<{ id: string }>();
  const serviceId = Number(params.id);

  const [service, setService] = useState<Service | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [odometer, setOdometer] = useState(0);
  const [complaint, setComplaint] = useState("");
  const [inspectionNotes, setInspectionNotes] = useState("");
  const [workPerformed, setWorkPerformed] = useState("");
  const [labourAmount, setLabourAmount] = useState(0);
  const [status, setStatus] = useState<ServiceStatus>("New");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    serviceService
      .getById(serviceId)
      .then((data) => {
        setService(data);
        setOdometer(data.odometer);
        setComplaint(data.complaint ?? "");
        setInspectionNotes(data.inspectionNotes ?? "");
        setWorkPerformed(data.workPerformed ?? "");
        setLabourAmount(data.labourAmount);
        setStatus(data.status);
        setNotes(data.notes ?? "");
      })
      .catch(() => setError("Could not load this service."))
      .finally(() => setIsLoading(false));
  }, [serviceId]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSaving(true);

    try {
      const updated = await serviceService.update(serviceId, {
        odometer,
        complaint: complaint || undefined,
        inspectionNotes: inspectionNotes || undefined,
        workPerformed: workPerformed || undefined,
        labourAmount,
        status,
        notes: notes || undefined,
      });
      setService(updated);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not save changes.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  if (!service) {
    return <p className="text-sm text-red-600">{error ?? "Service not found."}</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">
            {service.clientName} — {service.bikeLabel}
          </h1>
          <p className="text-sm text-gray-500">{service.bikeRegistrationNumber}</p>
        </div>
        <Link href={`/mechanic/bikes/${service.bikeId}`} className="text-sm text-blue-600 hover:underline">
          View bike history
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Odometer (km)</label>
          <input
            type="number"
            min={0}
            value={odometer}
            onChange={(e) => setOdometer(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as ServiceStatus)}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">Customer Complaint</label>
          <textarea
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">Inspection Notes</label>
          <textarea
            value={inspectionNotes}
            onChange={(e) => setInspectionNotes(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">Work Performed</label>
          <textarea
            value={workPerformed}
            onChange={(e) => setWorkPerformed(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Labour Amount (Rs.)</label>
          <input
            type="number"
            min={0}
            step="0.01"
            value={labourAmount}
            onChange={(e) => setLabourAmount(Number(e.target.value))}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="col-span-full">
          <label className="block text-sm font-medium text-gray-700">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>

        {error && <p className="col-span-full text-sm text-red-600">{error}</p>}

        <div className="col-span-full">
          <button
            type="submit"
            disabled={isSaving}
            className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <ServicePartsSection service={service} onChange={setService} />
    </div>
  );
}
