import { z } from "zod";

export const listProductsSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().default(1).optional(),
    limit: z.coerce.number().int().positive().max(1000).default(12).optional(),
    search: z.string().optional(),
    categoryId: z.string().optional(),
    active: z.coerce.boolean().optional()
  }),
  body: z.object({}).optional(),
  params: z.object({}).optional()
});

export const createProductSchema = z.object({
  body: z.object({
    sku: z.string().min(3),
    name: z.string().min(3),
    descriptionShort: z.string().optional(),
    descriptionLong: z.string().optional(),
    categoryId: z.string().min(1),
    brandId: z.string().optional(),
    priceCost: z.number().nonnegative(),
    priceSale: z.number().nonnegative(),
    offerPrice: z.number().nonnegative().optional(),
    stock: z.number().int().nonnegative().default(0),
    stockMin: z.number().int().nonnegative().default(0),
    active: z.boolean().default(true),
    imageUrl: z.string().url().optional()
  }),
  query: z.object({}).optional(),
  params: z.object({}).optional()
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1)
  }),
  body: z.object({
    name: z.string().min(3).optional(),
    descriptionShort: z.string().optional(),
    descriptionLong: z.string().optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional().nullable(),
    priceCost: z.number().nonnegative().optional(),
    priceSale: z.number().nonnegative().optional(),
    offerPrice: z.number().nonnegative().optional().nullable(),
    stock: z.number().int().nonnegative().optional(),
    stockMin: z.number().int().nonnegative().optional(),
    active: z.boolean().optional(),
    imageUrl: z.string().url().optional().nullable()
  }),
  query: z.object({}).optional()
});