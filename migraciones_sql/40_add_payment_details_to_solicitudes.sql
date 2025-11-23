-- migraciones_sql/40_add_payment_details_to_solicitudes.sql

ALTER TABLE public.solicitudes_suscripcion
ADD COLUMN metodo_pago TEXT,
ADD COLUMN numero_transaccion TEXT,
ADD COLUMN url_comprobante TEXT;

COMMENT ON COLUMN public.solicitudes_suscripcion.metodo_pago IS 'Método de pago seleccionado por el usuario (ej. tigo_money, yape_bolivia, qr_simple).';
COMMENT ON COLUMN public.solicitudes_suscripcion.numero_transaccion IS 'Número de transacción o código de operación proporcionado por el usuario.';
COMMENT ON COLUMN public.solicitudes_suscripcion.url_comprobante IS 'URL del comprobante de pago (captura de pantalla) subido por el usuario.';
