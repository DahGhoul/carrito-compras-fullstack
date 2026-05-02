import { Link } from "react-router-dom";
import { useCartStore } from "../../stores/cartStore";
import toast from "react-hot-toast";

export function CartPage() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const clear = useCartStore((state) => state.clear);

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const tax = subtotal * (0.18 / 1.18); // IGV incluido en precio
  const total = subtotal; // el total ES el subtotal, IGV ya incluido

  return (
    <section>
      <h2>Carrito de Compras</h2>

      {!items.length ? (
        <div className="empty-state">
          <p>No hay productos en el carrito.</p>
          <Link to="/catalogo" className="primary-link" style={{ marginTop: "1rem", display: "inline-block" }}>
            Explorar catálogo →
          </Link>
        </div>
      ) : (
        <div className="cart-list">
          <div>
            {items.map((item) => (
              <article key={item.productId} className="cart-item">
                <img src={item.imageUrl || "https://picsum.photos/300/300"} alt={item.name} />
                <div>
                  <h3>{item.name}</h3>
                  <p>S/ {item.unitPrice.toFixed(2)}</p>
                  <div className="row-actions">
                    <button className="btn-outline btn-sm" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>-</button>
                    <span style={{ minWidth: 24, textAlign: "center" }}>{item.quantity}</span>
                    <button className="btn-outline btn-sm" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>+</button>
                    <button className="btn-ghost btn-sm" style={{ color: "var(--danger)" }}
                      onClick={() => { removeItem(item.productId); toast.success("Eliminado del carrito"); }}>
                      Eliminar
                    </button>
                  </div>
                </div>
              </article>
            ))}
            <button className="btn-outline btn-sm" onClick={() => { clear(); toast.success("Carrito vaciado"); }}>
              Vaciar carrito
            </button>
          </div>

          <aside className="checkout-summary">
            <h3>Resumen</h3>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "0.3rem 0" }}>
              <span className="hint">Subtotal</span><span>S/ {subtotal.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", margin: "0.3rem 0" }}>
              <span className="hint">IGV incluido (18%)</span><span style={{ color: "var(--text-muted)" }}>S/ {tax.toFixed(2)}</span>
            </div>
            <hr style={{ border: "none", borderTop: "1px solid var(--border)", margin: "0.7rem 0" }} />
            <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.1rem" }}>
              <span>Total</span><span style={{ color: "var(--accent)" }}>S/ {total.toFixed(2)}</span>
            </div>
            <Link to="/checkout" className="primary-link" style={{ display: "block", textAlign: "center", marginTop: "1rem" }}>
              Ir al checkout →
            </Link>
          </aside>
        </div>
      )}
    </section>
  );
}