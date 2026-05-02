import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "../../services/admin.service";
import { useState } from "react";
import toast from "react-hot-toast";
import type { Product } from "../../types";

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products", search],
    queryFn: () => adminService.allProducts({ search: search || undefined, limit: 100 })
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteProduct(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["admin-products"] }); toast.success("Producto eliminado"); }
  });

  const products = data?.data ?? [];

  function openCreate() { setEditing(null); setShowModal(true); }
  function openEdit(p: Product) { setEditing(p); setShowModal(true); }

  return (
    <section>
      <div className="page-header">
        <h2>Gestión de Productos</h2>
        <button onClick={openCreate}>+ Nuevo Producto</button>
      </div>

      <div className="toolbar">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar producto..." />
      </div>

      {isLoading ? <p className="hint">Cargando...</p> : (
        <div className="panel" style={{ overflow: "auto" }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nombre</th>
                <th>Precio Venta</th>
                <th>Oferta</th>
                <th>Stock</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>S/ {Number(p.priceSale).toFixed(2)}</td>
                  <td>{p.offerPrice ? `S/ ${Number(p.offerPrice).toFixed(2)}` : "—"}</td>
                  <td style={{ 
                    color: p.stock === 0 ? "var(--danger)" : p.stock <= (p.stockMin ?? 5) ? "var(--orange)" : "var(--success)", 
                    fontWeight: 600 
                  }}>
                    {p.stock}
                  </td>
                  <td><span className={`badge ${p.active ? "badge-delivered" : "badge-cancelled"}`}>{p.active ? "Activo" : "Inactivo"}</span></td>
                  <td>
                    <div className="actions">
                      <button className="btn-ghost btn-sm" onClick={() => openEdit(p)}>Editar</button>
                      <button className="btn-ghost btn-sm" style={{ color: "var(--danger)" }}
                        onClick={() => { if (confirm("¿Eliminar este producto?")) deleteMutation.mutate(p.id); }}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="hint" style={{ marginTop: "0.5rem" }}>{products.length} productos encontrados</p>
        </div>
      )}

      {showModal && (
        <ProductModal
          product={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); queryClient.invalidateQueries({ queryKey: ["admin-products"] }); }}
        />
      )}
    </section>
  );
}

function ProductModal({ product, onClose, onSaved }: { product: Product | null; onClose: () => void; onSaved: () => void }) {
  const currentImageUrl = product?.images?.find(img => img.isMain)?.url ?? product?.images?.[0]?.url ?? "";

  const [form, setForm] = useState({
    sku: product?.sku ?? "",
    name: product?.name ?? "",
    descriptionShort: product?.descriptionShort ?? "",
    descriptionLong: product?.descriptionLong ?? "",
    priceCost: product?.priceCost ? Number(product.priceCost) : 0,
    priceSale: Number(product?.priceSale ?? 0),
    offerPrice: product?.offerPrice ? Number(product.offerPrice) : 0,
    stock: product?.stock ?? 0,
    stockMin: product?.stockMin ?? 5,
    active: product?.active ?? true,
    categoryId: product?.categoryId ?? "",
    imageUrl: currentImageUrl
  });
  const [imagePreview, setImagePreview] = useState<string>(currentImageUrl);
  const [loading, setLoading] = useState(false);

  function handleImageChange(url: string) {
    setForm({ ...form, imageUrl: url });
    setImagePreview(url);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        const updatePayload: Record<string, unknown> = {
          name: form.name,
          descriptionShort: form.descriptionShort,
          descriptionLong: form.descriptionLong,
          priceCost: form.priceCost,
          priceSale: form.priceSale,
          offerPrice: form.offerPrice || null,
          stock: form.stock,
          stockMin: form.stockMin,
          active: form.active
        };
        // Only send imageUrl when it differs from the original
        if (form.imageUrl !== currentImageUrl) {
          updatePayload.imageUrl = form.imageUrl || null;
        }
        await adminService.updateProduct(product.id, updatePayload);
        toast.success("Producto actualizado");
      } else {
        await adminService.createProduct({
          ...form,
          offerPrice: form.offerPrice || undefined
        });
        toast.success("Producto creado");
      }
      onSaved();
    } catch {
      // Error handled by interceptor
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{product ? "Editar Producto" : "Nuevo Producto"}</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-row">
            <label>SKU<input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required disabled={!!product} /></label>
            <label>Nombre<input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></label>
          </div>
          <label>Descripción corta<input value={form.descriptionShort} onChange={(e) => setForm({ ...form, descriptionShort: e.target.value })} /></label>
          <label>Descripción larga<textarea value={form.descriptionLong} onChange={(e) => setForm({ ...form, descriptionLong: e.target.value })} /></label>
          <div className="form-row-3">
            <label>Precio costo<input type="number" step="0.01" value={form.priceCost} onChange={(e) => setForm({ ...form, priceCost: +e.target.value })} required /></label>
            <label>Precio venta<input type="number" step="0.01" value={form.priceSale} onChange={(e) => setForm({ ...form, priceSale: +e.target.value })} required /></label>
            <label>Precio oferta<input type="number" step="0.01" value={form.offerPrice} onChange={(e) => setForm({ ...form, offerPrice: +e.target.value })} /></label>
          </div>
          <div className="form-row-3">
            <label>Stock<input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: +e.target.value })} required /></label>
            <label>Stock mínimo<input type="number" value={form.stockMin} onChange={(e) => setForm({ ...form, stockMin: +e.target.value })} /></label>
            <label>Estado<select value={String(form.active)} onChange={(e) => setForm({ ...form, active: e.target.value === "true" })}>
              <option value="true">Activo</option><option value="false">Inactivo</option>
            </select></label>
          </div>
          {!product && <label>ID Categoría<input value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} required placeholder="ID de categoría" /></label>}

          {/* Image section — shown for both create and edit */}
          <div style={{ marginTop: "0.5rem" }}>
            <label style={{ display: "block", marginBottom: "0.4rem", fontWeight: 600, fontSize: "0.85rem", color: "var(--text-muted)" }}>
              {product ? "Cambiar imagen principal" : "URL imagen"}
            </label>
            {imagePreview && (
              <div style={{ marginBottom: "0.6rem", borderRadius: "0.5rem", overflow: "hidden", border: "1px solid var(--border)", background: "var(--surface-2, #1a1a2e)", display: "flex", justifyContent: "center", padding: "0.5rem" }}>
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  style={{ maxHeight: "140px", maxWidth: "100%", objectFit: "contain", borderRadius: "0.4rem" }}
                />
              </div>
            )}
            <input
              type="url"
              value={form.imageUrl}
              onChange={(e) => handleImageChange(e.target.value)}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
            {product && form.imageUrl !== currentImageUrl && form.imageUrl === "" && (
              <p style={{ fontSize: "0.75rem", color: "var(--warning, #f59e0b)", marginTop: "0.25rem" }}>
                Dejar vacío eliminará la imagen principal.
              </p>
            )}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-outline" onClick={onClose}>Cancelar</button>
            <button type="submit" disabled={loading}>{loading ? "Guardando..." : "Guardar"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}