import { api } from "./api";

export const paymentService = {
  async createIntent(amount: number, orderCode?: string) {
    const { data } = await api.post<{ success: boolean; clientSecret: string }>("/pagos/create-intent", {
      amount,
      orderCode
    });
    return data;
  }
};
