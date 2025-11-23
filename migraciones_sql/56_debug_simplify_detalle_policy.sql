-- ================================================================
-- MIGRACIÓN 56: [DEBUG] SIMPLIFICACIÓN DE POLÍTICA DE DETALLE_PEDIDOS
-- FECHA: 2025-11-18
-- AUTOR: Asistente de IA
--
-- OBJETIVO:
-- Confirmar al 100% que la consulta a 'pedidos' desde la política de
-- 'detalle_pedidos' es la que desencadena la recursión.
--
-- ACCIÓN:
-- Se reemplaza temporalmente la política "1_Usuarios gestionan detalles de sus pedidos"
-- por una versión que no consulta a la tabla 'pedidos'.
--
-- ADVERTENCIA:
-- Esto es inseguro y solo para depuración. Permite a cualquier usuario
-- gestionar cualquier detalle de pedido.
-- ================================================================

BEGIN;

RAISE NOTICE 'Paso 1: Eliminando la política problemática en "detalle_pedidos"...';

DROP POLICY IF EXISTS "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos;


RAISE NOTICE 'Paso 2: Creando una política de depuración simplificada para "detalle_pedidos"...';

-- Re-crear la política sin consultar a la tabla 'pedidos'.
CREATE POLICY "DEBUG - 1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos
FOR ALL
USING (true); -- ¡INSEGURO! SOLO PARA DEPURAR


RAISE NOTICE '✅ MIGRACIÓN 56 COMPLETA: Política de detalle_pedidos simplificada.';
RAISE NOTICE 'Por favor, prueba la subida de audio una última vez e informa del resultado.';
RAISE NOTICE 'Si el error de recursión desaparece, tengo la solución final.';

COMMIT;
