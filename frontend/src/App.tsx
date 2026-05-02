import { Toaster } from "react-hot-toast";
import { Sun, Moon } from "lucide-react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { HomePage } from "./pages/shop/Home";
import { LoginPage } from "./pages/shop/Login";
import { RegisterPage } from "./pages/shop/Registro";
import { CartPage } from "./pages/shop/Carrito";
import { CheckoutPage } from "./pages/shop/Checkout";
import { MyOrdersPage } from "./pages/shop/MisOrdenes";
import { CatalogoPage } from "./pages/shop/Catalogo";
import { ProductDetailPage } from "./pages/shop/ProductoDetalle";
import { ProfilePage } from "./pages/shop/Perfil";
import { OrderDetailPage } from "./pages/shop/OrdenDetalle";
import { AdminDashboardPage } from "./pages/admin/Dashboard";
import { AdminProductsPage } from "./pages/admin/ProductosAdmin";
import { AdminOrdersPage } from "./pages/admin/OrdenesAdmin";
import { AdminInventoryPage } from "./pages/admin/InventarioAdmin";
import { AdminClientsPage } from "./pages/admin/ClientesAdmin";
import { AdminReportsPage } from "./pages/admin/Reportes";
import { AdminStatsPage } from "./pages/admin/Estadisticas";
import { AdminLayout } from "./components/AdminLayout";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { useAuthStore } from "./stores/authStore";
import { useCartStore } from "./stores/cartStore";
import { useThemeStore } from "./stores/themeStore";

const ADMIN_ROLES = ["ADMIN", "GERENTE_VENTAS", "GERENTE_INVENTARIO", "VENDEDOR"] as const;

export function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const cartItems = useCartStore((state) => state.items);

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const isAdmin = user?.roles?.some((role) =>
    (ADMIN_ROLES as readonly string[]).includes(role)
  );

  const isAdminRoute = location.pathname.startsWith("/admin");

  const { theme, toggleTheme } = useThemeStore();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  function onLogout() {
    logout();
    navigate("/");
  }

  function linkClass(path: string) {
    return location.pathname === path ? "active-link" : "";
  }

  // Admin routes use a completely separate shell (sidebar layout)
  if (isAdminRoute) {
    return (
      <>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: { background: "var(--panel)", color: "var(--text)", border: "1px solid var(--border)", fontSize: "0.85rem" },
            duration: 3000
          }}
        />
        <Routes>
          <Route element={<ProtectedRoute roles={["ADMIN", "GERENTE_VENTAS", "GERENTE_INVENTARIO", "VENDEDOR"]} />}>
            <Route path="/admin/dashboard"    element={<AdminLayout><AdminDashboardPage /></AdminLayout>} />
            <Route path="/admin/productos"    element={<AdminLayout><AdminProductsPage /></AdminLayout>} />
            <Route path="/admin/ordenes"      element={<AdminLayout><AdminOrdersPage /></AdminLayout>} />
            <Route path="/admin/inventario"   element={<AdminLayout><AdminInventoryPage /></AdminLayout>} />
            <Route path="/admin/clientes"     element={<AdminLayout><AdminClientsPage /></AdminLayout>} />
            <Route path="/admin/reportes"     element={<AdminLayout><AdminReportsPage /></AdminLayout>} />
            <Route path="/admin/estadisticas" element={<AdminLayout><AdminStatsPage /></AdminLayout>} />
          </Route>
          <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
        </Routes>
      </>
    );
  }

  return (
    <div className="app-shell">
      <Toaster
        position="top-center"
        containerStyle={{ top: 60 }}
        toastOptions={{
          style: { background: "var(--panel)", color: "var(--text)", border: "1px solid var(--border)", fontSize: "0.85rem" },
          duration: 2500
        }}
      />

      <header className="header">
        <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
          <h1>🛒 ShopConsole</h1>
          <small>E-Commerce Platform</small>
        </Link>

        <nav className="menu">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle-btn" 
            title={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <Link to="/" className={linkClass("/")}>Inicio</Link>
          <Link to="/catalogo" className={linkClass("/catalogo")}>Catálogo</Link>

          {!user && (
            <>
              <Link to="/login" className={linkClass("/login")}>Ingresar</Link>
              <Link to="/registro" className={`primary-link ${linkClass("/registro")}`}>Registrarse</Link>
            </>
          )}

          {user && !isAdmin && (
            <>
              <Link to="/carrito" className={linkClass("/carrito")}>🛒 ({totalItems})</Link>
              <Link to="/mis-ordenes" className={linkClass("/mis-ordenes")}>Mis Órdenes</Link>
              <Link to="/perfil" className={linkClass("/perfil")}>{user.firstName}</Link>
              <button onClick={onLogout} className="btn-outline btn-sm">Salir</button>
            </>
          )}

          {user && isAdmin && (
            <>
              <Link to="/admin/dashboard" className="primary-link">⚙ Admin Panel</Link>
              <Link to="/perfil" className={linkClass("/perfil")}>{user.firstName}</Link>
              <button onClick={onLogout} className="btn-outline btn-sm">Salir</button>
            </>
          )}
        </nav>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/catalogo" element={<CatalogoPage />} />
          <Route path="/producto/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
          <Route path="/carrito" element={<CartPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-ordenes" element={<MyOrdersPage />} />
            <Route path="/orden/:id" element={<OrderDetailPage />} />
            <Route path="/perfil" element={<ProfilePage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© 2026 ShopConsole — Sistema E-Commerce • React + Node.js + PostgreSQL + Docker</p>
      </footer>
    </div>
  );
}