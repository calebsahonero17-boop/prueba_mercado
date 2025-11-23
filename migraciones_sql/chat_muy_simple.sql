-- Versión ultra básica - ejecutar línea por línea si es necesario

CREATE TABLE conversaciones (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  comprador_id TEXT,
  vendedor_id TEXT,
  producto_id TEXT,
  ultimo_mensaje TEXT,
  fecha_ultimo_mensaje TIMESTAMP DEFAULT NOW(),
  comprador_leido BOOLEAN DEFAULT true,
  vendedor_leido BOOLEAN DEFAULT false,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);