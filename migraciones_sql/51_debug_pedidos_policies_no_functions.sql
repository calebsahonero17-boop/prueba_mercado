-- migraciones_sql/51_debug_pedidos_policies_no_functions.sql

-- Temporarily simplifying 'pedidos' policies for debugging, removing function calls.

BEGIN;

RAISE NOTICE 'Paso 1: Eliminando políticas existentes en pedidos...';
DROP POLICY IF EXISTS "1_Usuarios gestionan sus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos;
-- Dropping older policies just in case they still exist
DROP POLICY IF EXISTS "Ver propios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Crear propios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins ven todos los pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins actualizan pedidos" ON public.pedidos;


RAISE NOTICE 'Paso 2: Creando políticas de depuración para pedidos (sin funciones)...';

-- Policy for normal users to manage their own orders.
CREATE POLICY "DEBUG - 1_Usuarios gestionan sus pedidos" ON public.pedidos
FOR ALL
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- The policy that uses 'es_moderador_o_superior()' is intentionally NOT recreated here.
-- This is to test if the function call is the source of the recursion.

RAISE NOTICE '✅ Proceso completado. Políticas de "pedidos" simplificadas para depuración.';

COMMIT;
