import { Prisma } from "@prisma/client";
import { prisma } from "../lib/prisma";

type ProductFilters = {
  search?: string;
  categoryId?: string;
  active?: boolean;
  page: number;
  limit: number;
};

function buildWhere(filters: ProductFilters): Prisma.ProductWhereInput {
  return {
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { descriptionShort: { contains: filters.search, mode: "insensitive" } },
            { sku: { contains: filters.search, mode: "insensitive" } }
          ]
        }
      : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.active !== undefined ? { active: filters.active } : {})
  };
}

export const productRepository = {
  findMany(filters: ProductFilters) {
    return prisma.product.findMany({
      where: buildWhere(filters),
      include: {
        category: true,
        brand: true,
        images: true
      },
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      orderBy: { createdAt: "desc" }
    });
  },

  count(filters: ProductFilters) {
    return prisma.product.count({ where: buildWhere(filters) });
  },

  findById(id: string) {
    return prisma.product.findUnique({
      where: { id },
      include: {
        category: true,
        brand: true,
        images: true,
        reviews: {
          where: { approved: true },
          include: { user: true }
        }
      }
    });
  },

  findBySku(sku: string) {
    return prisma.product.findUnique({ where: { sku } });
  },

  create(data: Prisma.ProductCreateInput) {
    return prisma.product.create({
      data,
      include: {
        category: true,
        brand: true,
        images: true
      }
    });
  },

  update(id: string, data: Prisma.ProductUpdateInput) {
    return prisma.product.update({
      where: { id },
      data,
      include: {
        category: true,
        brand: true,
        images: true
      }
    });
  },

  delete(id: string) {
    return prisma.product.delete({ where: { id } });
  },

  findCategoryById(id: string) {
    return prisma.category.findUnique({ where: { id } });
  },

  findBrandById(id: string) {
    return prisma.brand.findUnique({ where: { id } });
  },

  async replaceMainImage(productId: string, url: string | null) {
    // Delete all existing main images for this product
    await prisma.productImage.deleteMany({ where: { productId, isMain: true } });
    // If a new URL is provided, create the new main image
    if (url) {
      await prisma.productImage.create({ data: { productId, url, isMain: true } });
    }
  }
};