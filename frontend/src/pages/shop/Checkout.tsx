import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuthStore } from "../../stores/authStore";
import { useCartStore } from "../../stores/cartStore";
import { cartService } from "../../services/cart.service";
import { orderService } from "../../services/order.service";
import { paymentService } from "../../services/payment.service";
import toast from "react-hot-toast";

// Stripe Imports
import { loadStripe } from "@stripe/stripe-js";
import { Elements, CardElement, useStripe, useElements } from "@stripe/react-stripe-js";

const stripePromise = loadStripe("pk_test_51TQq0fKboTtxtJwZ1hoVKdWRp5tmQuYQKs94r5MVMTRQ53n9UxhHXEegcWL2ZV053WMpVn8ooN7GKdzWK3Pb5CZo00CWDEWtuf");

const STEPS = ["Dirección", "Envío", "Pago", "Revisión"];

export function CheckoutPage() {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutContent />
    </Elements>
  );
}

function CheckoutContent() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const items = useCartStore((state) => state.items);
  const clearCart = useCartStore((state) => state.clear);

  const stripe = useStripe();
  const elements = useElements();

  const [step, setStep] = useState(0);
  const [fullName, setFullName] = useState(user ? `${user.firstName} ${user.lastName}` : "");
  const [line1, setLine1] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("Peru");
  const [phone, setPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"tarjeta" | "transferencia" | "contra_entrega">("tarjeta");
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);

  // Theme detection for Stripe styles
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "dark"
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      const currentTheme = document.documentElement.getAttribute("data-theme") as "light" | "dark";
      setTheme(currentTheme || "dark");
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);

  const subtotal = items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const tax = subtotal * (0.18 / 1.18);
  const total = subtotal;

  async function handleConfirm() {
    if (!user) { navigate("/login"); return; }
    if (!items.length) { toast.error("Carrito vacío"); return; }

    setLoading(true);

    try {
      if (paymentMethod === "tarjeta") {
        if (!stripe || !elements) {
          toast.error("Stripe no está listo");
          setLoading(false);
          return;
        }

        setPaying(true);

        const intentResp = await paymentService.createIntent(total, `TEMP-${Date.now()}`);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
          throw new Error("El campo de tarjeta no está disponible.");
        }

        const result = await stripe.confirmCardPayment(intentResp.clientSecret, {
          payment_method: {
            card: cardElement,
            billing_details: { name: fullName, phone: phone }
          }
        });

        if (result.error) {
          throw new Error(result.error.message || "Error al procesar el pago");
        }

        if (result.paymentIntent?.status !== "succeeded") {
          throw new Error("El pago no fue completado con éxito");
        }

        setPaying(false);
      } else {
        setPaying(true);
        await new Promise(r => setTimeout(r, 1500));
        setPaying(false);
      }

      await cartService.sync(items.map((i) => ({ productId: i.productId, quantity: i.quantity })));
      const response = await orderService.checkout({
        paymentMethod,
        shippingCost: 0,
        discount: 0,
        address: { fullName, line1, city, state, postalCode, country, phone }
      });

      clearCart();
      toast.success(`Orden confirmada: ${response.data?.code ?? "OK"}`);
      navigate("/mis-ordenes");

    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error en el proceso de compra.");
    } finally {
      setLoading(false);
      setPaying(false);
    }
  }

  const stripeColor = theme === "dark" ? "#ffffff" : "#1a1a2e";
  const stripePlaceholder = theme === "dark" ? "#8b92a5" : "#6b7280";

  return (
    <section>
      <h2>Checkout Seguro</h2>
      <div className="wizard-steps">
        {STEPS.map((s, i) => (
          <div key={s} className={`wizard-step ${i === step ? "active" : i < step ? "done" : ""}`}>{i + 1}. {s}</div>
        ))}
      </div>

      <div className="panel">
        {/* ── Step 0: Dirección ── */}
        {step === 0 && (
          <div className="form">
            <h3>Dirección de Envío</h3>
            <div className="form-row">
              <label>Nombre completo<input value={fullName} onChange={(e) => setFullName(e.target.value)} required /></label>
              <label>Teléfono<input value={phone} onChange={(e) => setPhone(e.target.value)} required /></label>
            </div>
            <label>Dirección<input value={line1} onChange={(e) => setLine1(e.target.value)} required /></label>
            <div className="form-row-3">
              <label>Ciudad<input value={city} onChange={(e) => setCity(e.target.value)} required /></label>
              <label>Departamento<input value={state} onChange={(e) => setState(e.target.value)} required /></label>
              <label>Código postal<input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} required /></label>
            </div>
            <label>País<input value={country} onChange={(e) => setCountry(e.target.value)} required /></label>
            <button onClick={() => setStep(1)} disabled={!fullName || !line1 || !city}>Siguiente →</button>
          </div>
        )}

        {/* ── Step 1: Envío ── */}
        {step === 1 && (
          <div className="form">
            <h3>Método de Envío</h3>
            <div className="card" style={{ cursor: "pointer", borderColor: "var(--brand)" }}>
              <h3>📦 Envío Estándar</h3>
              <p>3-5 días hábiles — Gratis</p>
            </div>
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1rem" }}>
              <button className="btn-outline" onClick={() => setStep(0)}>← Anterior</button>
              <button onClick={() => setStep(2)}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* ── Step 2: Pago ── */}
        {step === 2 && (
          <div className="form">
            <h3>Método de Pago</h3>
            <label>Selecciona un método
              <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as typeof paymentMethod)}>
                <option value="tarjeta">💳 Tarjeta de crédito/débito (Stripe)</option>
                <option value="transferencia">🏦 Transferencia bancaria</option>
                <option value="contra_entrega">🚚 Contra entrega</option>
              </select>
            </label>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button className="btn-outline" onClick={() => setStep(1)}>← Anterior</button>
              <button onClick={() => setStep(3)}>Siguiente →</button>
            </div>
          </div>
        )}

        {/* ── Step 3: Revisión ── */}
        {step === 3 && (
          <div className="form">
            <h3>Revisión del Pedido</h3>
            <div style={{ background: "var(--bg-2)", borderRadius: "var(--radius)", padding: "1.5rem" }}>
              <div style={{ marginBottom: "1rem" }}>
                <p><strong>Dirección:</strong> {fullName}, {line1}, {city}, {state} {postalCode}</p>
                <p><strong>Pago:</strong> {paymentMethod === "tarjeta" ? "Stripe (Tarjeta)" : paymentMethod}</p>
              </div>

              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "1rem" }}>
                {items.map((i) => (
                  <div key={i.productId} style={{ display: "flex", justifyContent: "space-between", margin: "0.4rem 0", fontSize: "0.9rem" }}>
                    <span>{i.name} x{i.quantity}</span>
                    <span>S/ {(i.unitPrice * i.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div style={{ borderTop: "1px solid var(--border)", marginTop: "1rem", paddingTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.9rem" }}><span>Subtotal</span><span>S/ {subtotal.toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-muted)", fontSize: "0.82rem" }}><span>IGV incluido (18%)</span><span>S/ {tax.toFixed(2)}</span></div>
                <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "1.2rem", marginTop: "0.8rem" }}>
                  <span>Total</span><span style={{ color: "var(--accent)" }}>S/ {total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "1.5rem" }}>
              <button className="btn-outline" onClick={() => setStep(2)}>← Anterior</button>
              <button onClick={handleConfirm} disabled={loading} style={{ flex: 1, height: "48px", fontSize: "1rem" }}>
                {loading ? "Procesando..." : "✓ Finalizar Compra"}
              </button>
            </div>
          </div>
        )}

        {/* ─── CardElement Persistent Container ─── */}
        {paymentMethod === "tarjeta" && step >= 2 && (
          <div
            key={theme} // FORCES RE-RENDER OF STRIPE ELEMENT WHEN THEME CHANGES
            style={{
              position: step === 2 ? "static" : "absolute",
              visibility: step === 2 ? "visible" : "hidden",
              left: step === 2 ? "auto" : "-9999px",
              pointerEvents: step === 2 ? "auto" : "none",
              marginTop: step === 2 ? "1.2rem" : "0",
              padding: step === 2 ? "1.2rem" : "0",
              border: step === 2 ? "1px solid var(--border)" : "none",
              borderRadius: "var(--radius)",
              background: "var(--bg-3)",
              display: "block"
            }}
          >
            {step === 2 && (
              <>
                <p style={{ fontSize: "0.85rem", marginBottom: "0.4rem", color: "var(--text-muted)" }}>Datos de la tarjeta (Stripe)</p>
                <p style={{ fontSize: "0.75rem", marginBottom: "1rem", color: "var(--accent)", fontWeight: 500 }}>
                  🧪 Prueba: <strong>4242 4242 4242 4242</strong> · Exp: 12/34 · CVC: 123 · C.P.: 12345
                </p>
              </>
            )}
            <CardElement
              options={{
                style: {
                  base: {
                    color: stripeColor,
                    fontSize: "16px",
                    fontFamily: "Inter, system-ui, sans-serif",
                    "::placeholder": { color: stripePlaceholder }
                  },
                  invalid: {
                    color: "#ff453a",
                  }
                }
              }}
            />
          </div>
        )}
      </div>

      {paying && (
        <div className="modal-overlay">
          <div className="modal" style={{ textAlign: "center", width: "320px", padding: "2rem" }}>
            <div className="spinner" style={{
              width: "48px",
              height: "48px",
              border: "4px solid var(--border)",
              borderTopColor: "var(--brand)",
              borderRadius: "50%",
              margin: "0 auto 1.5rem",
              animation: "spin 1s linear infinite"
            }}></div>
            <h3 style={{ marginBottom: "0.5rem" }}>Validando Pago</h3>
            <p className="hint" style={{ fontSize: "0.85rem" }}>Por favor no cierres esta ventana mientras procesamos la transacción.</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}
    </section>
  );
}