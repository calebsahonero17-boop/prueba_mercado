-- PASO 5: AÑADIR CAMPOS PARA EL ESQUEMA DE SUSCRIPCIONES DE VENDEDORES
-- ========================================================================

-- 1. MODIFICAR LA TABLA 'perfiles' PARA AÑADIR EL ROL DE 'vendedor'
-- Primero, eliminamos la restricción CHECK existente para poder reemplazarla.
ALTER TABLE public.perfiles DROP CONSTRAINT perfiles_rol_check;

-- Luego, añadimos la nueva restricción CHECK con el rol 'vendedor' incluido.
ALTER TABLE public.perfiles ADD CONSTRAINT perfiles_rol_check CHECK (rol IN ('usuario', 'vendedor', 'moderador', 'admin', 'super_admin'));


-- 2. AÑADIR COLUMNAS RELACIONADAS A LA SUSCRIPCIÓN EN LA TABLA 'perfiles'
-- Esta columna almacenará el tipo de plan que tiene el vendedor (ej. 'basico', 'premium').
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS plan_suscripcion TEXT;

-- Esta columna guardará la fecha y hora en que la suscripción del vendedor expira.
ALTER TABLE public.perfiles ADD COLUMN IF NOT EXISTS fecha_expiracion_suscripcion TIMESTAMP WITH TIME ZONE;


-- NOTA: Para aplicar estos cambios, debes ejecutar este script en tu base de datos de Supabase.
-- Puedes hacerlo copiando y pegando el contenido en el "SQL Editor" de tu proyecto en Supabase.

-- Ejemplo de cómo se vería un vendedor con una suscripción activa:
-- UPDATE public.perfiles
-- SET 
--   rol = 'vendedor',
--   plan_suscripcion = 'basico',
--   fecha_expiracion_suscripcion = '2025-12-31 23:59:59+00'
-- WHERE id = 'ID_DEL_USUARIO';
