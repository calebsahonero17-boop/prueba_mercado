-- =====================================================
-- CONFIGURACIÓN COMPLETA DE BASE DE DATOS SUPABASE
-- Para Mercado Express - Aplicación de Ecommerce
-- =====================================================

-- 1. CREAR TABLAS PRINCIPALES
-- =====================================================

-- Tabla de perfiles de usuarios (ya existe pero verificamos)
CREATE TABLE IF NOT EXISTS public.perfiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE,
    nombres TEXT NOT NULL,
    apellidos TEXT NOT NULL,
    telefono TEXT,
    carnet_identidad TEXT UNIQUE,
    ciudad TEXT,
    avatar TEXT,
    rol TEXT DEFAULT 'usuario' CHECK (rol IN ('usuario', 'vendedor', 'moderador', 'admin', 'super_admin')),
    activo BOOLEAN DEFAULT true,
    -- Campos específicos para vendedores
    descripcion_vendedor TEXT,
    especialidad TEXT,
    horario_atencion TEXT,
    telefono_whatsapp TEXT,
    acepta_envios BOOLEAN DEFAULT false,
    ciudades_envio TEXT,
    -- Timestamps
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de categorías
CREATE TABLE IF NOT EXISTS public.categorias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre TEXT UNIQUE NOT NULL,
    descripcion TEXT,
    imagen_url TEXT,
    activa BOOLEAN DEFAULT true,
    orden INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS public.productos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    vendedor_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    categoria_id UUID REFERENCES public.categorias(id) ON DELETE SET NULL,
    nombre TEXT NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL CHECK (precio > 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    url_imagen TEXT,
    imagenes_adicionales TEXT[], -- Array de URLs de imágenes
    categoria TEXT, -- Mantenemos por compatibilidad
    activo BOOLEAN DEFAULT true,
    destacado BOOLEAN DEFAULT false,
    peso DECIMAL(8,3), -- en kg
    dimensiones JSONB, -- {largo: 10, ancho: 5, alto: 3}
    marca TEXT,
    modelo TEXT,
    condicion TEXT DEFAULT 'nuevo' CHECK (condicion IN ('nuevo', 'usado', 'reacondicionado')),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS public.pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE NOT NULL,
    vendedor_id UUID REFERENCES public.perfiles(id) ON DELETE CASCADE,
    total DECIMAL(10,2) NOT NULL CHECK (total > 0),
    estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'confirmado', 'procesando', 'enviado', 'entregado', 'cancelado')),

    -- Información de envío
    direccion_envio TEXT NOT NULL,
    ciudad_envio TEXT NOT NULL,
    telefono_contacto TEXT NOT NULL,
    notas_envio TEXT,

    -- Información de pago
    metodo_pago TEXT DEFAULT 'efectivo' CHECK (metodo_pago IN ('efectivo', 'transferencia', 'qr', 'tarjeta')),
    estado_pago TEXT DEFAULT 'pendiente' CHECK (estado_pago IN ('pendiente', 'pagado', 'fallido')),

    -- Timestamps
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_entrega_estimada TIMESTAMP WITH TIME ZONE
);

-- Tabla de detalle de pedidos
CREATE TABLE IF NOT EXISTS public.detalle_pedidos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id UUID REFERENCES public.pedidos(id) ON DELETE CASCADE NOT NULL,
    producto_id UUID REFERENCES public.productos(id) ON DELETE CASCADE NOT NULL,
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal > 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INSERTAR CATEGORÍAS
-- =====================================================

INSERT INTO public.categorias (nombre, descripcion, imagen_url) VALUES
('Tecnología', 'Dispositivos electrónicos, computadoras, celulares y accesorios', 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?w=400'),
('Hogar y Jardín', 'Muebles, decoración, electrodomésticos y artículos para el hogar', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400'),
('Ropa y Moda', 'Vestimenta para hombre, mujer y niños, zapatos y accesorios', 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'),
('Deportes y Fitness', 'Equipamiento deportivo, ropa deportiva y accesorios fitness', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'),
('Libros y Educación', 'Libros, material educativo, cursos y recursos de aprendizaje', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
('Salud y Belleza', 'Productos de cuidado personal, cosméticos y suplementos', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'),
('Automotriz', 'Accesorios para vehículos, repuestos y herramientas', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=400'),
('Artesanías Bolivianas', 'Productos tradicionales y artesanales de Bolivia', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400')
ON CONFLICT (nombre) DO NOTHING;

-- 3. INSERTAR PRODUCTOS REALES DE EJEMPLO
-- =====================================================

-- Primero necesitamos un vendedor demo
INSERT INTO public.perfiles (
    id,
    email,
    nombres,
    apellidos,
    telefono,
    carnet_identidad,
    ciudad,
    rol,
    descripcion_vendedor,
    especialidad,
    acepta_envios,
    ciudades_envio
) VALUES (
    '550e8400-e29b-41d4-a716-446655440000',
    'vendedor@mercadoexpress.bo',
    'María',
    'González',
    '70123456',
    '7123456',
    'La Paz',
    'vendedor',
    'Vendedora especializada en productos de tecnología y artesanías bolivianas con más de 5 años de experiencia.',
    'Tecnología y Artesanías',
    true,
    'La Paz, El Alto, Cochabamba, Santa Cruz'
) ON CONFLICT (id) DO NOTHING;

-- Productos de Tecnología
INSERT INTO public.productos (vendedor_id, categoria, nombre, descripcion, precio, stock, url_imagen, destacado, marca, condicion) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Tecnología', 'Laptop Dell Inspiron 15 3000', 'Laptop Dell Inspiron 15 3000 con procesador Intel Core i5-1135G7, 8GB RAM DDR4, 256GB SSD, pantalla 15.6" Full HD, Windows 11. Ideal para trabajo y estudio.', 4500.00, 8, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500', true, 'Dell', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Tecnología', 'iPhone 14 128GB', 'Apple iPhone 14 128GB disponible en varios colores. Cámara dual de 12MP, chip A15 Bionic, pantalla Super Retina XDR de 6.1 pulgadas. Incluye cargador y audífonos.', 6800.00, 5, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=500', true, 'Apple', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Tecnología', 'Samsung Galaxy A54 5G', 'Samsung Galaxy A54 5G 128GB, pantalla Super AMOLED de 6.4", cámara triple de 50MP, batería de 5000mAh. Excelente relación calidad-precio.', 2800.00, 12, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500', false, 'Samsung', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Tecnología', 'Audífonos Sony WH-1000XM4', 'Audífonos inalámbricos Sony WH-1000XM4 con cancelación de ruido líder en la industria. Batería de hasta 30 horas, sonido de alta calidad.', 1800.00, 15, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500', true, 'Sony', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Tecnología', 'Monitor LG 24" Full HD', 'Monitor LG 24MK430H-B de 24 pulgadas Full HD IPS, ideal para trabajo y gaming casual. Conectividad HDMI y VGA.', 890.00, 20, 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500', false, 'LG', 'nuevo');

-- Productos de Hogar
INSERT INTO public.productos (vendedor_id, categoria, nombre, descripcion, precio, stock, url_imagen, marca, condicion) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Hogar y Jardín', 'Mesa de Comedor de Madera', 'Mesa de comedor de madera maciza para 6 personas, diseño moderno y elegante. Dimensiones: 180x90x75cm. Perfecta para el hogar boliviano.', 1200.00, 5, 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500', 'Artesanal', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Hogar y Jardín', 'Licuadora Oster 3 en 1', 'Licuadora Oster Beehive Blender 3 en 1 con vaso de vidrio de 1.5L, múltiples velocidades y función pulso. Ideal para jugos y batidos.', 450.00, 25, 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=500', 'Oster', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Hogar y Jardín', 'Sofá 3 Plazas Moderno', 'Sofá de 3 plazas tapizado en tela resistente, estructura de madera, cómodo y duradero. Colores disponibles: gris, beige, azul.', 2800.00, 3, 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500', 'Comfort Home', 'nuevo');

-- Productos de Ropa
INSERT INTO public.productos (vendedor_id, categoria, nombre, descripcion, precio, stock, url_imagen, marca, condicion) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Ropa y Moda', 'Camiseta Nike Dri-FIT', 'Camiseta deportiva Nike Dri-FIT para hombre, tecnología de absorción de humedad. Varios colores y tallas disponibles. 100% poliéster.', 180.00, 50, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500', 'Nike', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Ropa y Moda', 'Jeans Levis 501 Original', 'Jeans Levis 501 Original Fit, el clásico jean americano. 100% algodón, corte recto, disponible en diferentes tallas y colores.', 520.00, 30, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500', 'Levis', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Ropa y Moda', 'Vestido Casual Femenino', 'Vestido casual para mujer, tela suave y cómoda, perfecto para el día a día. Disponible en tallas S, M, L, XL y varios colores.', 280.00, 35, 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=500', 'Fashion Plus', 'nuevo');

-- Productos de Deportes
INSERT INTO public.productos (vendedor_id, categoria, nombre, descripcion, precio, stock, url_imagen, destacado, marca, condicion) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Deportes y Fitness', 'Bicicleta de Montaña 26"', 'Bicicleta de montaña aro 26 con 21 velocidades Shimano, frenos V-brake, suspensión delantera. Ideal para aventuras en la naturaleza boliviana.', 2200.00, 8, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=500', true, 'Trek', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Deportes y Fitness', 'Pelota de Fútbol Profesional', 'Pelota de fútbol profesional FIFA aprobada, cuero sintético de alta calidad, perfecta para partidos y entrenamientos.', 320.00, 40, 'https://images.unsplash.com/photo-1526746323784-6e2d32cbbddb?w=500', false, 'Adidas', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Deportes y Fitness', 'Zapatillas Running Nike', 'Zapatillas Nike Air Zoom para running, tecnología de amortiguación avanzada, disponibles en múltiples tallas y colores.', 680.00, 25, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', true, 'Nike', 'nuevo');

-- Productos de Artesanías Bolivianas
INSERT INTO public.productos (vendedor_id, categoria, nombre, descripcion, precio, stock, url_imagen, destacado, marca, condicion) VALUES
('550e8400-e29b-41d4-a716-446655440000', 'Artesanías Bolivianas', 'Aguayo Paceño Tradicional', 'Aguayo tradicional paceño tejido a mano por artesanas locales. Colores vibrantes y diseños ancestrales. Ideal para decoración o uso ceremonial.', 150.00, 20, 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=500', true, 'Artesanal', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Artesanías Bolivianas', 'Charango Boliviano', 'Charango boliviano hecho con maderas nativas, cuerdas de alta calidad. Instrumento tradicional perfecto para músicos y coleccionistas.', 850.00, 6, 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500', true, 'Artesanal', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Artesanías Bolivianas', 'Cerámica de Tarabuco', 'Cerámica artesanal de Tarabuco, decorada con motivos tradicionales bolivianos. Pieza única hecha por maestros ceramistas.', 85.00, 15, 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=500', false, 'Artesanal', 'nuevo'),
('550e8400-e29b-41d4-a716-446655440000', 'Artesanías Bolivianas', 'Sombrero Borsalino Boliviano', 'Sombrero Borsalino auténtico boliviano, hecho a mano con técnicas tradicionales. Símbolo de elegancia y tradición boliviana.', 1200.00, 4, 'https://images.unsplash.com/photo-1514327605112-b887c0e61c4a?w=500', true, 'Artesanal', 'nuevo');

-- 4. CONFIGURAR POLÍTICAS DE SEGURIDAD (RLS)
-- =====================================================

-- Habilitar RLS en las tablas
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_pedidos ENABLE ROW LEVEL SECURITY;

-- Políticas para perfiles
CREATE POLICY "Los usuarios pueden ver todos los perfiles públicos" ON public.perfiles
    FOR SELECT USING (true);

CREATE POLICY "Los usuarios pueden actualizar su propio perfil" ON public.perfiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Los usuarios pueden insertar su propio perfil" ON public.perfiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para categorías (público para lectura)
CREATE POLICY "Cualquiera puede ver las categorías" ON public.categorias
    FOR SELECT USING (activa = true);

-- Políticas para productos
CREATE POLICY "Cualquiera puede ver productos activos" ON public.productos
    FOR SELECT USING (activo = true);

CREATE POLICY "Los vendedores pueden gestionar sus productos" ON public.productos
    FOR ALL USING (auth.uid() = vendedor_id);

CREATE POLICY "Los vendedores pueden crear productos" ON public.productos
    FOR INSERT WITH CHECK (auth.uid() = vendedor_id);

-- Políticas para pedidos
CREATE POLICY "Los usuarios pueden ver sus propios pedidos" ON public.pedidos
    FOR SELECT USING (auth.uid() = usuario_id OR auth.uid() = vendedor_id);

CREATE POLICY "Los usuarios pueden crear pedidos" ON public.pedidos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

CREATE POLICY "Los usuarios y vendedores pueden actualizar pedidos" ON public.pedidos
    FOR UPDATE USING (auth.uid() = usuario_id OR auth.uid() = vendedor_id);

-- Políticas para detalle de pedidos
CREATE POLICY "Los usuarios pueden ver detalles de sus pedidos" ON public.detalle_pedidos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.pedidos
            WHERE pedidos.id = detalle_pedidos.pedido_id
            AND (pedidos.usuario_id = auth.uid() OR pedidos.vendedor_id = auth.uid())
        )
    );

CREATE POLICY "Se pueden crear detalles de pedidos" ON public.detalle_pedidos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos
            WHERE pedidos.id = detalle_pedidos.pedido_id
            AND pedidos.usuario_id = auth.uid()
        )
    );

-- 5. CREAR FUNCIONES ÚTILES
-- =====================================================

-- Función para actualizar el timestamp de actualización
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Aplicar triggers de actualización
CREATE TRIGGER update_perfiles_updated_at BEFORE UPDATE ON public.perfiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_productos_updated_at BEFORE UPDATE ON public.productos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at BEFORE UPDATE ON public.pedidos
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función para calcular el total del pedido
CREATE OR REPLACE FUNCTION calcular_total_pedido(pedido_uuid UUID)
RETURNS DECIMAL AS $$
DECLARE
    total DECIMAL := 0;
BEGIN
    SELECT COALESCE(SUM(subtotal), 0) INTO total
    FROM public.detalle_pedidos
    WHERE pedido_id = pedido_uuid;

    RETURN total;
END;
$$ LANGUAGE plpgsql;

-- 6. CREAR ÍNDICES PARA MEJOR RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON public.productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_vendedor ON public.productos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_productos_precio ON public.productos(precio);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON public.productos(activo);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON public.productos(destacado);
CREATE INDEX IF NOT EXISTS idx_pedidos_usuario ON public.pedidos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_vendedor ON public.pedidos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_estado ON public.pedidos(estado);
CREATE INDEX IF NOT EXISTS idx_detalle_pedidos_pedido ON public.detalle_pedidos(pedido_id);

-- 7. INSERTAR TU PERFIL COMO ADMIN
-- =====================================================
-- Nota: Necesitarás reemplazar 'TU_USER_ID' con tu ID real de Supabase

-- INSERT INTO public.perfiles (
--     id,
--     email,
--     nombres,
--     apellidos,
--     telefono,
--     carnet_identidad,
--     ciudad,
--     rol,
--     descripcion_vendedor,
--     especialidad,
--     acepta_envios,
--     ciudades_envio
-- ) VALUES (
--     'TU_USER_ID', -- Reemplaza con tu UUID de Supabase
--     'calebsahon@gmail.com',
--     'Caleb',
--     'Sahón',
--     '70123456',
--     '12345678',
--     'La Paz',
--     'admin',
--     'Desarrollador y administrador de Mercado Express',
--     'Tecnología y desarrollo',
--     true,
--     'La Paz, El Alto, Cochabamba, Santa Cruz'
-- ) ON CONFLICT (id) DO UPDATE SET
--     rol = 'admin',
--     descripcion_vendedor = 'Desarrollador y administrador de Mercado Express',
--     especialidad = 'Tecnología y desarrollo';

-- =====================================================
-- FIN DE CONFIGURACIÓN
-- =====================================================

-- Verificar que todo se insertó correctamente
SELECT 'Categorías creadas:' as tipo, COUNT(*) as cantidad FROM public.categorias
UNION ALL
SELECT 'Productos creados:' as tipo, COUNT(*) as cantidad FROM public.productos
UNION ALL
SELECT 'Perfiles creados:' as tipo, COUNT(*) as cantidad FROM public.perfiles;