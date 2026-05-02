import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { productService } from "../../services/product.service";
import { useCartStore } from "../../stores/cartStore";
import { getProductImage } from "../../utils/image";
import toast from "react-hot-toast";

export function HomePage() {
  const [search, setSearch] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");
  const addProduct = useCartStore((state) => state.addProduct);

  const { data, isLoading } = useQuery({
    queryKey: ["productos", submittedSearch],
    queryFn: () => productService.list({ page: 1, limit: 8, search: submittedSearch })
  });

  const products = useMemo(() => data?.data ?? [], [data]);

  return (
    <section>
      {/* Hero — Apple/Nike style */}
      <div className="hero">
        <p className="section-label">ShopConsole</p>
        <h1>La nueva forma de comprar.</h1>
        <p>Descubre productos increíbles con la mejor experiencia de compra, desde tu navegador.</p>
        <div style={{ display: "flex", gap: "0.8rem", justifyContent: "center", position: "relative" }}>
          <Link to="/catalogo" className="primary-link">Explorar catálogo</Link>
          <Link to="/catalogo" style={{
            display: "inline-flex", alignItems: "center", gap: "0.3rem",
            color: "var(--brand-light)", fontSize: "0.88rem", fontWeight: 500
          }}>
            Ver todo →
          </Link>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={(e) => { e.preventDefault(); setSubmittedSearch(search); }} className="toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos..."
          style={{ maxWidth: 480 }}
        />
        <button type="submit">Buscar</button>
      </form>

      {isLoading && <p className="hint">Cargando productos...</p>}

      {/* Featured Products */}
      <p className="section-label">Lo más nuevo</p>
      <h2 className="section-title" style={{ marginBottom: "1.5rem" }}>Productos destacados.</h2>

      <div className="product-grid">
        {products.map((product) => {
          const hasOffer = !!product.offerPrice;
          const price = Number(product.offerPrice ?? product.priceSale);
          return (
            <article key={product.id} className="product-card">
              <div className="card-image-wrap">
                <Link to={`/producto/${product.id}`}>
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                  />
                </Link>
                {hasOffer && <span className="card-badge">Oferta</span>}
              </div>
              <div className="card-body">
                <Link to={`/producto/${product.id}`}><h3>{product.name}</h3></Link>
                <p>{product.descriptionShort || "Producto premium"}</p>
                <div className="card-price">
                  {hasOffer && <span className="old-price">S/{Number(product.priceSale).toFixed(2)}</span>}
                  S/{price.toFixed(2)}
                </div>
                <button
                  disabled={product.stock <= 0}
                  onClick={() => { addProduct(product); toast.success("Agregado al carrito"); }}
                >
                  {product.stock > 0 ? "Agregar" : "Agotado"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {products.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
          <Link to="/catalogo" className="primary-link">Ver todo el catálogo →</Link>
        </div>
      )}

      {products.length === 0 && !isLoading && (
        <div className="empty-state"><p>No se encontraron productos.</p></div>
      )}
    </section>
  );
}