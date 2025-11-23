-- migraciones_sql/42_fix_add_avatar_column.sql
-- CORRECCIÓN: La columna 'avatar' nunca fue añadida, solo alterada.
-- Este script corrige eso añadiendo la columna si no existe.

ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS avatar TEXT;

COMMENT ON COLUMN public.perfiles.avatar IS 'URL del avatar del usuario, almacenado en Supabase Storage.';

