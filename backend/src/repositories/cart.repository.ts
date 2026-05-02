import { prisma } from "../lib/prisma";

export const cartRepository = {
  async getOrCreateByUserId(userId: string) {
    const existing = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true
              }
            }
          }
        }
      }
    });

    if (existing) {
      return existing;
    }

    return prisma.cart.create({
      data: { userId },
      include: {
        items: {
          include: {
            product: {
              include: {
                images: true,
                category: true
              }
            }
          }
        }
      }
    });
  },

  findItemById(itemId: string) {
    return prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true, product: true }
    });
  },

  findItem(cartId: string, productId: string) {
    return prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId,
          productId
        }
      }
    });
  },

  createItem(cartId: string, productId: string, quantity: number, unitPrice: number) {
    return prisma.cartItem.create({
      data: {
        cartId,
        productId,
        quantity,
        unitPrice
      }
    });
  },

  updateItem(itemId: string, quantity: number) {
    return prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity }
    });
  },

  deleteItem(itemId: string) {
    return prisma.cartItem.delete({ where: { id: itemId } });
  },

  clearCart(cartId: string) {
    return prisma.cartItem.deleteMany({ where: { cartId } });
  }
};