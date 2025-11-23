-- Agrega campos publicos para el perfil de vendedor.
-- Estos campos seran visibles para todos los visitantes del perfil.
ALTER TABLE public.perfiles
ADD COLUMN IF NOT EXISTS descripcion TEXT, -- Descripcion del negocio o del vendedor
ADD COLUMN IF NOT EXISTS facebook_url TEXT, -- Enlace al perfil de Facebook
ADD COLUMN IF NOT EXISTS instagram_url TEXT, -- Enlace al perfil de Instagram
ADD COLUMN IF NOT EXISTS tiktok_url TEXT, -- Enlace al perfil de TikTok
ADD COLUMN IF NOT EXISTS ubicacion_publica TEXT, -- Texto descriptivo de la ubicacion (ej. "Zona Central, La Paz")
ADD COLUMN IF NOT EXISTS qr_pago_1_url TEXT, -- URL de la imagen del primer QR de pago
ADD COLUMN IF NOT EXISTS qr_pago_2_url TEXT; -- URL de la imagen del segundo QR de pago

-- Agrega un comentario a la tabla para explicar los nuevos campos.
COMMENT ON COLUMN public.perfiles.descripcion IS 'Descripcion publica del negocio o vendedor, visible para todos.';
COMMENT ON COLUMN public.perfiles.qr_pago_1_url IS 'URL a la imagen del primer QR de pago del vendedor.';

-- Nota: Es importante que las politicas de RLS permitan la lectura publica de estos nuevos campos para los perfiles de vendedores.
-- Ejemplo de como se podria actualizar la politica (NO EJECUTAR SI YA EXISTE UNA SIMILAR):
-- 
-- DROP POLICY IF EXISTS "Los perfiles son visibles para todos." ON public.perfiles;
-- CREATE POLICY "Los perfiles son visibles para todos." ON public.perfiles
-- FOR SELECT USING (true);
--
-- Y asegurarse que la politica de UPDATE solo permita al propio usuario modificar su perfil.
