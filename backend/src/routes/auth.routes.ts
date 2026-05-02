import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { validate } from "../middlewares/validate.middleware";
import { authenticate } from "../middlewares/auth.middleware";
import { loginSchema, logoutSchema, refreshSchema, registerSchema } from "../schemas/auth.schema";
import { asyncHandler } from "../utils/async-handler";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), asyncHandler(authController.register));
authRouter.post("/login", validate(loginSchema), asyncHandler(authController.login));
authRouter.post("/refresh", validate(refreshSchema), asyncHandler(authController.refresh));
authRouter.post("/logout", validate(logoutSchema), asyncHandler(authController.logout));
authRouter.get("/me", authenticate, asyncHandler(authController.me));