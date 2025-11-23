--
-- Paso 1: Añadir una columna para la URL del audio en la tabla de mensajes
--
ALTER TABLE public.mensajes
ADD COLUMN audio_url TEXT;

-- Comentario sobre la nueva columna
COMMENT ON COLUMN public.mensajes.audio_url IS 'URL del audio adjunto en el mensaje, si existe.';

--
-- Paso 2: Ajustar la política de inserción para permitir mensajes con solo audio o imagen
--
-- Primero, eliminamos la política existente para poder reemplazarla.
DROP POLICY IF EXISTS "Permitir crear mensajes a los participantes" ON public.mensajes;

-- Creamos la nueva política. Ahora 'contenido' puede ser nulo si hay 'imagen_url' o 'audio_url'.
CREATE POLICY "Permitir crear mensajes a los participantes"
ON public.mensajes FOR INSERT
WITH CHECK (
  auth.uid() = remitente_id AND
  (char_length(contenido) > 0 OR imagen_url IS NOT NULL OR audio_url IS NOT NULL) AND -- Asegura que el mensaje no esté vacío
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE conversaciones.id = mensajes.conversacion_id
  )
);
