import { api } from "./api";

export const orderService = {
  async checkout(payload: {
    paymentMethod: "tarjeta" | "transferencia" | "contra_entrega";
    shippingCost: number;
    discount: number;
    address: {
      fullName: string;
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
      phone: string;
    };
  }) {
    const { data } = await api.post("/ordenes/checkout", payload);
    return data;
  },

  async myOrders() {
    const { data } = await api.get("/ordenes/mias");
    return data;
  }
};