-- ================================================================
-- MIGRACIÓN 37: SEPARACIÓN DE ROLES ADMIN Y SUPER_ADMIN
-- FECHA: 2025-11-14
-- AUTOR: Asistente de IA
--
-- OBJETIVO:
-- 1. Diferenciar los permisos entre 'admin' y 'super_admin'.
-- 2. 'super_admin': Control total del sistema, incluida la gestión de roles.
-- 3. 'admin': Gestión de operaciones (productos, pedidos), sin poder cambiar roles.
-- ================================================================

BEGIN;

-- =====================================================
-- PASO 1: FUNCIONES AUXILIARES DE ROLES
-- Se crean funciones más granulares para verificar roles.
-- =====================================================

-- Función para verificar si el usuario es super_admin
CREATE OR REPLACE FUNCTION public.es_super_administrador()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id::uuid = auth.uid() AND rol = 'super_admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es admin (solo admin)
CREATE OR REPLACE FUNCTION public.es_administrador()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id::uuid = auth.uid() AND rol = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es admin o superior
CREATE OR REPLACE FUNCTION public.es_administrador_o_superior()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id::uuid = auth.uid() AND rol IN ('admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para verificar si el usuario es moderador o superior (sin cambios, pero se incluye por completitud)
CREATE OR REPLACE FUNCTION public.es_moderador_o_superior()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.perfiles
        WHERE id::uuid = auth.uid() AND rol IN ('moderador', 'admin', 'super_admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- =====================================================
-- PASO 2: TRIGGER PARA PROTEGER LA COLUMNA 'rol'
-- Este trigger previene que un 'admin' pueda cambiar el rol de un usuario.
-- =====================================================

-- La función que se ejecutará con el trigger
CREATE OR REPLACE FUNCTION public.funcion_proteger_cambio_rol()
RETURNS TRIGGER AS $$
DECLARE
  usuario_es_super_admin BOOLEAN;
BEGIN
  -- Se verifica si el usuario que ejecuta la acción es un super_admin
  SELECT public.es_super_administrador() INTO usuario_es_super_admin;

  -- Si el rol del registro está cambiando (NEW.rol es diferente de OLD.rol)
  -- Y el usuario que hace el cambio NO es un super_admin
  IF NEW.rol IS DISTINCT FROM OLD.rol AND (usuario_es_super_admin IS NULL OR usuario_es_super_admin = FALSE) THEN
    -- Entonces, se lanza un error y se cancela la transacción
    RAISE EXCEPTION 'Acción no permitida: Solo los super_administradores pueden cambiar el rol de un usuario.';
  END IF;

  -- Si la condición no se cumple, se permite la actualización
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Se elimina el trigger si ya existe para evitar duplicados
DROP TRIGGER IF EXISTS trigger_proteger_cambio_rol ON public.perfiles;

-- Se crea el trigger en la tabla 'perfiles'
-- Se ejecuta ANTES de cada ACTUALIZACIÓN en cualquier fila (FOR EACH ROW)
CREATE TRIGGER trigger_proteger_cambio_rol
    BEFORE UPDATE ON public.perfiles
    FOR EACH ROW
    EXECUTE FUNCTION public.funcion_proteger_cambio_rol();


-- =====================================================
-- PASO 3: ACTUALIZACIÓN DE POLÍTICAS DE SEGURIDAD (RLS)
-- Se redefinen las políticas para usar las nuevas funciones de roles.
-- =====================================================

-- --- Tabla: perfiles ---
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "1_Ver propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "2_Actualizar propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "3_Admins y superiores ven todos los perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "4_Super_admins actualizan cualquier perfil" ON public.perfiles;
DROP POLICY IF EXISTS "5_Admins actualizan perfiles" ON public.perfiles;
DROP POLICY IF EXISTS "6_Registro público" ON public.perfiles;

CREATE POLICY "1_Ver propio perfil" ON public.perfiles FOR SELECT USING (auth.uid() = id::uuid);
CREATE POLICY "2_Actualizar propio perfil" ON public.perfiles FOR UPDATE USING (auth.uid() = id::uuid);
CREATE POLICY "3_Admins y superiores ven todos los perfiles" ON public.perfiles FOR SELECT USING (public.es_administrador_o_superior());
CREATE POLICY "4_Super_admins actualizan cualquier perfil" ON public.perfiles FOR UPDATE USING (public.es_super_administrador());
-- Esta política permite a los admins actualizar, pero el TRIGGER anterior les bloquea el cambio de ROL.
CREATE POLICY "5_Admins actualizan perfiles" ON public.perfiles FOR UPDATE USING (public.es_administrador());
CREATE POLICY "6_Registro público" ON public.perfiles FOR INSERT WITH CHECK (true);


-- --- Tabla: productos ---
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "1_Ver productos activos" ON public.productos;
DROP POLICY IF EXISTS "2_Ver propios productos" ON public.productos;
DROP POLICY IF EXISTS "3_Crear productos" ON public.productos;
DROP POLICY IF EXISTS "4_Actualizar propios productos" ON public.productos;
DROP POLICY IF EXISTS "5_Admins y superiores gestionan productos" ON public.productos;

CREATE POLICY "1_Ver productos activos" ON public.productos FOR SELECT USING (activo = true);
CREATE POLICY "2_Ver propios productos" ON public.productos FOR SELECT USING (auth.uid() = vendedor_id);
CREATE POLICY "3_Crear productos" ON public.productos FOR INSERT WITH CHECK (auth.uid() = vendedor_id);
CREATE POLICY "4_Actualizar propios productos" ON public.productos FOR UPDATE USING (auth.uid() = vendedor_id);
-- Los admins gestionan productos, lo cual es una tarea operativa.
CREATE POLICY "5_Admins y superiores gestionan productos" ON public.productos FOR ALL USING (public.es_administrador_o_superior());


-- --- Tablas: pedidos y detalle_pedidos ---
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.detalle_pedidos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "1_Usuarios gestionan sus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos;

CREATE POLICY "1_Usuarios gestionan sus pedidos" ON public.pedidos FOR ALL USING (auth.uid() = usuario_id);
CREATE POLICY "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos FOR ALL USING (public.es_moderador_o_superior());
CREATE POLICY "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos FOR ALL USING (EXISTS (SELECT 1 FROM pedidos WHERE pedidos.id = detalle_pedidos.pedido_id AND pedidos.usuario_id = auth.uid()));
CREATE POLICY "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos FOR ALL USING (public.es_moderador_o_superior());


-- --- Tabla: carrito ---
ALTER TABLE public.carrito ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Gestionar propio carrito" ON public.carrito;
CREATE POLICY "Gestionar propio carrito" ON public.carrito FOR ALL USING (auth.uid() = usuario_id) WITH CHECK (auth.uid() = usuario_id);


-- =====================================================
-- PASO 4: MENSAJE DE CONFIRMACIÓN
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ MIGRACIÓN 37 COMPLETA: Roles "admin" y "super_admin" han sido separados exitosamente.';
    RAISE NOTICE '🛡️ Trigger de protección de roles instalado.';
    RAISE NOTICE '🔒 Políticas de seguridad actualizadas.';
END $$;

COMMIT;
