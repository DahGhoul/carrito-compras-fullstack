import { z } from "zod";

export const checkoutSchema = z.object({
  body: z.object({
    paymentMethod: z.enum(["tarjeta", "transferencia", "contra_entrega"]),
    shippingCost: z.number().nonnegative().default(0),
    discount: z.number().nonnegative().default(0),
    addressId: z.string().optional(),
    address: z
      .object({
        fullName: z.string().min(3),
        line1: z.string().min(5),
        line2: z.string().optional(),
        city: z.string().min(2),
        state: z.string().min(2),
        postalCode: z.string().min(3),
        country: z.string().min(2),
        phone: z.string().min(6)
      })
      .optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateOrderStatusSchema = z.object({
  params: z.object({
    orderId: z.string().min(1)
  }),
  body: z.object({
    status: z.enum([
      "PENDIENTE_PAGO",
      "PAGADA",
      "EN_PROCESO",
      "ENVIADA",
      "ENTREGADA",
      "CANCELADA",
      "DEVUELTA"
    ]),
    comment: z.string().optional()
  }),
  query: z.object({}).optional()
});