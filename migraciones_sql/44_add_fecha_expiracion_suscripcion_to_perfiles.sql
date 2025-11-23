-- migraciones_sql/44_add_fecha_expiracion_suscripcion_to_perfiles.sql

ALTER TABLE public.perfiles
ADD COLUMN fecha_expiracion_suscripcion TIMESTAMP WITH TIME ZONE;

COMMENT ON COLUMN public.perfiles.fecha_expiracion_suscripcion IS 'Fecha de expiración de la suscripción del vendedor.';
