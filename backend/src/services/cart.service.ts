import { cartRepository } from "../repositories/cart.repository";
import { prisma } from "../lib/prisma";

function badRequest(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 400;
  return error;
}

function notFound(message: string) {
  const error = new Error(message) as Error & { statusCode?: number };
  error.statusCode = 404;
  return error;
}

function calculateCart(cart: Awaited<ReturnType<typeof cartRepository.getOrCreateByUserId>>) {
  const subtotal = cart.items.reduce(
    (acc, item) => acc + Number(item.unitPrice) * item.quantity,
    0
  );

  return {
    ...cart,
    subtotal,
    totalItems: cart.items.reduce((acc, item) => acc + item.quantity, 0)
  };
}

export const cartService = {
  async getCart(userId: string) {
    const cart = await cartRepository.getOrCreateByUserId(userId);
    return calculateCart(cart);
  },

  async addItem(userId: string, payload: { productId: string; quantity: number }) {
    const product = await prisma.product.findUnique({ where: { id: payload.productId } });
    if (!product || !product.active) {
      throw notFound("Producto no disponible");
    }

    const cart = await cartRepository.getOrCreateByUserId(userId);
    const existingItem = await cartRepository.findItem(cart.id, payload.productId);

    const totalQuantity = (existingItem?.quantity ?? 0) + payload.quantity;
    if (totalQuantity > product.stock) {
      throw badRequest("No hay stock suficiente");
    }

    if (existingItem) {
      await cartRepository.updateItem(existingItem.id, totalQuantity);
    } else {
      await cartRepository.createItem(
        cart.id,
        product.id,
        payload.quantity,
        Number(product.offerPrice ?? product.priceSale)
      );
    }

    return this.getCart(userId);
  },

  async updateItem(userId: string, itemId: string, quantity: number) {
    const item = await cartRepository.findItemById(itemId);
    if (!item || item.cart.userId !== userId) {
      throw notFound("Item no encontrado en carrito");
    }

    if (quantity > item.product.stock) {
      throw badRequest("No hay stock suficiente");
    }

    await cartRepository.updateItem(itemId, quantity);
    return this.getCart(userId);
  },

  async removeItem(userId: string, itemId: string) {
    const item = await cartRepository.findItemById(itemId);
    if (!item || item.cart.userId !== userId) {
      throw notFound("Item no encontrado en carrito");
    }

    await cartRepository.deleteItem(itemId);
    return this.getCart(userId);
  },

  async sync(userId: string, items: Array<{ productId: string; quantity: number }>) {
    for (const item of items) {
      try {
        await this.addItem(userId, item);
      } catch {
        // Ignora productos ya no disponibles para evitar romper la fusion.
      }
    }

    return this.getCart(userId);
  }
};