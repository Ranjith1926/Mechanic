"use client";

import { FormEvent, useEffect, useState } from "react";
import { AxiosError } from "axios";
import { sparePartService } from "@/services/sparePartService";
import { Service, ServicePart, SparePart, SparePartAction } from "@/types/domain";

const ACTIONS: SparePartAction[] = ["Inspected", "Reused", "Replaced", "Added", "Removed"];

export function ServicePartsSection({ service, onChange }: { service: Service; onChange: (updated: Service) => void }) {
  const [catalog, setCatalog] = useState<SparePart[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    sparePartService.list().then(setCatalog);
  }, []);

  async function handleRemove(part: ServicePart) {
    setRemovingId(part.id);
    try {
      const updated = await sparePartService.removeFromService(service.id, part.id);
      onChange(updated);
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Spare Parts</h2>
        <button
          onClick={() => setIsFormOpen((open) => !open)}
          className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          {isFormOpen ? "Cancel" : "Add Part"}
        </button>
      </div>

      {isFormOpen && (
        <AddPartForm
          serviceId={service.id}
          catalog={catalog}
          onAdded={(updated) => {
            setIsFormOpen(false);
            onChange(updated);
          }}
        />
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {service.parts.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No parts recorded for this service yet.</p>
      ) : (
        <ul className="mt-3 space-y-2">
          {service.parts.map((part) => (
            <li key={part.id} className="rounded-lg border border-gray-200 bg-white p-3 text-sm">
              <div className="flex items-center justify-between">
                <p className="font-medium text-gray-900">
                  {part.sparePartName} — {part.action}
                </p>
                <div className="flex items-center gap-3">
                  <span className="text-gray-500">
                    {part.quantity} × Rs. {part.unitPrice.toLocaleString()} = Rs. {part.totalPrice.toLocaleString()}
                  </span>
                  <button
                    onClick={() => handleRemove(part)}
                    disabled={removingId === part.id}
                    className="text-red-600 hover:underline disabled:opacity-60"
                  >
                    Remove
                  </button>
                </div>
              </div>
              {part.action === "Replaced" && (part.oldPartDescription || part.newPartDescription) && (
                <p className="mt-1 text-gray-500">
                  {part.oldPartDescription ?? "—"} → {part.newPartDescription ?? "—"}
                </p>
              )}
              {part.notes && <p className="mt-1 text-gray-500">{part.notes}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AddPartForm({
  serviceId,
  catalog,
  onAdded,
}: {
  serviceId: number;
  catalog: SparePart[];
  onAdded: (updated: Service) => void;
}) {
  const [sparePartId, setSparePartId] = useState<number | "">("");
  const [quantity, setQuantity] = useState(1);
  const [unitPrice, setUnitPrice] = useState<number | "">("");
  const [action, setAction] = useState<SparePartAction>("Replaced");
  const [oldPartDescription, setOldPartDescription] = useState("");
  const [newPartDescription, setNewPartDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!sparePartId) {
      setError("Choose a spare part.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const updated = await sparePartService.addToService(serviceId, {
        sparePartId,
        quantity,
        unitPrice: unitPrice === "" ? undefined : unitPrice,
        action,
        oldPartDescription: action === "Replaced" ? oldPartDescription || undefined : undefined,
        newPartDescription: action === "Replaced" ? newPartDescription || undefined : undefined,
      });
      onAdded(updated);
    } catch (err) {
      const axiosError = err as AxiosError<{ message?: string }>;
      setError(axiosError.response?.data?.message ?? "Could not add part.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 grid grid-cols-1 gap-3 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2">
      <div>
        <label className="block text-sm font-medium text-gray-700">Spare Part</label>
        <select
          required
          value={sparePartId}
          onChange={(e) => setSparePartId(e.target.value ? Number(e.target.value) : "")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          <option value="">Select a part</option>
          {catalog.map((part) => (
            <option key={part.id} value={part.id}>
              {part.name} {part.brand ? `(${part.brand})` : ""}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Action</label>
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as SparePartAction)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        >
          {ACTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Quantity</label>
        <input
          type="number"
          min={1}
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Unit Price (Rs., optional)</label>
        <input
          type="number"
          min={0}
          step="0.01"
          placeholder="Uses catalog default price"
          value={unitPrice}
          onChange={(e) => setUnitPrice(e.target.value ? Number(e.target.value) : "")}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
        />
      </div>

      {action === "Replaced" && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700">Old Part Description</label>
            <input
              value={oldPartDescription}
              onChange={(e) => setOldPartDescription(e.target.value)}
              placeholder="e.g. Worn brake pad"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Part Description</label>
            <input
              value={newPartDescription}
              onChange={(e) => setNewPartDescription(e.target.value)}
              placeholder="e.g. Honda OEM brake pad"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>
        </>
      )}

      {error && <p className="col-span-full text-sm text-red-600">{error}</p>}

      <div className="col-span-full">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-60"
        >
          {isSubmitting ? "Adding..." : "Add part"}
        </button>
      </div>
    </form>
  );
}
