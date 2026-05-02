import { useQuery } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import type { Order } from "../../types";

export function AdminClientsPage() {
  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["admin-orders-clients"],
    queryFn: () => adminService.allOrders()
  });
  const { data: dashData } = useQuery({
    queryKey: ["admin-dashboard-clients"],
    queryFn: () => adminService.dashboard()
  });

  const orders: Order[] = ordersData ?? [];
  const totalClients = dashData?.data?.kpis?.totalClientes ?? 0;

  const clientMap = new Map<string, { userId: string; name: string; email: string; totalOrders: number; totalSpent: number; lastOrder: string }>();
  orders.forEach((o) => {
    const key = o.userId;
    const name = o.user ? `${o.user.firstName} ${o.user.lastName}` : key.substring(0, 8);
    const email = o.user?.email ?? "—";
    const existing = clientMap.get(key);
    if (existing) {
      existing.totalOrders++;
      existing.totalSpent += Number(o.total);
      if (o.createdAt > existing.lastOrder) existing.lastOrder = o.createdAt;
    } else {
      clientMap.set(key, { userId: key, name, email, totalOrders: 1, totalSpent: Number(o.total), lastOrder: o.createdAt });
    }
  });
  const clients = Array.from(clientMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <section>
      <div className="page-header">
        <h2>Gestión de Clientes</h2>
      </div>
      <div className="kpi-grid">
        <article className="kpi kpi-brand"><h3>Total Clientes</h3><p>{totalClients}</p></article>
        <article className="kpi kpi-accent"><h3>Con Compras</h3><p>{clients.length}</p></article>
        <article className="kpi"><h3>VIP (&gt;S/1000)</h3><p>{clients.filter((c) => c.totalSpent > 1000).length}</p></article>
      </div>
      {isLoading ? <p className="hint">Cargando...</p> : (
        <div className="panel" style={{ overflow: "auto" }}>
          <table className="data-table">
            <thead><tr><th>Nombre</th><th>Email</th><th>Órdenes</th><th>Total</th><th>Última Compra</th><th>Segmento</th></tr></thead>
            <tbody>
              {clients.map((c) => (
                <tr key={c.userId}>
                  <td style={{ fontWeight: 500 }}>{c.name}</td><td>{c.email}</td><td>{c.totalOrders}</td>
                  <td style={{ color: "var(--accent)", fontWeight: 600 }}>S/ {c.totalSpent.toFixed(2)}</td>
                  <td>{new Date(c.lastOrder).toLocaleDateString()}</td>
                  <td><span className={`badge ${c.totalSpent > 1000 ? "badge-paid" : c.totalOrders > 3 ? "badge-delivered" : "badge-process"}`}>
                    {c.totalSpent > 1000 ? "VIP" : c.totalOrders > 3 ? "Recurrente" : "Nuevo"}
                  </span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
