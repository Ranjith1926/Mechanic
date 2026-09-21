import { apiClient } from "@/services/apiClient";
import { Invoice } from "@/types/domain";

export interface CreateInvoicePayload {
  serviceId: number;
  discount?: number;
  tax?: number;
  notes?: string;
}

export const invoiceService = {
  async list(params?: { from?: string; to?: string }): Promise<Invoice[]> {
    const { data } = await apiClient.get<Invoice[]>("/api/invoices", { params });
    return data;
  },

  async getById(id: number): Promise<Invoice> {
    const { data } = await apiClient.get<Invoice>(`/api/invoices/${id}`);
    return data;
  },

  async create(payload: CreateInvoicePayload): Promise<Invoice> {
    const { data } = await apiClient.post<Invoice>("/api/invoices", payload);
    return data;
  },

  async void(id: number): Promise<Invoice> {
    const { data } = await apiClient.post<Invoice>(`/api/invoices/${id}/void`, {});
    return data;
  },

  async getPdfBlob(id: number): Promise<Blob> {
    const { data } = await apiClient.get(`/api/invoices/${id}/pdf`, { responseType: "blob" });
    return data;
  },
};
