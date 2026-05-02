import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useThemeStore } from "../stores/themeStore";
import { ReactNode } from "react";
import { Sun, Moon } from "lucide-react";

const NAV_ITEMS = [
  { to: "/admin/dashboard",    icon: "⚡", label: "Dashboard" },
  { to: "/admin/ordenes",      icon: "📋", label: "Órdenes" },
  { to: "/admin/productos",    icon: "📦", label: "Catálogo" },
  { to: "/admin/inventario",   icon: "🏭", label: "Inventario" },
  { to: "/admin/clientes",     icon: "👥", label: "Clientes" },
  { to: "/admin/estadisticas", icon: "📊", label: "Estadísticas" },
  { to: "/admin/reportes",     icon: "📄", label: "Reportes" },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const { theme, toggleTheme } = useThemeStore();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  const roleName = user?.roles?.[0] ?? "Admin";

  return (
    <div className="admin-shell">
      {/* ── Sidebar ── */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1 }}>
            <span className="admin-sidebar-logo">🛒</span>
            <div>
              <p className="admin-sidebar-title">ShopConsole</p>
              <p className="admin-sidebar-subtitle">Panel de Control</p>
            </div>
          </div>
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn admin-theme-toggle" 
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        <nav className="admin-nav">
          {NAV_ITEMS.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `admin-nav-item${isActive ? " active" : ""}`
              }
            >
              <span className="admin-nav-icon">{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar-footer">
          <div className="admin-user-card">
            <div className="admin-user-avatar">
              {(user?.firstName?.[0] ?? "A").toUpperCase()}
            </div>
            <div className="admin-user-info">
              <p className="admin-user-name">{user?.firstName} {user?.lastName}</p>
              <p className="admin-user-role">{roleName}</p>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.4rem", marginTop: "0.8rem" }}>
            <NavLink to="/" className="admin-action-btn" title="Ir a la tienda">
              🏪 Tienda
            </NavLink>
            <button className="admin-action-btn danger" onClick={handleLogout} title="Cerrar sesión">
              Salir
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main content area ── */}
      <div className="admin-main">
        {children}
      </div>
    </div>
  );
}
