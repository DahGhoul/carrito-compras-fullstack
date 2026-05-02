import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requireRoles } from "../middlewares/rbac.middleware";
import { validate } from "../middlewares/validate.middleware";
import {
  createProductSchema,
  listProductsSchema,
  updateProductSchema
} from "../schemas/product.schema";
import { asyncHandler } from "../utils/async-handler";

export const productRouter = Router();

productRouter.get("/", validate(listProductsSchema), asyncHandler(productController.list));
productRouter.get("/:id", asyncHandler(productController.getById));

productRouter.post(
  "/",
  authenticate,
  requireRoles("ADMIN", "GERENTE_INVENTARIO"),
  validate(createProductSchema),
  asyncHandler(productController.create)
);

productRouter.put(
  "/:id",
  authenticate,
  requireRoles("ADMIN", "GERENTE_INVENTARIO"),
  validate(updateProductSchema),
  asyncHandler(productController.update)
);

productRouter.delete(
  "/:id",
  authenticate,
  requireRoles("ADMIN", "GERENTE_INVENTARIO"),
  asyncHandler(productController.remove)
);