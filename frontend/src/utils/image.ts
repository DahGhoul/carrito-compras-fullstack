import type { Product } from "../types";

export function getProductImage(product: Product, index: number = 0): string {
  // Si el producto tiene una imagen real subida, usa esa
  if (product.images && product.images.length > index && product.images[index].url) {
    return product.images[index].url;
  }

  // Extraer una palabra clave lógica (categoría o primera palabra del nombre)
  const keyword = product.category?.name || product.name.split(" ")[0] || "tech";
  
  // Usar el ID del producto para que la imagen generada siempre sea la misma para este producto
  // (lock number del 1 al 1000)
  const lockId = product.id ? parseInt(product.id.substring(0, 6), 16) % 1000 : 1;

  // Usa LoremFlickr para traer fotos temáticas reales
  return `https://loremflickr.com/600/600/${encodeURIComponent(keyword.toLowerCase())}?lock=${lockId + index}`;
}
