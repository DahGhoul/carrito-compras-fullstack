import { api } from "./api";
import { Order, Product, DashboardData } from "../types";

export const adminService = {
  async dashboard() {
    const { data } = await api.get<{ success: boolean; data: DashboardData }>("/admin/dashboard");
    return data;
  },

  async allOrders() {
    const { data } = await api.get<{ success: boolean; data: Order[] }>("/ordenes");
    return data.data;
  },

  async allClients() {
    const { data } = await api.get<{ success: boolean; data: any[] }>("/admin/clientes");
    return data.data;
  },

  async updateOrderStatus(orderId: string, status: string, comment?: string) {
    const { data } = await api.patch(`/ordenes/${orderId}/status`, { status, comment });
    return data;
  },

  async getOrderById(orderId: string) {
    const { data } = await api.get<{ success: boolean; data: Order }>(`/ordenes/${orderId}`);
    return data.data;
  },

  async allProducts(params?: { search?: string; page?: number; limit?: number; active?: boolean }) {
    const { data } = await api.get<{
      success: boolean;
      page: number;
      limit: number;
      total: number;
      data: Product[];
    }>("/productos", { params: { ...params, limit: params?.limit ?? 100 } });
    return data;
  },

  async createProduct(payload: Record<string, unknown>) {
    const { data } = await api.post("/productos", payload);
    return data;
  },

  async updateProduct(id: string, payload: Record<string, unknown>) {
    const { data } = await api.put(`/productos/${id}`, payload);
    return data;
  },

  async deleteProduct(id: string) {
    const { data } = await api.delete(`/productos/${id}`);
    return data;
  },

  async allInventoryMovements() {
    const { data } = await api.get<{ success: boolean; data: any[] }>("/admin/inventario/movimientos");
    return data.data;
  }
};