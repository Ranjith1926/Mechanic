import { apiClient } from "./apiClient";
import { AppNotification } from "../types/domain";

export const notificationService = {
  async list(): Promise<AppNotification[]> {
    const { data } = await apiClient.get<AppNotification[]>("/api/notifications");
    return data;
  },

  async markRead(id: number): Promise<void> {
    await apiClient.post(`/api/notifications/${id}/read`, {});
  },

  async notifyServiceCompleted(serviceId: number): Promise<void> {
    await apiClient.post(`/api/services/${serviceId}/notify`, {});
  },

  async notifyInvoiceCreated(invoiceId: number): Promise<void> {
    await apiClient.post(`/api/invoices/${invoiceId}/notify`, {});
  },
};
