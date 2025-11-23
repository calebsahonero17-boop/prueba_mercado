--
-- Añadir soporte para múltiples planes de suscripción en la tabla de perfiles.
--

-- 1. Definir un nuevo TIPO de dato para los planes, para asegurar consistencia.
-- Esto asegura que la columna solo pueda tener los valores 'basico' o 'premium'.
CREATE TYPE public.tipo_plan_suscripcion AS ENUM (
  'basico',
  'premium'
);

-- 2. Añadir la nueva columna a la tabla de perfiles.
-- Por defecto, los nuevos vendedores serán 'basico'.
ALTER TABLE public.perfiles
ADD COLUMN plan_suscripcion public.tipo_plan_suscripcion DEFAULT 'basico';

-- Comentario para documentar la nueva columna.
COMMENT ON COLUMN public.perfiles.plan_suscripcion IS 'El plan de suscripción actual del vendedor (basico, premium).';

