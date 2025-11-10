import { fetchAPI } from "@/utils/api";
import { AuthResponse, User } from "@/types";

export const authService = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    return await fetchAPI<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  signup: async (email: string, password: string): Promise<AuthResponse> => {
    return await fetchAPI<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },
};
