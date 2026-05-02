import { useAuthStore } from "../../stores/authStore";

export function ProfilePage() {
  const user = useAuthStore((state) => state.user);

  if (!user) return <p>No autenticado</p>;

  return (
    <section>
      <h2>Mi Perfil</h2>
      <div className="panel" style={{ maxWidth: 600, marginTop: "1rem" }}>
        <div className="form">
          <div className="form-row">
            <label>
              Nombre
              <input value={user.firstName} readOnly />
            </label>
            <label>
              Apellido
              <input value={user.lastName} readOnly />
            </label>
          </div>
          <label>
            Email
            <input value={user.email} readOnly />
          </label>
          <label>
            Teléfono
            <input value={user.phone || "No registrado"} readOnly />
          </label>
          <label>
            Roles
            <input value={user.roles.join(", ")} readOnly />
          </label>
        </div>
        <p className="hint" style={{ marginTop: "1rem" }}>
          Para cambios de contraseña o datos, contacta al administrador.
        </p>
      </div>
    </section>
  );
}
