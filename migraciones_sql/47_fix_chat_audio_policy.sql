-- migraciones_sql/47_fix_chat_audio_policy.sql

-- Re-applying policies for 'mensajes' table to ensure consistency.

-- 1. Drop existing policies to start fresh.
DROP POLICY IF EXISTS "Permitir leer mensajes a los participantes" ON public.mensajes;
DROP POLICY IF EXISTS "Permitir crear mensajes a los participantes" ON public.mensajes;

-- 2. Re-create SELECT policy.
-- Ensures a user can only read messages if they are a participant in the conversation.
CREATE POLICY "Permitir leer mensajes a los participantes"
ON public.mensajes FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE
      conversaciones.id = mensajes.conversacion_id AND
      (conversaciones.comprador_id = auth.uid() OR conversaciones.vendedor_id = auth.uid())
  )
);

-- 3. Re-create INSERT policy.
-- Ensures a user can only insert messages into conversations they are part of,
-- and that the message is not empty (has content, an image, or an audio url).
CREATE POLICY "Permitir crear mensajes a los participantes"
ON public.mensajes FOR INSERT
WITH CHECK (
  auth.uid() = remitente_id AND
  (
    (contenido IS NOT NULL AND char_length(contenido) > 0) OR
    imagen_url IS NOT NULL OR
    audio_url IS NOT NULL
  ) AND
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE conversaciones.id = mensajes.conversacion_id
      AND (conversaciones.comprador_id = auth.uid() OR conversaciones.vendedor_id = auth.uid())
  )
);
