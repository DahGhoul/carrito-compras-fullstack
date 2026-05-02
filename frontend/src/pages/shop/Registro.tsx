import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useNavigate, Link } from "react-router-dom";
import { z } from "zod";
import { authService } from "../../services/auth.service";
import toast from "react-hot-toast";

const registerSchema = z.object({
  firstName: z.string().min(1, "Nombre requerido"),
  lastName: z.string().min(1, "Apellido requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string()
}).refine((d) => d.password === d.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
});

type RegisterValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors }
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await authService.register({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        password: values.password
      });
      toast.success("Cuenta creada exitosamente. Inicia sesión.");
      navigate("/login");
    } catch {
      // Error handled by API interceptor
    }
  });

  return (
    <section className="panel" style={{ maxWidth: 480, margin: "0 auto" }}>
      <h2>Crear Cuenta</h2>
      <form onSubmit={onSubmit} className="form" style={{ marginTop: "1rem" }}>
        <div className="form-row">
          <label>
            Nombre
            <input {...register("firstName")} />
            {errors.firstName && <small className="error">{errors.firstName.message}</small>}
          </label>
          <label>
            Apellido
            <input {...register("lastName")} />
            {errors.lastName && <small className="error">{errors.lastName.message}</small>}
          </label>
        </div>
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
        <label>
          Confirmar contraseña
          <input type="password" {...register("confirmPassword")} />
          {errors.confirmPassword && <small className="error">{errors.confirmPassword.message}</small>}
        </label>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Registrando..." : "Crear cuenta"}
        </button>
      </form>
      <p className="hint" style={{ marginTop: "1rem" }}>
        ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </section>
  );
}
