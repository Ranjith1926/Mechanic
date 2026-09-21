"use client";

import { RevenuePoint } from "@/services/dashboardService";

export function RevenueChart({ series }: { series: RevenuePoint[] }) {
  if (series.length === 0) {
    return <p className="py-8 text-center text-sm text-gray-500">No revenue in this period yet.</p>;
  }

  const max = Math.max(...series.map((p) => p.total), 1);

  return (
    <div className="flex h-48 items-end gap-1.5 overflow-x-auto pb-1">
      {series.map((point) => {
        const heightPct = Math.max((point.total / max) * 100, 2);
        const date = new Date(point.date);
        return (
          <div key={point.date} className="flex min-w-[28px] flex-1 flex-col items-center justify-end gap-1">
            <div
              title={`${date.toLocaleDateString()}: Rs. ${point.total.toLocaleString()}`}
              style={{ height: `${heightPct}%` }}
              className="w-full min-h-[4px] rounded-t bg-blue-500"
            />
            <span className="text-[10px] text-gray-400">{date.getDate()}</span>
          </div>
        );
      })}
    </div>
  );
}
