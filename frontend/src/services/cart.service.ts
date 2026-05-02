import { api } from "./api";

export const cartService = {
  async sync(items: Array<{ productId: string; quantity: number }>) {
    const { data } = await api.post("/carrito/sync", { items });
    return data;
  }
};