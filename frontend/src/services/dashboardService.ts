import { apiClient } from "@/services/apiClient";

export interface RevenueSummary {
  totalBilled: number;
  labourRevenue: number;
  sparePartsRevenue: number;
  servicesCount: number;
  invoicesCount: number;
  averageInvoice: number;
}

export interface RecentServiceItem {
  serviceId: number;
  clientName: string;
  bikeLabel: string;
  bikeRegistrationNumber: string;
  serviceDate: string;
  status: string;
  invoiceNumber?: string | null;
  totalAmount?: number | null;
}

export interface MechanicDashboard {
  today: RevenueSummary;
  month: RevenueSummary;
  followUpsToday: number;
  followUpsTomorrow: number;
  followUpsUpcoming: number;
  recentServices: RecentServiceItem[];
}

export interface RevenuePoint {
  date: string;
  total: number;
}

export interface RevenueRange {
  from: string;
  to: string;
  totalBilled: number;
  labourRevenue: number;
  sparePartsRevenue: number;
  servicesCount: number;
  invoicesCount: number;
  averageInvoice: number;
  series: RevenuePoint[];
}

export type RevenueRangeFilter = "today" | "yesterday" | "thisWeek" | "thisMonth" | "lastMonth" | "custom";

export const dashboardService = {
  async getMechanicDashboard(): Promise<MechanicDashboard> {
    const { data } = await apiClient.get<MechanicDashboard>("/api/dashboard/mechanic");
    return data;
  },

  async getRevenue(range: RevenueRangeFilter, from?: string, to?: string): Promise<RevenueRange> {
    const { data } = await apiClient.get<RevenueRange>("/api/dashboard/revenue", {
      params: { range, from, to },
    });
    return data;
  },
};
