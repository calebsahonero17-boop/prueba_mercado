-- PASO 3: Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_conversaciones_comprador ON conversaciones(comprador_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_vendedor ON conversaciones(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_producto ON conversaciones(producto_id);
CREATE INDEX IF NOT EXISTS idx_conversaciones_fecha ON conversaciones(fecha_ultimo_mensaje DESC);

CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON mensajes(conversacion_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON mensajes(remitente_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_fecha ON mensajes(created_at DESC);