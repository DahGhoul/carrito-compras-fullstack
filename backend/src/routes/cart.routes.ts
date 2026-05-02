import { Router } from "express";
import { cartController } from "../controllers/cart.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware";
import { addCartItemSchema, syncCartSchema, updateCartItemSchema } from "../schemas/cart.schema";
import { asyncHandler } from "../utils/async-handler";

export const cartRouter = Router();

cartRouter.use(authenticate);

cartRouter.get("/", asyncHandler(cartController.getMyCart));
cartRouter.post("/items", validate(addCartItemSchema), asyncHandler(cartController.addItem));
cartRouter.put("/items/:itemId", validate(updateCartItemSchema), asyncHandler(cartController.updateItem));
cartRouter.delete("/items/:itemId", asyncHandler(cartController.removeItem));
cartRouter.post("/sync", validate(syncCartSchema), asyncHandler(cartController.sync));