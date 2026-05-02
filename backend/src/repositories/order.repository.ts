import { OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const orderRepository = {
  findAddressById(addressId: string, userId: string) {
    return prisma.address.findFirst({ where: { id: addressId, userId } });
  },

  createAddress(userId: string, data: {
    fullName: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  }) {
    return prisma.address.create({ data: { userId, ...data } });
  },

  findSystemTax() {
    return prisma.systemConfig.findUnique({ where: { key: "IMPUESTO_PORCENTAJE" } });
  },

  findOrderById(orderId: string) {
    return prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: true,
        address: true,
        statusHistory: true
      }
    });
  },

  findOrdersByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: { product: true }
        },
        address: true,
        statusHistory: true
      },
      orderBy: { createdAt: "desc" }
    });
  },

  findAllOrders() {
    return prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: { product: true }
        },
        statusHistory: true
      },
      orderBy: { createdAt: "desc" }
    });
  },

  updateOrderStatus(orderId: string, status: OrderStatus) {
    return prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
  }
};