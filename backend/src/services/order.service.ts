import { OrderStatus, Prisma } from "@prisma/client";
import { cartRepository } from "../repositories/cart.repository";
import { orderRepository } from "../repositories/order.repository";
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

function generateOrderCode() {
  const stamp = Date.now();
  const suffix = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");

  return `ORD-${stamp}-${suffix}`;
}

export const orderService = {
  async checkout(
    userId: string,
    payload: {
      paymentMethod: "tarjeta" | "transferencia" | "contra_entrega";
      shippingCost?: number;
      discount?: number;
      addressId?: string;
      address?: {
        fullName: string;
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
        phone: string;
      };
    }
  ) {
    const cart = await cartRepository.getOrCreateByUserId(userId);
    if (!cart.items.length) {
      throw badRequest("El carrito esta vacio");
    }

    let address = null;
    if (payload.addressId) {
      address = await orderRepository.findAddressById(payload.addressId, userId);
      if (!address) {
        throw badRequest("Direccion invalida");
      }
    }

    if (!address && payload.address) {
      address = await orderRepository.createAddress(userId, payload.address);
    }

    if (!address) {
      throw badRequest("Debes seleccionar o registrar una direccion");
    }

    const subtotal = cart.items.reduce((acc, item) => acc + Number(item.unitPrice) * item.quantity, 0);
    const taxConfig = await orderRepository.findSystemTax();
    const taxRate = Number(taxConfig?.value ?? 0.18);
    const shipping = payload.shippingCost ?? 0;
    const discount = payload.discount ?? 0;
    // En Perú el IGV está incluido en el precio de venta (precio con IGV)
    const tax = subtotal * (taxRate / (1 + taxRate));
    const total = subtotal + shipping - discount;

    if (total < 0) {
      throw badRequest("Total invalido");
    }

    const createdOrder = await prisma.$transaction(async (tx) => {
      for (const item of cart.items) {
        const currentProduct = await tx.product.findUnique({ where: { id: item.productId } });
        if (!currentProduct || !currentProduct.active || currentProduct.stock < item.quantity) {
          throw badRequest(`Stock insuficiente para ${item.product.name}`);
        }
      }

      const order = await tx.order.create({
        data: {
          code: generateOrderCode(),
          userId,
          addressId: address.id,
          status: OrderStatus.PENDIENTE_PAGO,
          subtotal: new Prisma.Decimal(subtotal),
          tax: new Prisma.Decimal(tax),
          shipping: new Prisma.Decimal(shipping),
          discount: new Prisma.Decimal(discount),
          total: new Prisma.Decimal(total),
          paymentMethod: payload.paymentMethod,
          paymentStatus: "pendiente"
        }
      });

      for (const item of cart.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            subtotal: new Prisma.Decimal(Number(item.unitPrice) * item.quantity)
          }
        });

        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } }
        });

        await tx.inventoryMovement.create({
          data: {
            productId: item.productId,
            type: "SALIDA",
            quantity: item.quantity,
            reference: order.code,
            notes: "Salida por checkout"
          }
        });
      }

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: OrderStatus.PENDIENTE_PAGO,
          comment: "Orden creada"
        }
      });

      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: {
            include: {
              product: true
            }
          },
          address: true,
          statusHistory: true
        }
      });
    });

    return createdOrder;
  },

  async myOrders(userId: string) {
    return orderRepository.findOrdersByUserId(userId);
  },

  async listAll() {
    return orderRepository.findAllOrders();
  },

  async getById(orderId: string) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw notFound("Orden no encontrada");
    }
    return order;
  },

  async updateStatus(orderId: string, status: OrderStatus, comment: string | undefined, changedById: string) {
    const order = await orderRepository.findOrderById(orderId);
    if (!order) {
      throw notFound("Orden no encontrada");
    }

    const updated = await orderRepository.updateOrderStatus(orderId, status);

    await prisma.orderStatusHistory.create({
      data: {
        orderId,
        oldStatus: order.status,
        status,
        comment,
        changedById
      }
    });

    return updated;
  }
};