import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const COLORS = ["#6366f1", "#06d6a0", "#22d3ee", "#fbbf24", "#f87171"];

export function AdminInventoryPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["admin-products-inventory"],
    queryFn: () => adminService.allProducts({ limit: 100 })
  });

  const products = data?.data ?? [];
  const lowStock = products.filter((p) => p.stock <= (p.stockMin ?? 5));
  const outOfStock = products.filter((p) => p.stock === 0);
  const totalValue = products.reduce((acc, p) => acc + Number(p.priceCost ?? p.priceSale) * p.stock, 0);

  const stockByCategory = products.reduce<Record<string, number>>((acc, p) => {
    const cat = p.category?.name ?? "Sin categoría";
    acc[cat] = (acc[cat] ?? 0) + p.stock;
    return acc;
  }, {});

  const chartData = Object.entries(stockByCategory).map(([name, stock]) => ({ name, stock }));

  return (
    <section>
      <div className="page-header">
        <h2>Gestión de Inventario</h2>
      </div>

      <div className="kpi-grid">
        <article className="kpi"><h3>Total Productos</h3><p>{products.length}</p></article>
        <article className="kpi kpi-accent"><h3>Valor del Inventario</h3><p>S/ {totalValue.toFixed(0)}</p></article>
        <article className="kpi kpi-warning"><h3>Stock Bajo</h3><p>{lowStock.length}</p></article>
        <article className="kpi kpi-danger"><h3>Agotados</h3><p>{outOfStock.length}</p></article>
      </div>

      <div className="charts-grid">
        <div className="chart-card chart-card-full">
          <h3>📦 Stock por Categoría</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2d3348" />
              <XAxis dataKey="name" stroke="#8b92a5" fontSize={12} />
              <YAxis stroke="#8b92a5" fontSize={12} />
              <Tooltip contentStyle={{ background: "#1e2130", border: "1px solid #2d3348", borderRadius: 8, color: "#e4e7ed" }} />
              <Bar dataKey="stock" radius={[6, 6, 0, 0]}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {isLoading ? <p className="hint">Cargando...</p> : (
        <div className="panel" style={{ overflow: "auto", marginTop: "1rem" }}>
          <h3 style={{ marginBottom: "0.7rem" }}>Detalle de Stock</h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Producto</th>
                <th>Categoría</th>
                <th>Stock</th>
                <th>Mínimo</th>
                <th>Valor (costo)</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const isLow = p.stock <= (p.stockMin ?? 5);
                return (
                  <tr key={p.id}>
                    <td>{p.sku}</td>
                    <td>{p.name}</td>
                    <td>{p.category?.name ?? "—"}</td>
                    <td style={{ 
                      color: p.stock === 0 ? "var(--danger)" : isLow ? "var(--orange)" : "var(--success)", 
                      fontWeight: 600 
                    }}>{p.stock}</td>
                    <td>{p.stockMin ?? 5}</td>
                    <td>S/ {(Number(p.priceCost ?? p.priceSale) * p.stock).toFixed(0)}</td>
                    <td>
                      {p.stock === 0 ? <span className="badge badge-cancelled">Agotado</span>
                        : isLow ? <span className="badge badge-pending">Bajo</span>
                        : <span className="badge badge-delivered">OK</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
