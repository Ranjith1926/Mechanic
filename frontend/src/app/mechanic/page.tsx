"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { dashboardService, MechanicDashboard, RevenueRange, RevenueRangeFilter } from "@/services/dashboardService";
import { StatTile } from "@/components/dashboard/StatTile";
import { RevenueChart } from "@/components/dashboard/RevenueChart";

const RANGE_OPTIONS: { label: string; value: RevenueRangeFilter }[] = [
  { label: "Today", value: "today" },
  { label: "Yesterday", value: "yesterday" },
  { label: "This Week", value: "thisWeek" },
  { label: "This Month", value: "thisMonth" },
  { label: "Last Month", value: "lastMonth" },
];

export default function MechanicDashboardPage() {
  const { user } = useAuth();
  const [dashboard, setDashboard] = useState<MechanicDashboard | null>(null);
  const [revenue, setRevenue] = useState<RevenueRange | null>(null);
  const [range, setRange] = useState<RevenueRangeFilter>("thisMonth");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    dashboardService.getMechanicDashboard().then((data) => {
      setDashboard(data);
      setIsLoading(false);
    });
  }, []);

  useEffect(() => {
    dashboardService.getRevenue(range).then(setRevenue);
  }, [range]);

  if (isLoading || !dashboard) {
    return <p className="text-sm text-gray-500">Loading...</p>;
  }

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Welcome back, {user?.name}</h1>

      <h2 className="mt-6 text-sm font-semibold uppercase text-gray-500">Today</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="Services" value={dashboard.today.servicesCount.toString()} />
        <StatTile label="Invoices" value={dashboard.today.invoicesCount.toString()} />
        <StatTile label="Revenue" value={`Rs. ${dashboard.today.totalBilled.toLocaleString()}`} />
        <StatTile label="Labour" value={`Rs. ${dashboard.today.labourRevenue.toLocaleString()}`} />
        <StatTile label="Spares" value={`Rs. ${dashboard.today.sparePartsRevenue.toLocaleString()}`} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-gray-500">This Month</h2>
      <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-5">
        <StatTile label="Services" value={dashboard.month.servicesCount.toString()} />
        <StatTile label="Invoices" value={dashboard.month.invoicesCount.toString()} />
        <StatTile label="Revenue" value={`Rs. ${dashboard.month.totalBilled.toLocaleString()}`} />
        <StatTile label="Labour" value={`Rs. ${dashboard.month.labourRevenue.toLocaleString()}`} />
        <StatTile label="Spares" value={`Rs. ${dashboard.month.sparePartsRevenue.toLocaleString()}`} />
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-gray-500">Follow-ups</h2>
      <div className="mt-2 grid grid-cols-3 gap-3">
        <Link href="/mechanic/follow-ups">
          <StatTile label="Due Today" value={dashboard.followUpsToday.toString()} />
        </Link>
        <Link href="/mechanic/follow-ups">
          <StatTile label="Due Tomorrow" value={dashboard.followUpsTomorrow.toString()} />
        </Link>
        <Link href="/mechanic/follow-ups">
          <StatTile label="Upcoming" value={dashboard.followUpsUpcoming.toString()} />
        </Link>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase text-gray-500">Revenue</h2>
        <div className="flex gap-1.5">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium ${
                range === option.value ? "bg-blue-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-2 rounded-lg border border-gray-200 bg-white p-4">
        {revenue ? (
          <>
            <RevenueChart series={revenue.series} />
            <div className="mt-3 grid grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-sm sm:grid-cols-6">
              <div>
                <p className="text-xs text-gray-500">Total Billed</p>
                <p className="font-medium text-gray-900">Rs. {revenue.totalBilled.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Labour</p>
                <p className="font-medium text-gray-900">Rs. {revenue.labourRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Spare Parts</p>
                <p className="font-medium text-gray-900">Rs. {revenue.sparePartsRevenue.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Services</p>
                <p className="font-medium text-gray-900">{revenue.servicesCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Invoices</p>
                <p className="font-medium text-gray-900">{revenue.invoicesCount}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Average Invoice</p>
                <p className="font-medium text-gray-900">Rs. {revenue.averageInvoice.toLocaleString()}</p>
              </div>
            </div>
          </>
        ) : (
          <p className="text-sm text-gray-500">Loading...</p>
        )}
      </div>

      <h2 className="mt-6 text-sm font-semibold uppercase text-gray-500">Recent Services</h2>
      <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 bg-white">
        {dashboard.recentServices.length === 0 ? (
          <p className="p-4 text-sm text-gray-500">No services yet.</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-2">Customer</th>
                <th className="px-4 py-2">Bike</th>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Invoice</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dashboard.recentServices.map((service) => (
                <tr key={service.serviceId}>
                  <td className="px-4 py-2 font-medium text-gray-900">{service.clientName}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {service.bikeLabel} ({service.bikeRegistrationNumber})
                  </td>
                  <td className="px-4 py-2 text-gray-600">{new Date(service.serviceDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 text-gray-600">{service.invoiceNumber ?? "—"}</td>
                  <td className="px-4 py-2 text-gray-600">
                    {service.totalAmount ? `Rs. ${service.totalAmount.toLocaleString()}` : "—"}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Link href={`/mechanic/services/${service.serviceId}`} className="text-blue-600 hover:underline">
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
