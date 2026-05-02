import { Request, Response } from "express";
import Stripe from "stripe";

// Inicializamos Stripe con la llave secreta desde el .env
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_mock_provide_key_in_env");


export const paymentController = {
  async createIntent(req: Request, res: Response) {
    const { amount, currency = "pen", orderCode } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: "Monto inválido" });
    }

    try {
      // Creamos el intento de pago
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Stripe recibe montos en céntimos
        currency: currency.toLowerCase(),
        metadata: {
          orderCode: orderCode || "N/A"
        },
        // En modo prueba, esto permite usar el flujo 3D Secure si fuera necesario
        payment_method_types: ["card"],
      });

      return res.status(200).json({
        success: true,
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      return res.status(400).json({
        success: false,
        message: error.message || "Error al conectar con la pasarela de pagos"
      });
    }
  }
};
