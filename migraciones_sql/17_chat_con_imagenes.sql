--
-- Paso 1: Añadir una columna para la URL de la imagen en la tabla de mensajes
--
ALTER TABLE public.mensajes
ADD COLUMN imagen_url TEXT;

-- Comentario sobre la nueva columna
COMMENT ON COLUMN public.mensajes.imagen_url IS 'URL de la imagen adjunta en el mensaje, si existe.';

--
-- Paso 2: Ajustar la política de inserción para permitir mensajes con solo imagen
--
-- Primero, eliminamos la política existente para poder reemplazarla.
DROP POLICY IF EXISTS "Permitir crear mensajes a los participantes" ON public.mensajes;

-- Creamos la nueva política. La diferencia es que ahora el 'contenido' puede ser nulo si hay una 'imagen_url'.
CREATE POLICY "Permitir crear mensajes a los participantes"
ON public.mensajes FOR INSERT
WITH CHECK (
  auth.uid() = remitente_id AND
  (char_length(contenido) > 0 OR imagen_url IS NOT NULL) AND -- Asegura que el mensaje no esté vacío (debe tener texto o imagen)
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE conversaciones.id = mensajes.conversacion_id
  )
);

