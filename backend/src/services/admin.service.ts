import { adminRepository } from "../repositories/admin.repository";

export const adminService = {
  async dashboard() {
    const [totalProductos, totalClientes, ordenesPendientes, ventasPeriodo, lowStockProducts] =
      await Promise.all([
        adminRepository.totalProductos(),
        adminRepository.totalClientes(),
        adminRepository.ordenesPendientes(),
        adminRepository.ventasPeriodo(),
        adminRepository.lowStockProducts()
      ]);

    const ticketPromedio =
      Number(ventasPeriodo.cantidad) > 0
        ? Number(ventasPeriodo.total) / Number(ventasPeriodo.cantidad)
        : 0;

    return {
      kpis: {
        totalProductos,
        totalClientes,
        ordenesPendientes,
        ventasMes: Number(ventasPeriodo.total),
        ordenesMes: Number(ventasPeriodo.cantidad),
        ticketPromedio
      },
      lowStockProducts
    };
  },

  async listClientes() {
    return adminRepository.listClientes();
  },

  async listInventoryMovements() {
    return adminRepository.listInventoryMovements();
  }
};