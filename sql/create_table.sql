-- Productos
CREATE TABLE products (
  id INTEGER PRIMARY KEY,
  tipo_prenda VARCHAR(100),
  talla VARCHAR(10),
  color VARCHAR(50),
  cantidad_disponible INTEGER,
  precio_50_u DECIMAL(10,2),
  precio_100_u DECIMAL(10,2),
  precio_200_u DECIMAL(10,2),
  disponible BOOLEAN,
  categoria VARCHAR(50),
  descripcion TEXT
);

-- Carritos
CREATE TABLE carts (
  id SERIAL PRIMARY KEY,
  session_id VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Items del carrito
CREATE TABLE cart_items (
  id SERIAL PRIMARY KEY,
  cart_id INTEGER REFERENCES carts(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  qty INTEGER NOT NULL CHECK (qty > 0),
  unit_price DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  UNIQUE(cart_id, product_id)
);

