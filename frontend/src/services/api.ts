import axios from "axios";
import toast from "react-hot-toast";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
});

function getAuthState() {
  const raw = localStorage.getItem("auth_state");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as {
      accessToken?: string;
      refreshToken?: string;
    };
  } catch {
    return null;
  }
}

api.interceptors.request.use((config) => {
  const state = getAuthState();
  if (state?.accessToken) {
    config.headers.Authorization = `Bearer ${state.accessToken}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      const state = getAuthState();
      if (state?.refreshToken) {
        try {
          const { data } = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: state.refreshToken
          });
          const newState = {
            ...JSON.parse(localStorage.getItem("auth_state") || "{}"),
            accessToken: data.data.accessToken,
            refreshToken: data.data.refreshToken
          };
          localStorage.setItem("auth_state", JSON.stringify(newState));
          original.headers.Authorization = `Bearer ${data.data.accessToken}`;
          return api(original);
        } catch {
          localStorage.removeItem("auth_state");
          window.location.href = "/login";
        }
      }
    }
    const msg = error.response?.data?.message || error.message || "Error de red";
    toast.error(msg);
    return Promise.reject(error);
  }
);