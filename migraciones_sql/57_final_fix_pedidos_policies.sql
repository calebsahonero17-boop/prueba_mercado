-- ================================================================
-- MIGRACIÓN 57: [SOLUCIÓN FINAL] Políticas de Pedidos y Detalle_Pedidos
-- FECHA: 2025-11-18
-- AUTOR: Asistente de IA
--
-- OBJETIVO:
-- Solucionar de forma definitiva el error de recursión infinita.
-- Se reestructuran las políticas de 'pedidos' y 'detalle_pedidos' para
-- que sean seguras, funcionales y no recursivas.
-- ================================================================

BEGIN;

-- PASO 1: LIMPIEZA EXHAUSTIVA
-- Eliminamos todas las políticas de depuración y las versiones anteriores
-- para asegurar un estado limpio antes de aplicar la solución final.

RAISE NOTICE 'Paso 1: Limpieza exhaustiva de políticas en "pedidos" y "detalle_pedidos"...';

-- Políticas de 'pedidos'
DROP POLICY IF EXISTS "1_Usuarios gestionan sus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos;

-- Políticas de 'detalle_pedidos'
DROP POLICY IF EXISTS "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "DEBUG - 1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos;


-- PASO 2: CREACIÓN DE FUNCIÓN AUXILIAR SEGURA
-- Se crea una función 'SECURITY INVOKER' que se ejecuta con los permisos del
-- usuario que la llama. Esto simplifica la cadena de RLS y ayuda a prevenir
-- recursiones inesperadas entre políticas.

RAISE NOTICE 'Paso 2: Creando función auxiliar de seguridad...';

CREATE OR REPLACE FUNCTION public.usuario_es_dueno_del_pedido(p_pedido_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.pedidos
    WHERE id = p_pedido_id AND usuario_id = auth.uid()
  );
$$;


-- PASO 3: CREACIÓN DE LAS POLÍTICAS FINALES Y SEGURAS

RAISE NOTICE 'Paso 3: Creando las políticas finales y seguras...';

-- Políticas para 'pedidos'
-- 1. Los usuarios gestionan sus propios pedidos.
CREATE POLICY "1_Usuarios gestionan sus pedidos" ON public.pedidos
FOR ALL
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);

-- 2. Los moderadores y administradores gestionan todos los pedidos (usando lógica inlined).
CREATE POLICY "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol IN ('moderador', 'admin', 'super_admin')
  )
);

-- Políticas para 'detalle_pedidos'
-- 1. Los usuarios gestionan los detalles de los pedidos que les pertenecen (usando la nueva función).
CREATE POLICY "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos
FOR ALL
USING ( public.usuario_es_dueno_del_pedido(pedido_id) );

-- 2. Los moderadores y administradores gestionan todos los detalles (usando lógica inlined).
CREATE POLICY "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.perfiles
    WHERE id = auth.uid() AND rol IN ('moderador', 'admin', 'super_admin')
  )
);


RAISE NOTICE '✅ MIGRACIÓN 57 COMPLETA: El sistema de políticas ha sido reconstruido.';
RAISE NOTICE 'El problema de recursión debería estar solucionado de forma definitiva.';

COMMIT;
