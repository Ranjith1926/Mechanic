import { apiClient } from "./apiClient";
import { Service, ServiceStatus } from "../types/domain";

export interface CreateServicePayload {
  bikeId: number;
  odometer: number;
  complaint?: string;
  inspectionNotes?: string;
  workPerformed?: string;
  labourAmount: number;
  notes?: string;
}

export interface UpdateServicePayload {
  odometer: number;
  complaint?: string;
  inspectionNotes?: string;
  workPerformed?: string;
  labourAmount: number;
  status: ServiceStatus;
  notes?: string;
}

export const serviceService = {
  async list(status?: ServiceStatus): Promise<Service[]> {
    const { data } = await apiClient.get<Service[]>("/api/services", { params: { status } });
    return data;
  },

  async getById(id: number): Promise<Service> {
    const { data } = await apiClient.get<Service>(`/api/services/${id}`);
    return data;
  },

  async listByBike(bikeId: number): Promise<Service[]> {
    const { data } = await apiClient.get<Service[]>(`/api/bikes/${bikeId}/services`);
    return data;
  },

  async create(payload: CreateServicePayload): Promise<Service> {
    const { data } = await apiClient.post<Service>("/api/services", payload);
    return data;
  },

  async update(id: number, payload: UpdateServicePayload): Promise<Service> {
    const { data } = await apiClient.put<Service>(`/api/services/${id}`, payload);
    return data;
  },

  async complete(id: number): Promise<Service> {
    const { data } = await apiClient.post<Service>(`/api/services/${id}/complete`, {});
    return data;
  },
};
