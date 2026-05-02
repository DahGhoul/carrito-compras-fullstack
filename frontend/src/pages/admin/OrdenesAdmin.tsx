import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Order, OrderStatus } from "../../types";

const STATUS_OPTIONS: OrderStatus[] = [
  "PENDIENTE_PAGO", "PAGADA", "EN_PROCESO", "ENVIADA", "ENTREGADA", "CANCELADA", "DEVUELTA"
];

const STATUS_BADGE: Record<string, string> = {
  PENDIENTE_PAGO: "badge-pending",
  PAGADA: "badge-paid",
  EN_PROCESO: "badge-process",
  ENVIADA: "badge-shipped",
  ENTREGADA: "badge-delivered",
  CANCELADA: "badge-cancelled",
  DEVUELTA: "badge-returned"
};

const STATUS_LABEL: Record<string, string> = {
  PENDIENTE_PAGO: "Pendiente de pago",
  PAGADA: "Pagada",
  EN_PROCESO: "En proceso",
  ENVIADA: "Enviada",
  ENTREGADA: "Entregada",
  CANCELADA: "Cancelada",
  DEVUELTA: "Devuelta"
};

export function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: () => adminService.allOrders()
  });

  const orders: Order[] = data ?? [];
  const filtered = statusFilter === "all" ? orders : orders.filter((o) => o.status === statusFilter);

  return (
    <section>
      <div className="page-header">
        <h2>Gestión de Órdenes</h2>
      </div>

      <div className="toolbar">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">Todos los estados</option>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
      </div>

      {isLoading ? <p className="hint">Cargando órdenes...</p> : (
        <div className="panel" style={{ overflow: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Cliente</th>
                <th>Estado</th>
                <th>Total</th>
                <th>Pago</th>
                <th>Fecha</th>
                <th>Items</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td style={{ fontWeight: 600 }}>{order.code}</td>
                  <td>{order.user ? `${order.user.firstName} ${order.user.lastName}` : order.userId.substring(0, 8)}</td>
                  <td><span className={`badge ${STATUS_BADGE[order.status] ?? ""}`}>{STATUS_LABEL[order.status] ?? order.status}</span></td>
                  <td style={{ fontWeight: 600, color: "var(--accent)" }}>S/ {Number(order.total).toFixed(2)}</td>
                  <td>{order.paymentMethod ?? "—"}</td>
                  <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td>{order.items?.length ?? 0}</td>
                  <td>
                    <button className="btn-ghost btn-sm" onClick={() => setSelectedOrderId(order.id)}>
                      Ver detalle
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="hint" style={{ marginTop: "0.5rem" }}>{filtered.length} órdenes</p>
        </div>
      )}

      {selectedOrderId && (
        <OrderDetailModal
          orderId={selectedOrderId}
          onClose={() => setSelectedOrderId(null)}
          onStatusChanged={() => queryClient.invalidateQueries({ queryKey: ["admin-orders"] })}
        />
      )}
    </section>
  );
}

/* ─── Order Detail Modal ──────────────────────────────── */
function OrderDetailModal({
  orderId,
  onClose,
  onStatusChanged
}: {
  orderId: string;
  onClose: () => void;
  onStatusChanged: () => void;
}) {
  const queryClient = useQueryClient();
  const [newStatus, setNewStatus] = useState<OrderStatus>("PAGADA");
  const [comment, setComment] = useState("");
  const [showStatusForm, setShowStatusForm] = useState(false);

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => adminService.getOrderById(orderId),
    enabled: !!orderId
  });

  const updateMutation = useMutation({
    mutationFn: ({ status, comment }: { status: string; comment: string }) =>
      adminService.updateOrderStatus(orderId, status, comment),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order-detail", orderId] });
      onStatusChanged();
      toast.success("Estado actualizado");
      setShowStatusForm(false);
      setComment("");
    }
  });

  // Init newStatus when order loads
  const currentStatus = order?.status as OrderStatus | undefined;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(720px, 95vw)" }}
      >
        {isLoading || !order ? (
          <p className="hint" style={{ textAlign: "center", padding: "2rem 0" }}>Cargando...</p>
        ) : (
          <>
            {/* ── Header ── */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.4rem", flexWrap: "wrap", gap: "0.5rem" }}>
              <div>
                <h2 style={{ marginBottom: "0.25rem" }}>{order.code}</h2>
                <p className="hint">{new Date(order.createdAt).toLocaleString()}</p>
              </div>
              <span className={`badge ${STATUS_BADGE[order.status] ?? ""}`} style={{ fontSize: "0.78rem", padding: "0.3rem 0.8rem" }}>
                {STATUS_LABEL[order.status] ?? order.status}
              </span>
            </div>

            {/* ── Customer + Address ── */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.2rem" }}>
              <div style={{ background: "var(--bg-3)", borderRadius: "var(--radius)", padding: "0.9rem 1rem" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.4rem" }}>Cliente</p>
                {order.user ? (
                  <>
                    <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{order.user.firstName} {order.user.lastName}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{order.user.email}</p>
                  </>
                ) : <p className="hint">—</p>}
              </div>
              <div style={{ background: "var(--bg-3)", borderRadius: "var(--radius)", padding: "0.9rem 1rem" }}>
                <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.4rem" }}>Dirección</p>
                {order.address ? (
                  <>
                    <p style={{ fontWeight: 600, fontSize: "0.88rem" }}>{order.address.fullName}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{order.address.line1}{order.address.line2 ? `, ${order.address.line2}` : ""}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>{order.address.city}, {order.address.state} {order.address.postalCode}</p>
                    <p style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>☎ {order.address.phone}</p>
                  </>
                ) : <p className="hint">Sin dirección</p>}
              </div>
            </div>

            {/* ── Items Table ── */}
            <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.5rem" }}>Productos</p>
            <div style={{ background: "var(--bg-3)", borderRadius: "var(--radius)", overflow: "hidden", marginBottom: "1.2rem" }}>
              <table className="data-table" style={{ fontSize: "0.78rem" }}>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th style={{ textAlign: "right" }}>P. Unit.</th>
                    <th style={{ textAlign: "center" }}>Cant.</th>
                    <th style={{ textAlign: "right" }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <span style={{ fontWeight: 500 }}>{item.product?.name ?? item.productId}</span>
                        {item.product?.sku && <span style={{ display: "block", fontSize: "0.68rem", color: "var(--text-muted)" }}>SKU: {item.product.sku}</span>}
                      </td>
                      <td style={{ textAlign: "right" }}>S/ {Number(item.unitPrice).toFixed(2)}</td>
                      <td style={{ textAlign: "center" }}>{item.quantity}</td>
                      <td style={{ textAlign: "right", fontWeight: 600 }}>S/ {Number(item.subtotal).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Totals ── */}
            <div style={{ background: "var(--bg-3)", borderRadius: "var(--radius)", padding: "0.9rem 1rem", marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                <span>Subtotal</span><span>S/ {Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                <span>IGV incluido (18%)</span><span>S/ {Number(order.tax).toFixed(2)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "0.3rem" }}>
                <span>Envío</span><span>S/ {Number(order.shipping).toFixed(2)}</span>
              </div>
              {Number(order.discount) > 0 && (
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--danger)", marginBottom: "0.3rem" }}>
                  <span>Descuento</span><span>−S/ {Number(order.discount).toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1rem", borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.3rem" }}>
                <span>Total</span><span style={{ color: "var(--accent)" }}>S/ {Number(order.total).toFixed(2)}</span>
              </div>
            </div>

            {/* ── Status History ── */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <>
                <p style={{ fontSize: "0.68rem", fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: "0.6rem" }}>Historial de estados</p>
                <div className="order-timeline" style={{ marginBottom: "1.2rem" }}>
                  {[...order.statusHistory].reverse().map((h) => (
                    <div key={h.id} className="timeline-item">
                      <p>
                        <span className={`badge ${STATUS_BADGE[h.status] ?? ""}`} style={{ marginRight: "0.4rem" }}>
                          {STATUS_LABEL[h.status] ?? h.status}
                        </span>
                        {h.comment && <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>— {h.comment}</span>}
                      </p>
                      <small>{new Date(h.changedAt).toLocaleString()}</small>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* ── Change Status ── */}
            {!showStatusForm ? (
              <div className="modal-actions">
                <button className="btn-outline" onClick={onClose}>Cerrar</button>
                <button onClick={() => { setNewStatus(currentStatus ?? "PAGADA"); setShowStatusForm(true); }}>
                  Cambiar estado
                </button>
              </div>
            ) : (
              <div style={{ background: "var(--bg-3)", borderRadius: "var(--radius)", padding: "1rem", marginTop: "0.5rem" }}>
                <p style={{ fontSize: "0.82rem", fontWeight: 600, marginBottom: "0.8rem" }}>Cambiar estado de la orden</p>
                <div className="form">
                  <label>Nuevo estado
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as OrderStatus)}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </label>
                  <label>Comentario <span style={{ color: "var(--text-muted)" }}>(opcional)</span>
                    <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Motivo del cambio..." rows={2} />
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button className="btn-outline" onClick={() => setShowStatusForm(false)}>Cancelar</button>
                    <button
                      disabled={updateMutation.isPending}
                      onClick={() => updateMutation.mutate({ status: newStatus, comment })}
                    >
                      {updateMutation.isPending ? "Actualizando..." : "Actualizar estado"}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
