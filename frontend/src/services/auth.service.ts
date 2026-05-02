import { api } from "./api";
import { AuthResponse, User } from "../types";

export const authService = {
  async login(email: string, password: string) {
    const { data } = await api.post<{ success: boolean; data: AuthResponse }>("/auth/login", {
      email,
      password
    });

    return data.data;
  },

  async register(payload: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
  }) {
    const { data } = await api.post("/auth/register", payload);
    return data;
  },

  async me() {
    const { data } = await api.get<{ success: boolean; data: User }>("/auth/me");
    return data.data;
  }
};