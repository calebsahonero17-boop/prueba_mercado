-- Script SQL para crear las tablas del sistema de chat
-- Ejecutar en el SQL Editor de Supabase

-- Tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprador_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  ultimo_mensaje TEXT,
  fecha_ultimo_mensaje TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comprador_leido BOOLEAN DEFAULT true,
  vendedor_leido BOOLEAN DEFAULT false,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de mensajes
CREATE TABLE IF NOT EXISTS mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversacion_id UUID REFERENCES conversaciones(id) ON DELETE CASCADE,
  remitente_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  contenido TEXT NOT NULL,
  tipo_mensaje VARCHAR(20) DEFAULT 'texto',
  leido BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_conversaciones_comprador ON conversaciones(comprador_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_vendedor ON conversaciones(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_producto ON conversaciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_fecha ON conversaciones(fecha_ultimo_mensaje DESC);

CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON mensajes(created_at DESC);

-- Políticas RLS (Row Level Security)
ALTER TABLE conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE mensajes ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver conversaciones donde participan
CREATE POLICY "Users can view their own conversations" ON conversaciones
  FOR SELECT USING (
    auth.uid() = comprador_id OR
    auth.uid() = vendedor_id
  );

-- Los usuarios pueden crear conversaciones
CREATE POLICY "Users can create conversations" ON conversaciones
  FOR INSERT WITH CHECK (
    auth.uid() = comprador_id OR
    auth.uid() = vendedor_id
  );

-- Los usuarios pueden actualizar conversaciones donde participan
CREATE POLICY "Users can update their conversations" ON conversaciones
  FOR UPDATE USING (
    auth.uid() = comprador_id OR
    auth.uid() = vendedor_id
  );

-- Los usuarios solo pueden ver mensajes de sus conversaciones
CREATE POLICY "Users can view messages from their conversations" ON mensajes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversaciones
      WHERE id = conversacion_id
      AND (comprador_id = auth.uid() OR vendedor_id = auth.uid())
    )
  );

-- Los usuarios pueden enviar mensajes a sus conversaciones
CREATE POLICY "Users can send messages to their conversations" ON mensajes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversaciones
      WHERE id = conversacion_id
      AND (comprador_id = auth.uid() OR vendedor_id = auth.uid())
    )
    AND remitente_id = auth.uid()
  );

-- Función para actualizar timestamp de conversación cuando se envía un mensaje
CREATE OR REPLACE FUNCTION actualizar_conversacion_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversaciones
  SET
    fecha_ultimo_mensaje = NEW.created_at,
    ultimo_mensaje = NEW.contenido,
    comprador_leido = CASE WHEN NEW.remitente_id = comprador_id THEN true ELSE false END,
    vendedor_leido = CASE WHEN NEW.remitente_id = vendedor_id THEN true ELSE false END,
    updated_at = NOW()
  WHERE id = NEW.conversacion_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar conversación cuando se envía un mensaje
CREATE TRIGGER trigger_actualizar_conversacion
  AFTER INSERT ON mensajes
  FOR EACH ROW
  EXECUTE FUNCTION actualizar_conversacion_timestamp();

-- Datos demo para testing (opcional)
-- Insertaremos estos datos desde el código para el modo demo