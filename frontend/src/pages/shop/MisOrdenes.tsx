import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { orderService } from "../../services/order.service";
import type { Order } from "../../types";

const STATUS_BADGE: Record<string, string> = {
  PENDIENTE_PAGO: "badge-pending", PAGADA: "badge-paid", EN_PROCESO: "badge-process",
  ENVIADA: "badge-shipped", ENTREGADA: "badge-delivered", CANCELADA: "badge-cancelled", DEVUELTA: "badge-returned"
};

export function MyOrdersPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["mis-ordenes"],
    queryFn: () => orderService.myOrders()
  });

  const orders: Order[] = data?.data ?? [];

  return (
    <section>
      <p className="section-label">Tu cuenta</p>
      <h2 className="section-title">Mis Órdenes.</h2>

      {isLoading && <p className="hint">Cargando órdenes...</p>}
      {error && <p className="error">No se pudieron cargar las órdenes.</p>}

      {orders.length === 0 && !isLoading && (
        <div className="empty-state">
          <p style={{ marginBottom: "1rem" }}>Aún no tienes órdenes.</p>
          <Link to="/catalogo" className="primary-link">Explorar catálogo</Link>
        </div>
      )}

      <div className="orders-grid">
        {orders.map((order) => (
          <Link key={order.id} to={`/orden/${order.id}`} style={{ textDecoration: "none", color: "inherit" }}>
            <article className="card" style={{ padding: "1.3rem", cursor: "pointer" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                <span style={{ fontWeight: 700, fontSize: "0.95rem" }}>{order.code}</span>
                <span className={`badge ${STATUS_BADGE[order.status] ?? ""}`}>{order.status.replace(/_/g, " ")}</span>
              </div>
              <p style={{ fontSize: "1.2rem", fontWeight: 700, margin: "0.3rem 0" }}>S/{Number(order.total).toFixed(2)}</p>
              <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>
                {new Date(order.createdAt).toLocaleDateString()} · {order.items?.length ?? 0} productos · {order.paymentMethod ?? "—"}
              </p>
              <p style={{ color: "var(--brand-light)", fontSize: "0.78rem", marginTop: "0.5rem", fontWeight: 500 }}>
                Ver detalle →
              </p>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}