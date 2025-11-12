// frontend/src/services/aiService.ts
import { fetchAPI } from "@/utils/api";

export const aiService = {
  generateDescription: async (name: string): Promise<{ description: string }> => {
    return await fetchAPI<{ description: string }>("/admin/ai/generate-desc", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },
};
