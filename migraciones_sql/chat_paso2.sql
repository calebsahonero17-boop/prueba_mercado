-- PASO 2: Crear tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID REFERENCES conversaciones(id) ON DELETE CASCADE,
  remitente_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  tipo_mensaje VARCHAR(20) DEFAULT 'texto',
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);