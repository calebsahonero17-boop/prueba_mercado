-- ================================================================
-- MIGRACIÓN 58: [SOLUCIÓN FINAL] Corrección de CHECK Constraint en 'mensajes'
-- FECHA: 2025-11-18
-- AUTOR: Asistente de IA
--
-- OBJETIVO:
-- Solucionar el error de CHECK constraint "contenido_o_imagen_requeridos"
-- que impide guardar mensajes que solo contienen un audio.
--
-- ACCIÓN:
-- 1. Se elimina la constraint antigua que no contemplaba los audios.
-- 2. Se crea la constraint correcta que valida contenido, imagen O audio.
-- ================================================================

BEGIN;

RAISE NOTICE 'Paso 1: Eliminando la constraint de check antigua y conflictiva...';

-- Eliminar la regla antigua que no permite audios.
ALTER TABLE public.mensajes DROP CONSTRAINT IF EXISTS "contenido_o_imagen_requeridos";

-- Por si acaso, eliminamos también las otras versiones que hemos visto en los archivos.
ALTER TABLE public.mensajes DROP CONSTRAINT IF EXISTS "contenido_o_imagen_no_nulos";
ALTER TABLE public.mensajes DROP CONSTRAINT IF EXISTS "contenido_imagen_o_audio_no_nulos";


RAISE NOTICE 'Paso 2: Creando la constraint de check correcta y definitiva...';

-- Crear la regla correcta que permite texto, imagen O audio.
ALTER TABLE public.mensajes ADD CONSTRAINT "contenido_imagen_o_audio_no_nulos"
CHECK (
  (contenido IS NOT NULL AND char_length(trim(contenido)) > 0) OR
  (imagen_url IS NOT NULL AND char_length(trim(imagen_url)) > 0) OR
  (audio_url IS NOT NULL AND char_length(trim(audio_url)) > 0)
);


RAISE NOTICE '✅ MIGRACIÓN 58 COMPLETA: La tabla "mensajes" ahora acepta audios correctamente.';
RAISE NOTICE 'Este debería ser el arreglo definitivo. ¡Prueba la aplicación ahora!';

COMMIT;
