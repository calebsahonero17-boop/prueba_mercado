-- =====================================================
-- POLÍTICAS DE SEGURIDAD (ROW LEVEL SECURITY)
-- Mercado Express - E-commerce Platform
-- =====================================================

-- HABILITAR RLS EN TODAS LAS TABLAS
-- =====================================================
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE detalle_pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE carrito ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS PARA TABLA PERFILES
-- =====================================================

-- Los usuarios pueden ver su propio perfil
CREATE POLICY "Ver propio perfil" ON perfiles
    FOR SELECT USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "Actualizar propio perfil" ON perfiles
    FOR UPDATE USING (auth.uid() = id);

-- Los admins pueden ver todos los perfiles
CREATE POLICY "Admins ven todos los perfiles" ON perfiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE id = auth.uid()
            AND rol IN ('admin', 'super_admin')
        )
    );

-- Los admins pueden actualizar cualquier perfil
CREATE POLICY "Admins actualizan perfiles" ON perfiles
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE id = auth.uid()
            AND rol IN ('admin', 'super_admin')
        )
    );

-- Permitir registro de nuevos usuarios (INSERT público)
CREATE POLICY "Registro público" ON perfiles
    FOR INSERT WITH CHECK (true);

-- =====================================================
-- POLÍTICAS PARA TABLA PRODUCTOS
-- =====================================================

-- Todos pueden ver productos activos
CREATE POLICY "Ver productos activos" ON productos
    FOR SELECT USING (activo = true);

-- Los vendedores pueden ver sus propios productos
CREATE POLICY "Ver propios productos" ON productos
    FOR SELECT USING (auth.uid() = vendedor_id);

-- Los vendedores pueden crear productos
CREATE POLICY "Crear productos" ON productos
    FOR INSERT WITH CHECK (auth.uid() = vendedor_id);

-- Los vendedores pueden actualizar sus propios productos
CREATE POLICY "Actualizar propios productos" ON productos
    FOR UPDATE USING (auth.uid() = vendedor_id);

-- Los admins pueden ver, crear y actualizar todos los productos
CREATE POLICY "Admins gestionan productos" ON productos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE id = auth.uid()
            AND rol IN ('admin', 'super_admin')
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABLA PEDIDOS
-- =====================================================

-- Los usuarios pueden ver sus propios pedidos
CREATE POLICY "Ver propios pedidos" ON pedidos
    FOR SELECT USING (auth.uid() = usuario_id);

-- Los usuarios pueden crear sus propios pedidos
CREATE POLICY "Crear propios pedidos" ON pedidos
    FOR INSERT WITH CHECK (auth.uid() = usuario_id);

-- Los admins pueden ver todos los pedidos
CREATE POLICY "Admins ven todos los pedidos" ON pedidos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE id = auth.uid()
            AND rol IN ('admin', 'super_admin', 'moderador')
        )
    );

-- Los admins pueden actualizar pedidos (cambiar estado)
CREATE POLICY "Admins actualizan pedidos" ON pedidos
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE id = auth.uid()
            AND rol IN ('admin', 'super_admin', 'moderador')
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABLA DETALLE_PEDIDOS
-- =====================================================

-- Los usuarios pueden ver detalles de sus propios pedidos
CREATE POLICY "Ver detalles propios pedidos" ON detalle_pedidos
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pedidos
            WHERE pedidos.id = detalle_pedidos.pedido_id
            AND pedidos.usuario_id = auth.uid()
        )
    );

-- Los usuarios pueden crear detalles de sus propios pedidos
CREATE POLICY "Crear detalles propios pedidos" ON detalle_pedidos
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pedidos
            WHERE pedidos.id = detalle_pedidos.pedido_id
            AND pedidos.usuario_id = auth.uid()
        )
    );

-- Los admins pueden ver todos los detalles
CREATE POLICY "Admins ven todos los detalles" ON detalle_pedidos
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM perfiles
            WHERE id = auth.uid()
            AND rol IN ('admin', 'super_admin', 'moderador')
        )
    );

-- =====================================================
-- POLÍTICAS PARA TABLA CARRITO
-- =====================================================

-- Los usuarios pueden gestionar su propio carrito
CREATE POLICY "Gestionar propio carrito" ON carrito
    FOR ALL USING (auth.uid() = usuario_id)
    WITH CHECK (auth.uid() = usuario_id);

-- =====================================================
-- FUNCIONES AUXILIARES PARA POLÍTICAS
-- =====================================================

-- Función para verificar si el usuario es admin
CREATE OR REPLACE FUNCTION es_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM perfiles
        WHERE id = auth.uid()
        AND rol IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es moderador o superior
CREATE OR REPLACE FUNCTION es_moderador_o_superior()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM perfiles
        WHERE id = auth.uid()
        AND rol IN ('moderador', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '🔒 Row Level Security configurado exitosamente';
    RAISE NOTICE '👤 Políticas de perfiles: ✅';
    RAISE NOTICE '📦 Políticas de productos: ✅';
    RAISE NOTICE '📋 Políticas de pedidos: ✅';
    RAISE NOTICE '🛒 Políticas de carrito: ✅';
    RAISE NOTICE '🛡️ Funciones de seguridad creadas: ✅';
    RAISE NOTICE '🚀 Sistema listo y seguro!';
END $$;