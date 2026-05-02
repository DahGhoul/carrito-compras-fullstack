import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { productService } from "../../services/product.service";
import { useCartStore } from "../../stores/cartStore";
import { getProductImage } from "../../utils/image";
import toast from "react-hot-toast";
import { useState } from "react";

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const addProduct = useCartStore((state) => state.addProduct);
  const [qty, setQty] = useState(1);
  const [mainImage, setMainImage] = useState(0);

  const { data: product, isLoading, error } = useQuery({
    queryKey: ["producto", id],
    queryFn: () => productService.detail(id!),
    enabled: !!id
  });

  if (isLoading) return <section><p className="hint" style={{ padding: "3rem", textAlign: "center" }}>Cargando producto...</p></section>;
  if (error || !product) return <section><p className="error" style={{ padding: "3rem", textAlign: "center" }}>Producto no encontrado.</p></section>;

  const price = Number(product.offerPrice ?? product.priceSale);
  const hasOffer = !!product.offerPrice;
  const discount = hasOffer ? Math.round(((Number(product.priceSale) - Number(product.offerPrice!)) / Number(product.priceSale)) * 100) : 0;
  const images = product.images.length > 0
    ? product.images
    : [{ id: "ph", url: getProductImage(product), isMain: true }];

  return (
    <section>
      <Link to="/catalogo" style={{ fontSize: "0.82rem", color: "var(--brand-light)", marginBottom: "1.5rem", display: "inline-block" }}>
        ← Catálogo
      </Link>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", marginTop: "0.5rem" }}>
        {/* Image gallery */}
        <div>
          <div style={{
            background: "var(--bg-3)", borderRadius: "var(--radius-xl)", overflow: "hidden",
            aspectRatio: "1", display: "flex", alignItems: "center", justifyContent: "center"
          }}>
            <img src={images[mainImage]?.url} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.8rem" }}>
              {images.map((img, i) => (
                <div key={img.id} onClick={() => setMainImage(i)}
                  style={{
                    width: 64, height: 64, borderRadius: "var(--radius)", overflow: "hidden", cursor: "pointer",
                    border: i === mainImage ? "2px solid var(--brand)" : "2px solid var(--border)", background: "var(--bg-3)"
                  }}>
                  <img src={img.url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product info */}
        <div style={{ paddingTop: "0.5rem" }}>
          <p className="section-label" style={{ marginBottom: "0.3rem" }}>SKU: {product.sku}</p>
          <h1 style={{ fontSize: "2rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "0.5rem", lineHeight: 1.15 }}>
            {product.name}
          </h1>
          {product.category && <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "1.5rem" }}>{product.category.name}</p>}

          <div style={{ marginBottom: "1.8rem" }}>
            {hasOffer ? (
              <>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem" }}>
                  <span style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-0.03em" }}>S/{Number(product.offerPrice).toFixed(2)}</span>
                  <span style={{ textDecoration: "line-through", color: "var(--text-muted)", fontSize: "1.1rem" }}>S/{Number(product.priceSale).toFixed(2)}</span>
                  <span style={{ background: "rgba(255,69,58,0.12)", color: "var(--danger)", padding: "0.15rem 0.5rem", borderRadius: "980px", fontSize: "0.72rem", fontWeight: 700 }}>
                    -{discount}%
                  </span>
                </div>
              </>
            ) : (
              <span style={{ fontSize: "2.2rem", fontWeight: 700, letterSpacing: "-0.03em" }}>S/{Number(product.priceSale).toFixed(2)}</span>
            )}
          </div>

          <p style={{
            color: product.stock > 0 ? "var(--accent)" : "var(--danger)",
            fontWeight: 600, fontSize: "0.85rem", marginBottom: "1.5rem"
          }}>
            {product.stock > 0 ? `● En stock — ${product.stock} disponibles` : "● Agotado"}
          </p>

          {product.stock > 0 && (
            <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", marginBottom: "1.5rem" }}>
              <span style={{ color: "var(--text-muted)", fontSize: "0.85rem", fontWeight: 500 }}>Cantidad</span>
              <div className="row-actions">
                <button className="btn-outline btn-sm" onClick={() => setQty(Math.max(1, qty - 1))}>−</button>
                <span style={{ minWidth: 32, textAlign: "center", fontWeight: 600 }}>{qty}</span>
                <button className="btn-outline btn-sm" onClick={() => setQty(Math.min(product.stock, qty + 1))}>+</button>
              </div>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.6rem" }}>
            <button className="btn-lg" disabled={product.stock <= 0} style={{ flex: 1 }}
              onClick={() => { addProduct(product, qty); toast.success(`${product.name} (x${qty}) agregado al carrito`); }}>
              {product.stock > 0 ? "Agregar al carrito" : "No disponible"}
            </button>
            <Link to="/carrito" className="btn-outline btn-lg" style={{ textDecoration: "none", display: "flex", alignItems: "center" }}>
              🛒
            </Link>
          </div>

          {(product.descriptionShort || product.descriptionLong) && (
            <div style={{ marginTop: "2.5rem", paddingTop: "1.5rem", borderTop: "1px solid var(--border)" }}>
              <h3 style={{ fontSize: "0.95rem", fontWeight: 600, marginBottom: "0.7rem" }}>Descripción</h3>
              <p style={{ color: "var(--text-muted)", fontSize: "0.88rem", lineHeight: 1.7 }}>
                {product.descriptionLong || product.descriptionShort}
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
