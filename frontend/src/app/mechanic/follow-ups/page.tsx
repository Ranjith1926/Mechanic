"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { followUpService } from "@/services/followUpService";
import { FollowUp } from "@/types/domain";

const TABS = ["Today", "Upcoming", "All"] as const;
type Tab = (typeof TABS)[number];

const TYPE_LABELS: Record<string, string> = {
  GeneralService: "General Service",
  EngineOil: "Engine Oil",
  BrakeCheck: "Brake Check",
  TyreCheck: "Tyre Check",
  Custom: "Custom",
};

export default function FollowUpsPage() {
  const [tab, setTab] = useState<Tab>("Today");
  const [followUps, setFollowUps] = useState<FollowUp[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notifyingId, setNotifyingId] = useState<number | null>(null);

  async function load(activeTab: Tab) {
    setIsLoading(true);
    try {
      const data =
        activeTab === "Today"
          ? await followUpService.today()
          : activeTab === "Upcoming"
            ? await followUpService.upcoming()
            : await followUpService.list();
      setFollowUps(data);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    load(tab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function handleNotify(id: number) {
    setNotifyingId(id);
    try {
      await followUpService.notify(id);
      setFollowUps((prev) => prev.map((f) => (f.id === id ? { ...f, notificationSent: true } : f)));
    } finally {
      setNotifyingId(null);
    }
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Follow-ups</h1>

      <div className="mt-4 flex gap-2">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              tab === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {isLoading ? (
          <p className="text-sm text-gray-500">Loading...</p>
        ) : followUps.length === 0 ? (
          <p className="text-sm text-gray-500">No follow-ups {tab === "Today" ? "due today" : tab === "Upcoming" ? "upcoming" : "yet"}.</p>
        ) : (
          followUps.map((followUp) => (
            <div key={followUp.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{followUp.clientName}</p>
                  <p className="text-sm text-gray-500">
                    {followUp.bikeLabel} ({followUp.bikeRegistrationNumber})
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{new Date(followUp.followUpDate).toLocaleDateString()}</p>
                  <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                    {TYPE_LABELS[followUp.followUpType] ?? followUp.followUpType}
                  </span>
                </div>
              </div>

              {followUp.notes && <p className="mt-2 text-sm text-gray-600">{followUp.notes}</p>}

              <div className="mt-3 flex flex-wrap gap-2 text-sm">
                <a
                  href={`tel:${followUp.clientPhone}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  Call Client
                </a>
                <Link
                  href={`/mechanic/bikes/${followUp.bikeId}`}
                  className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                >
                  View History
                </Link>
                {followUp.invoiceId && (
                  <Link
                    href={`/mechanic/invoices/${followUp.invoiceId}`}
                    className="rounded-md border border-gray-300 px-3 py-1.5 font-medium text-gray-700 hover:bg-gray-50"
                  >
                    View Invoice
                  </Link>
                )}
                <button
                  onClick={() => handleNotify(followUp.id)}
                  disabled={notifyingId === followUp.id || followUp.notificationSent}
                  className="rounded-md bg-blue-600 px-3 py-1.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
                >
                  {followUp.notificationSent ? "Reminder Sent" : notifyingId === followUp.id ? "Sending..." : "Send Reminder"}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
