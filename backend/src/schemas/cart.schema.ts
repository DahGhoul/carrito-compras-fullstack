import { z } from "zod";

export const addCartItemSchema = z.object({
  body: z.object({
    productId: z.string().min(1),
    quantity: z.number().int().positive().default(1)
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateCartItemSchema = z.object({
  params: z.object({
    itemId: z.string().min(1)
  }),
  body: z.object({
    quantity: z.number().int().positive()
  }),
  query: z.object({}).optional()
});

export const syncCartSchema = z.object({
  body: z.object({
    items: z.array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive()
      })
    )
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});