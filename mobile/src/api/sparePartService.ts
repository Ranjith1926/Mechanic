import { apiClient } from "./apiClient";
import { Service, SparePart, SparePartAction } from "../types/domain";

export interface CreateSparePartPayload {
  name: string;
  brand?: string;
  partNumber?: string;
  defaultPrice: number;
  description?: string;
}

export interface AddServicePartPayload {
  sparePartId: number;
  quantity: number;
  unitPrice?: number;
  action: SparePartAction;
  oldPartDescription?: string;
  newPartDescription?: string;
  notes?: string;
}

export const sparePartService = {
  async list(q?: string): Promise<SparePart[]> {
    const { data } = await apiClient.get<SparePart[]>("/api/spare-parts", { params: { q } });
    return data;
  },

  async create(payload: CreateSparePartPayload): Promise<SparePart> {
    const { data } = await apiClient.post<SparePart>("/api/spare-parts", payload);
    return data;
  },

  async addToService(serviceId: number, payload: AddServicePartPayload): Promise<Service> {
    const { data } = await apiClient.post<Service>(`/api/services/${serviceId}/parts`, payload);
    return data;
  },

  async removeFromService(serviceId: number, servicePartId: number): Promise<Service> {
    const { data } = await apiClient.delete<Service>(`/api/services/${serviceId}/parts/${servicePartId}`);
    return data;
  },
};
