-- Script idempotente para entorno manual de PostgreSQL 16+

CREATE EXTENSION IF NOT EXISTS pg_trgm;

DO $$
BEGIN
  CREATE TYPE order_status AS ENUM (
    'PENDIENTE_PAGO',
    'PAGADA',
    'EN_PROCESO',
    'ENVIADA',
    'ENTREGADA',
    'CANCELADA',
    'DEVUELTA'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  CREATE TYPE inventory_movement_type AS ENUM (
    'ENTRADA',
    'SALIDA',
    'AJUSTE_POSITIVO',
    'AJUSTE_NEGATIVO',
    'RESERVA',
    'LIBERACION'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS seg_roles (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  permissions JSONB,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seg_usuarios (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seg_usuario_rol (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES seg_usuarios(id) ON DELETE CASCADE,
  role_id TEXT NOT NULL REFERENCES seg_roles(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS cat_categorias (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat_marcas (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cat_productos (
  id TEXT PRIMARY KEY,
  sku TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description_short TEXT,
  description_long TEXT,
  price_cost NUMERIC(12,2) NOT NULL CHECK (price_cost >= 0),
  price_sale NUMERIC(12,2) NOT NULL CHECK (price_sale >= 0),
  offer_price NUMERIC(12,2),
  stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
  stock_min INTEGER NOT NULL DEFAULT 0 CHECK (stock_min >= 0),
  active BOOLEAN NOT NULL DEFAULT TRUE,
  category_id TEXT NOT NULL REFERENCES cat_categorias(id),
  brand_id TEXT REFERENCES cat_marcas(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cat_productos_name ON cat_productos USING gin (name gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_cat_productos_category_id ON cat_productos (category_id);

CREATE TABLE IF NOT EXISTS cat_imagenes_producto (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES cat_productos(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  is_main BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ord_carritos (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL UNIQUE REFERENCES seg_usuarios(id) ON DELETE CASCADE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ord_items_carrito (
  id TEXT PRIMARY KEY,
  cart_id TEXT NOT NULL REFERENCES ord_carritos(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES cat_productos(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS cli_direcciones (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES seg_usuarios(id) ON DELETE CASCADE,
  label TEXT,
  full_name TEXT NOT NULL,
  line1 TEXT NOT NULL,
  line2 TEXT,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  country TEXT NOT NULL,
  phone TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ord_ordenes (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES seg_usuarios(id),
  address_id TEXT REFERENCES cli_direcciones(id),
  status order_status NOT NULL DEFAULT 'PENDIENTE_PAGO',
  subtotal NUMERIC(12,2) NOT NULL,
  tax NUMERIC(12,2) NOT NULL,
  shipping NUMERIC(12,2) NOT NULL,
  discount NUMERIC(12,2) NOT NULL DEFAULT 0,
  total NUMERIC(12,2) NOT NULL,
  payment_method TEXT,
  payment_status TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ord_ordenes_user_id ON ord_ordenes (user_id);
CREATE INDEX IF NOT EXISTS idx_ord_ordenes_status ON ord_ordenes (status);

CREATE TABLE IF NOT EXISTS ord_items_orden (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES ord_ordenes(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES cat_productos(id),
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  unit_price NUMERIC(12,2) NOT NULL,
  subtotal NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS ord_historial_estados (
  id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES ord_ordenes(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  old_status order_status,
  comment TEXT,
  changed_by_id TEXT,
  changed_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS seg_refresh_tokens (
  id TEXT PRIMARY KEY,
  token_hash TEXT NOT NULL UNIQUE,
  user_id TEXT NOT NULL REFERENCES seg_usuarios(id) ON DELETE CASCADE,
  expires_at TIMESTAMP NOT NULL,
  revoked_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS inv_movimientos_inventario (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES cat_productos(id),
  type inventory_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  reference TEXT,
  notes TEXT,
  created_by_id TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cli_resenas_producto (
  id TEXT PRIMARY KEY,
  product_id TEXT NOT NULL REFERENCES cat_productos(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES seg_usuarios(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  approved BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE (product_id, user_id)
);

CREATE TABLE IF NOT EXISTS configuracion_sistema (
  id TEXT PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

INSERT INTO configuracion_sistema (id, key, value)
VALUES ('cfg-igv', 'IMPUESTO_PORCENTAJE', '0.18')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Los datos semilla de roles, usuarios y 20 productos se gestionan en backend/prisma/seed.ts