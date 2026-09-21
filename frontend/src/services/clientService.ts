import { apiClient } from "@/services/apiClient";
import { Client } from "@/types/domain";

export interface CreateClientPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
  notes?: string;
}

export const clientService = {
  async list(): Promise<Client[]> {
    const { data } = await apiClient.get<Client[]>("/api/clients");
    return data;
  },

  async search(query: string): Promise<Client[]> {
    const { data } = await apiClient.get<Client[]>("/api/clients/search", { params: { q: query } });
    return data;
  },

  async create(payload: CreateClientPayload): Promise<Client> {
    const { data } = await apiClient.post<Client>("/api/clients", payload);
    return data;
  },
};
