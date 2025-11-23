-- ================================================================
-- MIGRACIÓN 52: CORRECCIÓN DE RECURSIÓN INFINITA EN POLÍTICAS DE PEDIDOS
-- FECHA: 2025-11-18
-- AUTOR: Asistente de IA
--
-- OBJETIVO:
-- Solucionar el error "infinite recursion detected in policy for relation 'pedidos'".
-- El problema se debe a que la política de seguridad de 'pedidos' utiliza una función
-- SECURITY DEFINER ('es_moderador_o_superior') que consulta otra tabla ('perfiles')
-- con sus propias políticas, creando un ciclo de dependencias complejo y propenso a la recursión.
--
-- SOLUCIÓN:
-- Se reemplaza la llamada a la función por una subconsulta directa (inlining)
-- dentro de la política. Esto hace la dependencia explícita y evita la recursión.
-- ================================================================

BEGIN;

RAISE NOTICE 'Paso 1: Eliminando las políticas problemáticas en "pedidos" y "detalle_pedidos"...';

-- Eliminar la política en 'pedidos' que usa la función.
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos;

-- Eliminar la política en 'detalle_pedidos' que usa la misma función.
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos;


RAISE NOTICE 'Paso 2: Creando políticas corregidas con lógica "inlined"...';

-- Re-crear la política para 'pedidos' sin llamar a la función.
CREATE POLICY "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol IN ('moderador', 'admin', 'super_admin')
  )
);

-- Re-crear la política para 'detalle_pedidos' sin llamar a la función.
CREATE POLICY "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol IN ('moderador', 'admin', 'super_admin')
  )
);

RAISE NOTICE '✅ MIGRACIÓN 52 COMPLETA: Corregido el error de recursión en las políticas de pedidos.';

COMMIT;
