import { apiClient } from "./apiClient";
import { FollowUp, FollowUpStatus, FollowUpType } from "../types/domain";

export interface CreateFollowUpPayload {
  serviceId: number;
  followUpDate: string;
  followUpType: FollowUpType;
  notes?: string;
}

export const followUpService = {
  async list(status?: FollowUpStatus): Promise<FollowUp[]> {
    const { data } = await apiClient.get<FollowUp[]>("/api/follow-ups", { params: { status } });
    return data;
  },

  async today(): Promise<FollowUp[]> {
    const { data } = await apiClient.get<FollowUp[]>("/api/follow-ups/today");
    return data;
  },

  async upcoming(): Promise<FollowUp[]> {
    const { data } = await apiClient.get<FollowUp[]>("/api/follow-ups/upcoming");
    return data;
  },

  async create(payload: CreateFollowUpPayload): Promise<FollowUp> {
    const { data } = await apiClient.post<FollowUp>("/api/follow-ups", payload);
    return data;
  },

  async notify(id: number): Promise<void> {
    await apiClient.post(`/api/follow-ups/${id}/notify`, {});
  },
};
