-- ================================================================
-- MIGRACIÓN 54: [DEBUG] DESACTIVACIÓN NUCLEAR DE TODAS LAS POLÍTICAS DE PEDIDOS
-- FECHA: 2025-11-18
-- AUTOR: Asistente de IA
--
-- OBJETIVO:
-- Aislar definitivamente la causa del error de recursión infinita en 'pedidos'.
-- Se desactivan temporalmente TODAS las políticas conocidas en 'pedidos' y 'detalle_pedidos'.
--
-- ADVERTENCIA MÁXIMA:
-- Este es el último paso de depuración y es EXTREMADAMENTE INSEGURO.
-- Deja las tablas 'pedidos' y 'detalle_pedidos' sin protección de RLS.
-- NO USAR EN PRODUCCIÓN BAJO NINGUNA CIRCUNSTANCIA.
-- ================================================================

BEGIN;

RAISE NOTICE 'Paso 1: Desactivando TODAS las políticas conocidas para "pedidos"...';
DROP POLICY IF EXISTS "1_Usuarios gestionan sus pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos;
-- Por si acaso, nombres antiguos
DROP POLICY IF EXISTS "Ver propios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Crear propios pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins ven todos los pedidos" ON public.pedidos;
DROP POLICY IF EXISTS "Admins actualizan pedidos" ON public.pedidos;


RAISE NOTICE 'Paso 2: Desactivando TODAS las políticas conocidas para "detalle_pedidos"...';
DROP POLICY IF EXISTS "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los detalles" ON public.detalle_pedidos;
-- Por si acaso, nombres antiguos
DROP POLICY IF EXISTS "Ver detalles propios pedidos" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "Crear detalles propios pedidos" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "Admins ven todos los detalles" ON public.detalle_pedidos;


RAISE NOTICE '✅ MIGRACIÓN 54 COMPLETA: Se han desactivado todas las políticas de pedidos y detalle_pedidos.';
RAISE NOTICE 'PRUEBA FINAL: Por favor, intenta subir un archivo de audio en el chat AHORA MISMO.';
RAISE NOTICE 'Este es el momento de la verdad. Informa del resultado.';

COMMIT;
