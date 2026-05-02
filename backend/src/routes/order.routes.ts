import { Router } from "express";
import { orderController } from "../controllers/order.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import { checkoutSchema, updateOrderStatusSchema } from "../schemas/order.schema";
import { asyncHandler } from "../utils/async-handler";

export const orderRouter = Router();

orderRouter.post("/checkout", authenticate, validate(checkoutSchema), asyncHandler(orderController.checkout));
orderRouter.get("/mias", authenticate, asyncHandler(orderController.myOrders));
orderRouter.get(
  "/",
  authenticate,
  requireRoles("ADMIN", "GERENTE_VENTAS", "VENDEDOR"),
  asyncHandler(orderController.allOrders)
);
orderRouter.get(
  "/:orderId",
  authenticate,
  requireRoles("ADMIN", "GERENTE_VENTAS", "VENDEDOR"),
  asyncHandler(orderController.getById)
);
orderRouter.patch(
  "/:orderId/status",
  authenticate,
  requireRoles("ADMIN", "GERENTE_VENTAS", "VENDEDOR"),
  validate(updateOrderStatusSchema),
  asyncHandler(orderController.updateStatus)
);