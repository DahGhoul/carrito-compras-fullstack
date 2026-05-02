import { create } from "zustand";
import { LocalCartItem, Product } from "../types";
import { getProductImage } from "../utils/image";

type CartState = {
  items: LocalCartItem[];
  addProduct: (product: Product, quantity?: number) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
};

function persist(items: LocalCartItem[]) {
  localStorage.setItem("local_cart", JSON.stringify(items));
}

const initialItems = (() => {
  const raw = localStorage.getItem("local_cart");
  if (!raw) {
    return [] as LocalCartItem[];
  }

  try {
    return JSON.parse(raw) as LocalCartItem[];
  } catch {
    return [] as LocalCartItem[];
  }
})();

export const useCartStore = create<CartState>((set) => ({
  items: initialItems,
  addProduct: (product, quantity = 1) =>
    set((state) => {
      const unitPrice = Number(product.offerPrice ?? product.priceSale);
      const existing = state.items.find((item) => item.productId === product.id);

      let next: LocalCartItem[];
      if (existing) {
        next = state.items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        next = [
          ...state.items,
          {
            productId: product.id,
            name: product.name,
            unitPrice,
            quantity,
            imageUrl: getProductImage(product)
          }
        ];
      }

      persist(next);
      return { items: next };
    }),
  updateQuantity: (productId, quantity) =>
    set((state) => {
      const next =
        quantity <= 0
          ? state.items.filter((item) => item.productId !== productId)
          : state.items.map((item) => (item.productId === productId ? { ...item, quantity } : item));

      persist(next);
      return { items: next };
    }),
  removeItem: (productId) =>
    set((state) => {
      const next = state.items.filter((item) => item.productId !== productId);
      persist(next);
      return { items: next };
    }),
  clear: () =>
    set(() => {
      localStorage.removeItem("local_cart");
      return { items: [] };
    })
}));