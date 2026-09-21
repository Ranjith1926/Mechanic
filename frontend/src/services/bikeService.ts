import { apiClient } from "@/services/apiClient";
import { Bike, BikeHistoryItem } from "@/types/domain";

export interface CreateBikePayload {
  clientId: number;
  registrationNumber: string;
  brand: string;
  model: string;
  variant?: string;
  manufacturingYear?: number;
  colour?: string;
  currentOdometer: number;
  notes?: string;
}

export const bikeService = {
  async list(params?: { clientId?: number; q?: string }): Promise<Bike[]> {
    const { data } = await apiClient.get<Bike[]>("/api/bikes", { params });
    return data;
  },

  async getById(id: number): Promise<Bike> {
    const { data } = await apiClient.get<Bike>(`/api/bikes/${id}`);
    return data;
  },

  async getHistory(id: number): Promise<BikeHistoryItem[]> {
    const { data } = await apiClient.get<BikeHistoryItem[]>(`/api/bikes/${id}/history`);
    return data;
  },

  async create(payload: CreateBikePayload): Promise<Bike> {
    const { data } = await apiClient.post<Bike>("/api/bikes", payload);
    return data;
  },
};
