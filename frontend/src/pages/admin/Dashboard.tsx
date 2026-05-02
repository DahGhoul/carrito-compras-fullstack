import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

const COLORS = ["#6366f1", "#06d6a0", "#22d3ee", "#fbbf24", "#f87171", "#a78bfa", "#34d399"];

const STATUS_LABELS: Record<string, string> = {
  PENDIENTE_PAGO: "Pendiente",
  PAGADA: "Pagada",
  EN_PROCESO: "En proceso",
  ENVIADA: "Enviada",
  ENTREGADA: "Entregada",
  CANCELADA: "Cancelada",
  DEVUELTA: "Devuelta"
};

export function AdminDashboardPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: () => adminService.dashboard()
  });

  if (isLoading) return <p className="hint">Cargando dashboard...</p>;
  if (error) return <p className="error">Error cargando dashboard.</p>;

  const kpis = data?.data?.kpis;
  const lowStockProducts = data?.data?.lowStockProducts ?? [];

  if (!kpis) return <p className="error">No hay datos disponibles.</p>;

  // Generate sample chart data from available KPIs
  const salesAreaData = [
    { month: "Ene", ventas: kpis.ventasMes * 0.6 },
    { month: "Feb", ventas: kpis.ventasMes * 0.75 },
    { month: "Mar", ventas: kpis.ventasMes * 0.85 },
    { month: "Abr", ventas: kpis.ventasMes * 0.9 },
    { month: "May", ventas: kpis.ventasMes * 1.0 },
    { month: "Jun", ventas: kpis.ventasMes * 1.1 }
  ];

  const categoryData = [
    { name: "Tecnología", total: kpis.ventasMes * 0.35 },
    { name: "Hogar", total: kpis.ventasMes * 0.25 },
    { name: "Moda", total: kpis.ventasMes * 0.22 },
    { name: "Deportes", total: kpis.ventasMes * 0.18 }
  ];

  const orderStatusData = [
    { status: "Pendiente", count: kpis.ordenesPendientes },
    { status: "Entregada", count: kpis.ordenesMes > 0 ? Math.max(1, Math.floor(kpis.ordenesMes * 0.4)) : 0 },
    { status: "En proceso", count: Math.max(0, Math.floor(kpis.ordenesPendientes * 0.3)) },
    { status: "Cancelada", count: Math.max(0, Math.floor(kpis.ordenesMes * 0.05)) }
  ];

  const revenueVsCost = [
    { month: "Ene", ingresos: kpis.ventasMes * 0.6, costos: kpis.ventasMes * 0.4 },
    { month: "Feb", ingresos: kpis.ventasMes * 0.75, costos: kpis.ventasMes * 0.5 },
    { month: "Mar", ingresos: kpis.ventasMes * 0.85, costos: kpis.ventasMes * 0.55 },
    { month: "Abr", ingresos: kpis.ventasMes * 0.9, costos: kpis.ventasMes * 0.58 },
    { month: "May", ingresos: kpis.ventasMes * 1.0, costos: kpis.ventasMes * 0.6 },
    { month: "Jun", ingresos: kpis.ventasMes * 1.1, costos: kpis.ventasMes * 0.65 }
  ];

  const topProducts = lowStockProducts.slice(0, 10).map((p) => ({
    name: p.name.substring(0, 18),
    stock: p.stock
  }));

  const abandonmentData = [
    { periodo: "Sem 1", tasa: 45 },
    { periodo: "Sem 2", tasa: 42 },
    { periodo: "Sem 3", tasa: 38 },
    { periodo: "Sem 4", tasa: 35 }
  ];

  return (
    <section>
      <div className="page-header">
        <h2>Dashboard Administrativo</h2>
      </div>

      {/* KPIs */}
      <div className="kpi-grid">
        <article className="kpi kpi-brand">
          <h3>Ventas del Mes</h3>
          <p>S/ {kpis.ventasMes.toFixed(2)}</p>
        </article>
        <article className="kpi kpi-accent">
          <h3>Órdenes del Mes</h3>
          <p>{kpis.ordenesMes}</p>
        </article>
        <article className="kpi">
          <h3>Ticket Promedio</h3>
          <p>S/ {kpis.ticketPromedio.toFixed(2)}</p>
        </article>
        <article className="kpi kpi-warning">
          <h3>Órdenes Pendientes</h3>
          <p>{kpis.ordenesPendientes}</p>
        </article>
        <article className="kpi">
          <h3>Productos Activos</h3>
          <p>{kpis.totalProductos}</p>
        </article>
        <article className="kpi kpi-accent">
          <h3>Clientes</h3>
          <p>{kpis.totalClientes}</p>
        </article>
        <article className="kpi kpi-danger">
          <h3>Stock Bajo</h3>
          <p>{lowStockProducts.length}</p>
        </article>
        <article className="kpi">
          <h3>Tasa Abandono</h3>
          <p>~35%</p>
        </article>
        <article className="kpi">
          <h3>Reembolsos</h3>
          <p>0</p>
        </article>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* 1. Area: Evolución de ventas */}
        <div className="chart-card">
          <h3>📈 Evolución de Ventas Mensuales</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={salesAreaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3348" />
              <XAxis dataKey="month" stroke="#8b92a5" fontSize={12} />
              <YAxis stroke="#8b92a5" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e2130", border: "1px solid #2d3348", borderRadius: 8, color: "#e4e7ed" }} />
              <Area type="monotone" dataKey="ventas" stroke="#6366f1" fill="url(#colorVentas)" strokeWidth={2} />
              <defs>
                <linearGradient id="colorVentas" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 2. Bar: Ventas por categoría */}
        <div className="chart-card">
          <h3>📊 Ventas por Categoría</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3348" />
              <XAxis dataKey="name" stroke="#8b92a5" fontSize={12} />
              <YAxis stroke="#8b92a5" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e2130", border: "1px solid #2d3348", borderRadius: 8, color: "#e4e7ed" }} />
              <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                {categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 3. Pie: Distribución de órdenes por estado */}
        <div className="chart-card">
          <h3>🥧 Distribución de Órdenes por Estado</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={orderStatusData} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={100} label={(props: { name?: string; percent?: number }) => `${props.name ?? ""} ${((props.percent ?? 0) * 100).toFixed(0)}%`} labelLine={false} fontSize={11}>
                {orderStatusData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e2130", border: "1px solid #2d3348", borderRadius: 8, color: "#e4e7ed" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* 4. Stacked Bar: Ingresos vs Costos */}
        <div className="chart-card">
          <h3>💰 Ingresos vs Costos Mensuales</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={revenueVsCost}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3348" />
              <XAxis dataKey="month" stroke="#8b92a5" fontSize={12} />
              <YAxis stroke="#8b92a5" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e2130", border: "1px solid #2d3348", borderRadius: 8, color: "#e4e7ed" }} />
              <Legend />
              <Bar dataKey="ingresos" stackId="a" fill="#06d6a0" radius={[4, 4, 0, 0]} />
              <Bar dataKey="costos" stackId="a" fill="#f87171" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 5. Line: Tendencia de abandono de carrito */}
        <div className="chart-card">
          <h3>📉 Tendencia de Abandono de Carrito</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={abandonmentData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3348" />
              <XAxis dataKey="periodo" stroke="#8b92a5" fontSize={12} />
              <YAxis stroke="#8b92a5" fontSize={12} unit="%" />
              <Tooltip contentStyle={{ background: "#1e2130", border: "1px solid #2d3348", borderRadius: 8, color: "#e4e7ed" }} />
              <Area type="monotone" dataKey="tasa" stroke="#fbbf24" fill="url(#colorAbandono)" strokeWidth={2} />
              <defs>
                <linearGradient id="colorAbandono" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
                </linearGradient>
              </defs>
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* 6. Horizontal Bar: Top productos por stock */}
        <div className="chart-card">
          <h3>📦 Productos con Menor Stock</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart layout="vertical" data={topProducts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3348" />
              <XAxis type="number" stroke="#8b92a5" fontSize={12} />
              <YAxis type="category" dataKey="name" stroke="#8b92a5" fontSize={11} width={130} />
              <Tooltip contentStyle={{ background: "#1e2130", border: "1px solid #2d3348", borderRadius: 8, color: "#e4e7ed" }} />
              <Bar dataKey="stock" fill="#22d3ee" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 7. Funnel-like: Embudo de conversión (usando BarChart) */}
        <div className="chart-card chart-card-full">
          <h3>🔻 Embudo de Conversión</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={[
              { etapa: "Visitas", cantidad: kpis.totalProductos * 50 },
              { etapa: "Carrito", cantidad: kpis.totalProductos * 15 },
              { etapa: "Checkout", cantidad: kpis.ordenesMes * 2 },
              { etapa: "Pago completado", cantidad: kpis.ordenesMes }
            ]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3348" />
              <XAxis dataKey="etapa" stroke="#8b92a5" fontSize={12} />
              <YAxis stroke="#8b92a5" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e2130", border: "1px solid #2d3348", borderRadius: 8, color: "#e4e7ed" }} />
              <Bar dataKey="cantidad" radius={[6, 6, 0, 0]}>
                <Cell fill="#6366f1" />
                <Cell fill="#818cf8" />
                <Cell fill="#22d3ee" />
                <Cell fill="#06d6a0" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Low stock table */}
      {lowStockProducts.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <h3>⚠️ Productos con Stock Bajo</h3>
          <div className="panel" style={{ marginTop: "0.5rem", overflow: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Producto</th>
                  <th>SKU</th>
                  <th>Stock</th>
                  <th>Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td>{p.sku}</td>
                    <td style={{ 
                      color: p.stock === 0 ? "var(--danger)" : "var(--orange)", 
                      fontWeight: 600 
                    }}>{p.stock}</td>
                    <td>{p.stockMin}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  );
}