-- PASO 1: CREAR TABLAS BÁSICAS
-- =====================================================

-- 1. TABLA PERFILES (Usuarios)
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
CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(10,2) NOT NULL CHECK (subtotal >= 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABLA CARRITO
CREATE TABLE IF NOT EXISTS carrito (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES perfiles(id),
    producto_id UUID NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(usuario_id, producto_id)
);