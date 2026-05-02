import { Prisma } from "@prisma/client";
import { productRepository } from "../repositories/product.repository";

function notFound(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 404;
  return error;
}

function badRequest(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 400;
  return error;
}

export const productService = {
  async list(query: {
    page?: number;
    limit?: number;
    search?: string;
    categoryId?: string;
    active?: boolean;
  }) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const [items, total] = await Promise.all([
      productRepository.findMany({
        page,
        limit,
        search: query.search,
        categoryId: query.categoryId,
        active: query.active
      }),
      productRepository.count({
        page,
        limit,
        search: query.search,
        categoryId: query.categoryId,
        active: query.active
      })
    ]);

    return {
      page,
      limit,
      total,
      data: items
    };
  },

  async getById(id: string) {
    const product = await productRepository.findById(id);
    if (!product) {
      throw notFound("Producto no encontrado");
    }

    return product;
  },

  async create(payload: {
    sku: string;
    name: string;
    descriptionShort?: string;
    descriptionLong?: string;
    categoryId: string;
    brandId?: string;
    priceCost: number;
    priceSale: number;
    offerPrice?: number;
    stock: number;
    stockMin: number;
    active: boolean;
    imageUrl?: string;
  }) {
    const existing = await productRepository.findBySku(payload.sku);
    if (existing) {
      throw badRequest("SKU ya registrado");
    }

    const category = await productRepository.findCategoryById(payload.categoryId);
    if (!category) {
      throw badRequest("Categoria invalida");
    }

    if (payload.brandId) {
      const brand = await productRepository.findBrandById(payload.brandId);
      if (!brand) {
        throw badRequest("Marca invalida");
      }
    }

    return productRepository.create({
      sku: payload.sku,
      name: payload.name,
      descriptionShort: payload.descriptionShort,
      descriptionLong: payload.descriptionLong,
      category: { connect: { id: payload.categoryId } },
      ...(payload.brandId ? { brand: { connect: { id: payload.brandId } } } : {}),
      priceCost: new Prisma.Decimal(payload.priceCost),
      priceSale: new Prisma.Decimal(payload.priceSale),
      offerPrice: payload.offerPrice ? new Prisma.Decimal(payload.offerPrice) : null,
      stock: payload.stock,
      stockMin: payload.stockMin,
      active: payload.active,
      ...(payload.imageUrl
        ? {
            images: {
              create: [{ url: payload.imageUrl, isMain: true }]
            }
          }
        : {})
    });
  },

  async update(
    id: string,
    payload: {
      name?: string;
      descriptionShort?: string;
      descriptionLong?: string;
      categoryId?: string;
      brandId?: string | null;
      priceCost?: number;
      priceSale?: number;
      offerPrice?: number | null;
      stock?: number;
      stockMin?: number;
      active?: boolean;
      imageUrl?: string | null;
    }
  ) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw notFound("Producto no encontrado");
    }

    if (payload.categoryId) {
      const category = await productRepository.findCategoryById(payload.categoryId);
      if (!category) {
        throw badRequest("Categoria invalida");
      }
    }

    if (payload.brandId) {
      const brand = await productRepository.findBrandById(payload.brandId);
      if (!brand) {
        throw badRequest("Marca invalida");
      }
    }

    const updated = await productRepository.update(id, {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.descriptionShort !== undefined ? { descriptionShort: payload.descriptionShort } : {}),
      ...(payload.descriptionLong !== undefined ? { descriptionLong: payload.descriptionLong } : {}),
      ...(payload.categoryId ? { category: { connect: { id: payload.categoryId } } } : {}),
      ...(payload.brandId === null
        ? { brand: { disconnect: true } }
        : payload.brandId
          ? { brand: { connect: { id: payload.brandId } } }
          : {}),
      ...(payload.priceCost !== undefined ? { priceCost: new Prisma.Decimal(payload.priceCost) } : {}),
      ...(payload.priceSale !== undefined ? { priceSale: new Prisma.Decimal(payload.priceSale) } : {}),
      ...(payload.offerPrice === null
        ? { offerPrice: null }
        : payload.offerPrice !== undefined
          ? { offerPrice: new Prisma.Decimal(payload.offerPrice) }
          : {}),
      ...(payload.stock !== undefined ? { stock: payload.stock } : {}),
      ...(payload.stockMin !== undefined ? { stockMin: payload.stockMin } : {}),
      ...(payload.active !== undefined ? { active: payload.active } : {})
    });

    // Handle image update: replace existing main image when imageUrl is provided
    if (payload.imageUrl !== undefined) {
      await productRepository.replaceMainImage(id, payload.imageUrl ?? null);
    }

    return productRepository.findById(id);
  },

  async remove(id: string) {
    const existing = await productRepository.findById(id);
    if (!existing) {
      throw notFound("Producto no encontrado");
    }

    await productRepository.delete(id);
  }
};