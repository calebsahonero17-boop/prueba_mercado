-- PASO 7: AÑADIR CAMPO PARA EL CÓDIGO QR DEL VENDEDOR
-- ========================================================================

-- Esta columna almacenará la URL pública de la imagen del código QR que cada
-- vendedor suba para recibir sus pagos.

ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS qr_pago_url TEXT;


-- NOTA: Como en los pasos anteriores, debes ejecutar este script en el "SQL Editor"
-- de tu proyecto en Supabase para aplicar el cambio.
