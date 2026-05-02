export type RoleCode =
  | "ADMIN"
  | "CLIENTE"
  | "GERENTE_VENTAS"
  | "GERENTE_INVENTARIO"
  | "VENDEDOR";

export type OrderStatus =
  | "PENDIENTE_PAGO"
  | "PAGADA"
  | "EN_PROCESO"
  | "ENVIADA"
  | "ENTREGADA"
  | "CANCELADA"
  | "DEVUELTA";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  roles: RoleCode[];
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface ProductImage {
  id: string;
  url: string;
  isMain: boolean;
}

export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface Brand {
  id: string;
  code: string;
  name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  descriptionShort?: string;
  descriptionLong?: string;
  priceCost?: string;
  priceSale: string;
  offerPrice?: string | null;
  stock: number;
  stockMin?: number;
  active?: boolean;
  categoryId?: string;
  brandId?: string | null;
  category?: Category;
  brand?: Brand | null;
  images: ProductImage[];
  createdAt?: string;
  updatedAt?: string;
}

export interface LocalCartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  imageUrl?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
  product?: Product;
}

export interface OrderStatusHistoryEntry {
  id: string;
  status: OrderStatus;
  oldStatus?: OrderStatus;
  comment?: string;
  changedAt: string;
}

export interface Order {
  id: string;
  code: string;
  userId: string;
  status: OrderStatus;
  subtotal: string;
  tax: string;
  shipping: string;
  discount: string;
  total: string;
  paymentMethod?: string;
  paymentStatus?: string;
  notes?: string;
  items: OrderItem[];
  statusHistory?: OrderStatusHistoryEntry[];
  address?: Address;
  user?: { firstName: string; lastName: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  id: string;
  label?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  isDefault: boolean;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: string;
  quantity: number;
  reference?: string;
  notes?: string;
  product?: { name: string; sku: string };
  createdAt: string;
}

export interface DashboardKpis {
  totalProductos: number;
  totalClientes: number;
  ordenesPendientes: number;
  ventasMes: number;
  ordenesMes: number;
  ticketPromedio: number;
}

export interface DashboardData {
  kpis: DashboardKpis;
  lowStockProducts: Product[];
  salesByCategory?: { name: string; total: number }[];
  ordersByStatus?: { status: string; count: number }[];
  monthlySales?: { month: string; total: number; cost: number }[];
  topProducts?: { name: string; quantity: number }[];
}