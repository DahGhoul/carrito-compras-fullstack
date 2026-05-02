import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { productService } from "../../services/product.service";
import { useCartStore } from "../../stores/cartStore";
import { getProductImage } from "../../utils/image";
import toast from "react-hot-toast";

export function CatalogoPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(12);
  const addProduct = useCartStore((state) => state.addProduct);

  const { data, isLoading } = useQuery({
    queryKey: ["catalogo", search, page, limit],
    queryFn: () => productService.list({ page, limit, search: search || undefined })
  });

  const products = data?.data ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / limit);

  return (
    <section>
      <p className="section-label">Catálogo</p>
      <h2 className="section-title">Todos los productos.</h2>

      <div className="toolbar">
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          placeholder="Buscar por nombre o SKU..."
        />
        <select value={limit} onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}>
          <option value={12}>12 por página</option>
          <option value={24}>24 por página</option>
          <option value={48}>48 por página</option>
        </select>
      </div>

      {isLoading && <p className="hint">Cargando...</p>}

      <div className="product-grid">
        {products.map((product) => {
          const hasOffer = !!product.offerPrice;
          const price = Number(product.offerPrice ?? product.priceSale);
          return (
            <article key={product.id} className="product-card">
              <div className="card-image-wrap">
                <Link to={`/producto/${product.id}`}>
                  <img src={getProductImage(product)} alt={product.name} />
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
                <small>{product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}</small>
                <button
                  disabled={product.stock <= 0}
                  onClick={() => { addProduct(product); toast.success(`${product.name} agregado`); }}
                >
                  {product.stock > 0 ? "Agregar al carrito" : "Agotado"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {products.length === 0 && !isLoading && (
        <div className="empty-state"><p>No se encontraron productos.</p></div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-outline btn-sm">← Anterior</button>
          <span>Página {page} de {totalPages}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="btn-outline btn-sm">Siguiente →</button>
        </div>
      )}
    </section>
  );
}
