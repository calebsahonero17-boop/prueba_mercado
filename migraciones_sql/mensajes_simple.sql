CREATE TABLE mensajes (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  conversacion_id TEXT,
  remitente_id TEXT,
  contenido TEXT NOT NULL,
  tipo_mensaje TEXT DEFAULT 'texto',
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);