-- PASO 3: ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices en perfiles
CREATE INDEX IF NOT EXISTS idx_perfiles_email ON perfiles(email);
CREATE INDEX IF NOT EXISTS idx_perfiles_ci ON perfiles(carnet_identidad);
CREATE INDEX IF NOT EXISTS idx_perfiles_rol ON perfiles(rol);

-- Índices en productos
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_vendedor ON productos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- Índices en pedidos
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_pedidos_fecha ON pedidos(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_pedidos_numero ON pedidos(numero_pedido);

-- Índices en detalle_pedidos
CREATE INDEX IF NOT EXISTS idx_detalle_pedido ON detalle_pedidos(pedido_id);
CREATE INDEX IF NOT EXISTS idx_detalle_producto ON detalle_pedidos(producto_id);

-- Índices en carrito
CREATE INDEX IF NOT EXISTS idx_carrito_usuario ON carrito(usuario_id);