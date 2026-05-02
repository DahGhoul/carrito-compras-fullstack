import { Router } from "express";
import { adminController } from "../controllers/admin.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/rbac.middleware";
import { asyncHandler } from "../utils/async-handler";

export const adminRouter = Router();

adminRouter.get(
  "/dashboard",
  authenticate,
  requireRoles("ADMIN", "GERENTE_VENTAS", "GERENTE_INVENTARIO"),
  asyncHandler(adminController.dashboard)
);

adminRouter.get(
  "/clientes",
  authenticate,
  requireRoles("ADMIN", "GERENTE_VENTAS"),
  asyncHandler(adminController.listClientes)
);

adminRouter.get(
  "/inventario/movimientos",
  authenticate,
  requireRoles("ADMIN", "GERENTE_INVENTARIO"),
  asyncHandler(adminController.listInventoryMovements)
);