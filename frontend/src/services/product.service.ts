import { api } from "./api";
import { Product } from "../types";

type ProductListResponse = {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: Product[];
};

export const productService = {
  async list(params?: { search?: string; page?: number; limit?: number }) {
    const { data } = await api.get<ProductListResponse>("/productos", { params });
    return data;
  },

  async detail(productId: string) {
    const { data } = await api.get<{ success: boolean; data: Product }>(`/productos/${productId}`);
    return data.data;
  }
};