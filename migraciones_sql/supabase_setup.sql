-- =====================================================
-- SCRIPT COMPLETO PARA CONFIGURAR SUPABASE
-- Mercado Express - E-commerce Platform
-- =====================================================

-- 1. TABLA PERFILES (Usuarios)
-- =====================================================
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY DEFAULT auth.uid(),
    nombres VARCHAR(100) NOT NULL,
    apellidos VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    telefono VARCHAR(20),
    carnet_identidad VARCHAR(20) UNIQUE NOT NULL,
    ciudad VARCHAR(100),
    rol VARCHAR(20) DEFAULT 'usuario' CHECK (rol IN ('usuario', 'moderador', 'admin', 'super_admin')),
    avatar VARCHAR(10),
    activo BOOLEAN DEFAULT true,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABLA PRODUCTOS
-- =====================================================
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(255) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio >= 0),
    categoria VARCHAR(100),
    stock INTEGER DEFAULT 0 CHECK (stock >= 0),
    url_imagen TEXT,
    activo BOOLEAN DEFAULT true,
    vendedor_id UUID REFERENCES perfiles(id),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABLA PEDIDOS
-- =====================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido VARCHAR(50) UNIQUE NOT NULL,
    usuario_id UUID NOT NULL REFERENCES perfiles(id),
    estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'procesando', 'enviado', 'entregado', 'cancelado')),
    total DECIMAL(10,2) NOT NULL CHECK (total >= 0),
    direccion_envio TEXT,
    telefono_contacto VARCHAR(20),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_envio TIMESTAMP WITH TIME ZONE,
    fecha_entrega TIMESTAMP WITH TIME ZONE,
    notas TEXT
);

-- 4. TABLA DETALLE_PEDIDOS
-- =====================================================
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA CARRITO (Opcional - para persistir carritos)
-- =====================================================
CREATE TABLE IF NOT EXISTS carrito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES perfiles(id),
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);

-- =====================================================
-- FUNCIONES Y TRIGGERS
-- =====================================================

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_actualizacion()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para actualizar fecha_actualizacion
CREATE TRIGGER trigger_actualizar_perfiles
    BEFORE UPDATE ON perfiles
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_productos
    BEFORE UPDATE ON productos
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

CREATE TRIGGER trigger_actualizar_carrito
    BEFORE UPDATE ON carrito
    FOR EACH ROW
    EXECUTE FUNCTION actualizar_fecha_actualizacion();

-- Función para generar número de pedido único
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_pedido IS NULL OR NEW.numero_pedido = '' THEN
        NEW.numero_pedido := 'ME-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                           LPAD(EXTRACT(EPOCH FROM NOW())::TEXT, 10, '0') ||
                           LPAD((RANDOM() * 1000)::INTEGER::TEXT, 3, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para generar número de pedido
CREATE TRIGGER trigger_generar_numero_pedido
    BEFORE INSERT ON pedidos
    FOR EACH ROW
    EXECUTE FUNCTION generar_numero_pedido();

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
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

-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

-- Usuario administrador demo
INSERT INTO perfiles (
    id,
    nombres,
    apellidos,
    email,
    telefono,
    carnet_identidad,
    ciudad,
    rol,
    avatar
) VALUES (
    gen_random_uuid(),
    'Admin',
    'Sistema',
    'admin@mercadoexpress.bo',
    '70000000',
    '00000000',
    'La Paz',
    'admin',
    'AS'
) ON CONFLICT (email) DO NOTHING;

-- Usuario demo normal
INSERT INTO perfiles (
    id,
    nombres,
    apellidos,
    email,
    telefono,
    carnet_identidad,
    ciudad,
    rol,
    avatar
) VALUES (
    gen_random_uuid(),
    'Usuario',
    'Demo',
    'demo@mercadoexpress.bo',
    '70123456',
    '12345678',
    'La Paz',
    'usuario',
    'UD'
) ON CONFLICT (email) DO NOTHING;

-- Productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria, stock, url_imagen) VALUES
('Laptop Dell Inspiron', 'Laptop Dell Inspiron 15 3000 con procesador Intel Core i5', 4500.00, 'Tecnología', 10, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
('iPhone 13', 'Apple iPhone 13 128GB disponible en varios colores', 6800.00, 'Tecnología', 5, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400'),
('Mesa de Comedor', 'Mesa de comedor de madera para 6 personas', 1200.00, 'Hogar', 3, 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400'),
('Bicicleta Montaña', 'Bicicleta de montaña aro 26 con 21 velocidades', 2200.00, 'Deportes', 8, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'),
('Camiseta Nike', 'Camiseta deportiva Nike Dri-FIT para hombre', 180.00, 'Ropa', 25, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
('Audífonos Sony', 'Audífonos inalámbricos Sony WH-1000XM4 con cancelación de ruido', 1800.00, 'Tecnología', 12, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400')
ON CONFLICT DO NOTHING;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Base de datos configurada exitosamente para Mercado Express';
    RAISE NOTICE '📊 Tablas creadas: perfiles, productos, pedidos, detalle_pedidos, carrito';
    RAISE NOTICE '🔧 Triggers y funciones configurados';
    RAISE NOTICE '📈 Índices optimizados creados';
    RAISE NOTICE '🧪 Datos de prueba insertados';
    RAISE NOTICE '🚀 ¡Listo para usar!';
END $$;