import { fetchAPI } from "@/utils/api";
import { Drop } from "@/types";

export const dropService = {
  getAllPublic: async (): Promise<Drop[]> => {
    return await fetchAPI<Drop[]>("/drops");
  },

  getById: async (id: number): Promise<Drop> => {
    return await fetchAPI<Drop>(`/drops/${id}`);
  },

  getMyStatus: async (dropId: number): Promise<{ score: number | null; claim_code: string | null }> => {
    return await fetchAPI<{ score: number | null; claim_code: string | null }>(`/drops/${dropId}/status`);
  },

  // Join waitlist
  joinWaitlist: async (dropId: string | number): Promise<{ message: string; score: number }> => {
    return await fetchAPI<{ message: string; score: number }>(`/drops/${dropId}/join`, {
      method: "POST",
    });
  },

  // Leave waitlist
  leaveWaitlist: async (dropId: number): Promise<{ message: string }> => {
    return await fetchAPI<{ message: string }>(`/drops/${dropId}/leave`, {
      method: "POST",
    });
  },

  // Claim drop
  claim: async (dropId: string | number): Promise<{ message: string; claim_code: string }> => {
    return await fetchAPI<{ message: string; claim_code: string }>(`/drops/${dropId}/claim`, {
      method: "POST",
    });
  },

  // Admin: Get all drops
  adminGetAll: async (): Promise<Drop[]> => {
    return await fetchAPI<Drop[]>("/admin/drops");
  },

  // Admin: Create drop
  create: async (data: Partial<Drop>): Promise<Drop> => {
    return await fetchAPI<Drop>("/admin/drops", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  // Admin: Update drop
  update: async (id: number, data: Partial<Drop>): Promise<Drop> => {
    return await fetchAPI<Drop>(`/admin/drops/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  // Admin: Delete drop
  delete: async (id: number): Promise<void> => {
    await fetchAPI(`/admin/drops/${id}`, { method: "DELETE" });
  },
};
