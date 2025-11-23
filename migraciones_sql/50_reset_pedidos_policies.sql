-- ================================================================
-- SCRIPT DE REINICIO DE POLÍTICAS PARA 'pedidos' Y 'detalle_pedidos'
-- OBJETIVO: Solucionar el error de recursión infinita.
-- ================================================================

BEGIN;

-- PASO 1: Eliminar todas las políticas existentes en las tablas problemáticas.
-- Esto asegura que no queden políticas antiguas o conflictivas.

RAISE NOTICE 'Paso 1: Eliminando políticas antiguas de pedidos...';
DROP POLICY IF EXISTS "1_Usuarios gestionan sus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos;
-- Eliminando políticas más antiguas por si acaso todavía existen
DROP POLICY IF EXISTS "Ver propios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Crear propios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins ven todos los pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins actualizan pedidos" ON public.pedidos;


RAISE NOTICE 'Paso 1: Eliminando políticas antiguas de detalle_pedidos...';
DROP POLICY IF EXISTS "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos;
-- Eliminando políticas más antiguas por si acaso todavía existen
DROP POLICY IF EXISTS "Ver detalles propios pedidos" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "Crear detalles propios pedidos" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "Admins ven todos los detalles" ON public.detalle_pedidos;


-- PASO 2: Re-crear las políticas de forma segura.
-- Estas son las políticas correctas y seguras basadas en tus archivos de migración.

RAISE NOTICE 'Paso 2: Creando políticas seguras para pedidos...';

-- Política para que los usuarios normales gestionen SUS PROPIOS pedidos.
CREATE POLICY "1_Usuarios gestionan sus pedidos" ON public.pedidos
FOR ALL
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- Política para que los moderadores y administradores gestionen TODOS los pedidos.
-- La función 'es_moderador_o_superior()' es de solo lectura y no puede causar recursión.
CREATE POLICY "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos
FOR ALL
USING (public.es_moderador_o_superior());


RAISE NOTICE 'Paso 2: Creando políticas seguras para detalle_pedidos...';

-- Política para que los usuarios normales vean y gestionen los detalles de sus propios pedidos.
CREATE POLICY "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.pedidos
    WHERE pedidos.id = detalle_pedidos.pedido_id AND pedidos.usuario_id = auth.uid()
));

-- Política para que los moderadores y administradores gestionen todos los detalles de pedidos.
CREATE POLICY "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos
FOR ALL
USING (public.es_moderador_o_superior());


RAISE NOTICE '✅ Proceso completado. Las políticas de "pedidos" y "detalle_pedidos" han sido reiniciadas.';

COMMIT;
