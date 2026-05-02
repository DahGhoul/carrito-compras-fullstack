import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { authService } from "../../services/auth.service";
import { cartService } from "../../services/cart.service";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(1, "Contraseña requerida")
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const cartItems = useCartStore((state) => state.items);
  const [apiError, setApiError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema)
  });

  const onSubmit = handleSubmit(async (values) => {
    setApiError(null);
    try {
      const result = await authService.login(values.email, values.password);
      setSession(result);

      if (cartItems.length > 0) {
        try {
          await cartService.sync(
            cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity
            }))
          );
        } catch {
          // Cart sync is best-effort
        }
      }

      navigate("/");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        "Credenciales incorrectas";
      setApiError(message);
    }
  });

  return (
    <section className="panel" style={{ maxWidth: 420, margin: "0 auto" }}>
      <h2>Iniciar Sesión</h2>
      <form onSubmit={onSubmit} className="form" style={{ marginTop: "1rem" }}>
        <label>
          Email
          <input type="email" {...register("email")} />
          {errors.email && <small className="error">{errors.email.message}</small>}
        </label>

        <label>
          Contraseña
          <input type="password" {...register("password")} />
          {errors.password && <small className="error">{errors.password.message}</small>}
        </label>

        {apiError && <p className="error">{apiError}</p>}

        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Ingresando..." : "Entrar"}
        </button>
      </form>

      <div style={{ marginTop: "1rem" }}>
        <p className="hint">Demo admin: admin@ecommerce.com / Admin123!</p>
        <p className="hint">Demo cliente: cliente@example.com / Cliente123!</p>
      </div>
      <p className="hint" style={{ marginTop: "0.8rem" }}>
        ¿No tienes cuenta? <Link to="/registro">Registrarse</Link>
      </p>
    </section>
  );
}