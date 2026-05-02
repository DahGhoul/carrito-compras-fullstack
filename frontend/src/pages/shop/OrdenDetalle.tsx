import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { orderService } from "../../services/order.service";
import { getProductImage } from "../../utils/image";
import type { Order } from "../../types";

const STATUS_BADGE: Record<string, string> = {
  PENDIENTE_PAGO: "badge-pending", PAGADA: "badge-paid", EN_PROCESO: "badge-process",
  ENVIADA: "badge-shipped", ENTREGADA: "badge-delivered", CANCELADA: "badge-cancelled", DEVUELTA: "badge-returned"
};

export function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["mis-ordenes"],
    queryFn: () => orderService.myOrders()
  });

  const orders: Order[] = data?.data ?? [];
  const order = orders.find((o) => o.id === id);

  if (isLoading) return <section><p className="hint" style={{ padding: "3rem", textAlign: "center" }}>Cargando orden...</p></section>;
  if (!order) return <section><p className="error" style={{ padding: "3rem", textAlign: "center" }}>Orden no encontrada.</p></section>;

  const subtotal = Number(order.subtotal);
  const tax = Number(order.tax);
  const shipping = Number(order.shipping);
  const discount = Number(order.discount);
  const total = Number(order.total);

  return (
    <section>
      <Link to="/mis-ordenes" style={{ fontSize: "0.82rem", color: "var(--brand-light)", marginBottom: "1.5rem", display: "inline-block" }}>
        ← Mis Órdenes
      </Link>

      <div className="order-detail-header">
        <div>
          <p className="section-label">Orden</p>
          <h2 className="section-title" style={{ marginBottom: "0.3rem" }}>{order.code}</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.85rem" }}>
            {new Date(order.createdAt).toLocaleDateString("es-PE", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <span className={`badge ${STATUS_BADGE[order.status] ?? ""}`} style={{ fontSize: "0.82rem", padding: "0.4rem 1rem" }}>
          {order.status.replace(/_/g, " ")}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "2rem" }}>
        {/* Items */}
        <div>
          <h3 style={{ marginBottom: "1rem" }}>Productos ({order.items.length})</h3>
          <div className="panel" style={{ padding: 0, overflow: "hidden" }}>
            {order.items.map((item, i) => (
              <div key={item.id} style={{
                display: "grid", gridTemplateColumns: "72px 1fr auto", gap: "1rem", padding: "1rem 1.2rem",
                alignItems: "center", borderBottom: i < order.items.length - 1 ? "1px solid var(--border)" : "none"
              }}>
                <div style={{ width: 72, height: 72, borderRadius: "var(--radius)", background: "var(--bg-3)", overflow: "hidden" }}>
                  <img 
                    src={item.product ? getProductImage(item.product) : "https://loremflickr.com/200/200/product"} 
                    alt="" 
                    style={{ width: "100%", height: "100%", objectFit: "cover" }} 
                  />
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{item.product?.name ?? `Producto`}</p>
                  <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>Cantidad: {item.quantity} × S/{Number(item.unitPrice).toFixed(2)}</p>
                </div>
                <p style={{ fontWeight: 600, fontSize: "0.95rem" }}>S/{Number(item.subtotal).toFixed(2)}</p>
              </div>
            ))}
          </div>

          {/* Timeline */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ marginBottom: "1rem" }}>Historial de Estado</h3>
              <div className="order-timeline">
                {order.statusHistory.map((h) => (
                  <div key={h.id} className="timeline-item">
                    <p>
                      <span className={`badge ${STATUS_BADGE[h.status] ?? ""}`} style={{ marginRight: "0.5rem" }}>
                        {h.status.replace(/_/g, " ")}
                      </span>
                      {h.comment && <span style={{ color: "var(--text-muted)" }}>— {h.comment}</span>}
                    </p>
                    <small>{new Date(h.changedAt).toLocaleString()}</small>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Summary sidebar */}
        <div>
          <div className="panel" style={{ position: "sticky", top: "68px" }}>
            <h3 style={{ marginBottom: "1.2rem", fontSize: "1rem" }}>Resumen</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.88rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "var(--text-muted)" }}>Subtotal</span><span>S/{subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem" }}>
                <span style={{ color: "var(--text-muted)" }}>IGV incluido (18%)</span><span style={{ color: "var(--text-muted)" }}>S/{tax.toFixed(2)}</span>
              </div>
              {shipping > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--text-muted)" }}>Envío</span><span>S/{shipping.toFixed(2)}</span>
                </div>
              )}
              {discount > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ color: "var(--accent)" }}>Descuento</span><span style={{ color: "var(--accent)" }}>-S/{discount.toFixed(2)}</span>
                </div>
              )}
              <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.3rem 0" }} />
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.15rem" }}>
                <span>Total</span><span>S/{total.toFixed(2)}</span>
              </div>
            </div>

            {order.paymentMethod && (
              <div style={{ marginTop: "1.5rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "0.3rem" }}>Método de pago</p>
                <p style={{ fontWeight: 600, fontSize: "0.88rem", textTransform: "capitalize" }}>{order.paymentMethod.replace(/_/g, " ")}</p>
              </div>
            )}

            {order.address && (
              <div style={{ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid var(--border)" }}>
                <p style={{ color: "var(--text-muted)", fontSize: "0.78rem", marginBottom: "0.3rem" }}>Dirección de envío</p>
                <p style={{ fontSize: "0.85rem", lineHeight: 1.5 }}>
                  {order.address.fullName}<br />
                  {order.address.line1}<br />
                  {order.address.city}, {order.address.state} {order.address.postalCode}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
