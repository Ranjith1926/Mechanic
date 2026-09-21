"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { serviceService } from "@/services/serviceService";
import { Service, ServiceStatus } from "@/types/domain";

const STATUS_TABS: { label: string; value?: ServiceStatus }[] = [
  { label: "All" },
  { label: "New", value: "New" },
  { label: "In Progress", value: "InProgress" },
  { label: "Completed", value: "Completed" },
];

const STATUS_STYLES: Record<ServiceStatus, string> = {
  New: "bg-amber-50 text-amber-700",
  InProgress: "bg-blue-50 text-blue-700",
  Completed: "bg-green-50 text-green-700",
};

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [activeTab, setActiveTab] = useState<ServiceStatus | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    serviceService
      .list(activeTab)
      .then(setServices)
      .finally(() => setIsLoading(false));
  }, [activeTab]);

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Services</h1>

      <div className="mt-4 flex gap-2">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.value)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              activeTab === tab.value ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-300 hover:bg-gray-50"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <p className="p-4 text-sm text-gray-500">Loading...</p>
        ) : services.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No services found. Start one from a bike's page.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Bike</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Labour</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map((service) => (
                <tr key={service.id}>
                  <td className="px-4 py-2 text-gray-600">{new Date(service.serviceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 font-medium text-gray-900">{service.clientName}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {service.bikeLabel} ({service.bikeRegistrationNumber})
                  </td>
                  <td className="px-4 py-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${STATUS_STYLES[service.status]}`}>
                      {service.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-gray-600">Rs. {service.labourAmount.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/mechanic/services/${service.id}`} className="text-blue-600 hover:underline">
                      Open
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
