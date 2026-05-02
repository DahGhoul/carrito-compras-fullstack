import { Router } from "express";
import { paymentController } from "../controllers/payment.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { asyncHandler } from "../utils/async-handler";

export const paymentRouter = Router();

// Endpoint para crear el intento de pago (requiere estar logueado)
paymentRouter.post(
  "/create-intent",
  authenticate,
  asyncHandler(paymentController.createIntent)
);
