import { Router } from "express";
import { authRouter } from "./auth.routes";
import { productRouter } from "./product.routes";
import { cartRouter } from "./cart.routes";
import { orderRouter } from "./order.routes";
import { adminRouter } from "./admin.routes";
import { paymentRouter } from "./payment.routes";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/productos", productRouter);
apiRouter.use("/carrito", cartRouter);
apiRouter.use("/ordenes", orderRouter);
apiRouter.use("/admin", adminRouter);
apiRouter.use("/pagos", paymentRouter);