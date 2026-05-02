import { OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

export const adminRepository = {
  totalProductos() {
    return prisma.product.count({ where: { active: true } });
  },

  totalClientes() {
    return prisma.user.count({
      where: {
        roles: {
          some: {
            role: {
              code: "CLIENTE"
            }
          }
        }
      }
    });
  },

  ordenesPendientes() {
    return prisma.order.count({
      where: {
        status: {
          in: [OrderStatus.PENDIENTE_PAGO, OrderStatus.PAGADA, OrderStatus.EN_PROCESO]
        }
      }
    });
  },

  async ventasPeriodo() {
    const hoy = new Date();
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const result = await prisma.order.aggregate({
      where: {
        createdAt: { gte: inicioMes },
        status: {
          notIn: [OrderStatus.CANCELADA, OrderStatus.DEVUELTA]
        }
      },
      _sum: { total: true },
      _count: { id: true }
    });

    return {
      total: result._sum.total ?? 0,
      cantidad: result._count.id
    };
  },

  lowStockProducts() {
    return prisma.product.findMany({
      where: {
        stock: {
          lte: prisma.product.fields.stockMin
        },
        active: true
      },
      orderBy: { stock: "asc" },
      take: 10
    });
  },

  listClientes() {
    return prisma.user.findMany({
      where: {
        roles: {
          some: {
            role: {
              code: "CLIENTE"
            }
          }
        }
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        createdAt: true,
        _count: {
          select: { orders: true }
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });
  },

  listInventoryMovements() {
    return prisma.inventoryMovement.findMany({
      include: {
        product: {
          select: {
            sku: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 500
    });
  }
};