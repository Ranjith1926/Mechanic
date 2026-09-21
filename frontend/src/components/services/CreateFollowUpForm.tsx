"use client";

import { FormEvent, useState } from "react";
import { AxiosError } from "axios";
import { followUpService } from "@/services/followUpService";
import { FollowUp, FollowUpType } from "@/types/domain";

const TYPES: FollowUpType[] = ["GeneralService", "EngineOil", "BrakeCheck", "TyreCheck", "Custom"];

const TYPE_LABELS: Record<FollowUpType, string> = {
  GeneralService: "General Service",
  EngineOil: "Engine Oil",
  BrakeCheck: "Brake Check",
  TyreCheck: "Tyre Check",
  Custom: "Custom",
};

export function CreateFollowUpForm({ serviceId }: { serviceId: number }) {
  const [followUp, setFollowUp] = useState<FollowUp | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [followUpDate, setFollowUpDate] = useState("");
  const [followUpType, setFollowUpType] = useState<FollowUpType>("GeneralService");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!followUpDate) {
      setError("Choose a follow-up date.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const created = await followUpService.create({
        serviceId,
        followUpDate,
        followUpType,
        notes: notes || undefined,
      });
      setFollowUp(created);
      setIsFormOpen(false);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not create follow-up.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Follow-up</h2>
        {!followUp && (
          <button
            onClick={() => setIsFormOpen((open) => !open)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {isFormOpen ? "Cancel" : "Create Follow-up"}
          </button>
        )}
      </div>

      {followUp ? (
        <div className="mt-3 rounded-lg border border-gray-200 bg-white p-3 text-sm">
          <p className="font-medium text-gray-900">{TYPE_LABELS[followUp.followUpType]}</p>
          <p className="text-gray-500">Due: {new Date(followUp.followUpDate).toLocaleDateString()}</p>
          {followUp.notes && <p className="mt-1 text-gray-600">{followUp.notes}</p>}
        </div>
      ) : isFormOpen ? (
        <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
            <input
              type="date"
              required
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Type</label>
            <select
              value={followUpType}
              onChange={(e) => setFollowUpType(e.target.value as FollowUpType)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            >
              {TYPES.map((type) => (
                <option key={type} value={type}>
                  {TYPE_LABELS[type]}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-full">
            <label className="block text-sm font-medium text-gray-700">Notes</label>
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
              {isSubmitting ? "Saving..." : "Save follow-up"}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-2 text-sm text-gray-500">No follow-up scheduled for this service.</p>
      )}
    </div>
  );
}
