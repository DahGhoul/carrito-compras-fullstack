import { create } from "zustand";
import { AuthResponse, User } from "../types";

type AuthState = {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (payload: AuthResponse) => void;
  logout: () => void;
};

const initialState = (() => {
  const raw = localStorage.getItem("auth_state");
  if (!raw) {
    return {
      user: null,
      accessToken: null,
      refreshToken: null
    };
  }

  try {
    const parsed = JSON.parse(raw) as {
      user: User | null;
      accessToken: string | null;
      refreshToken: string | null;
    };
    return parsed;
  } catch {
    return {
      user: null,
      accessToken: null,
      refreshToken: null
    };
  }
})();

export const useAuthStore = create<AuthState>((set) => ({
  ...initialState,
  setSession: (payload) =>
    set(() => {
      const nextState = {
        user: payload.user,
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken
      };

      localStorage.setItem("auth_state", JSON.stringify(nextState));
      return nextState;
    }),
  logout: () =>
    set(() => {
      const nextState = {
        user: null,
        accessToken: null,
        refreshToken: null
      };
      localStorage.removeItem("auth_state");
      return nextState;
    })
}));