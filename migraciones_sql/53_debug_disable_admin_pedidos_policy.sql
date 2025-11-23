-- ================================================================
-- MIGRACIÓN 53: [DEBUG] DESACTIVACIÓN TEMPORAL DE POLÍTICA DE PEDIDOS
-- FECHA: 2025-11-18
-- AUTOR: Asistente de IA
--
-- OBJETIVO:
-- Aislar la causa del error de recursión infinita en 'pedidos'.
-- Se desactiva temporalmente la política compleja para administradores/moderadores.
--
-- ADVERTENCIA:
-- Este es un paso de depuración y es INSEGURO para un entorno de producción.
-- Mientras esta política esté desactivada, los administradores y moderadores
-- podrían no tener acceso a la gestión de pedidos.
-- El propósito es verificar si el error de subida de audio desaparece.
-- ================================================================

BEGIN;

RAISE NOTICE 'Paso 1: Desactivando temporalmente la política de administrador para "pedidos"...';

-- Eliminar la política que se sospecha que causa la recursión.
DROP POLICY IF EXISTS "2_Moderadores y superiores gestionan todos los pedidos" ON public.pedidos;

RAISE NOTICE '✅ MIGRACIÓN 53 COMPLETA: La política de administrador para pedidos ha sido desactivada.';
RAISE NOTICE '下一步: Por favor, intenta subir un archivo de audio en el chat ahora.';
RAISE NOTICE 'Si el error desaparece, hemos encontrado la política problemática.';
RAISE NOTICE 'Si el error persiste, la causa es otra.';

COMMIT;
