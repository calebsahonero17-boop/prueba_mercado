--
-- Función para marcar todos los mensajes de una conversación como leídos para el usuario actual.
--
CREATE OR REPLACE FUNCTION mark_conversation_as_read(conversation_id_in UUID)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.mensajes
  SET leido = TRUE
  WHERE 
    conversacion_id = conversation_id_in
    AND remitente_id != auth.uid() -- Solo marcamos los mensajes recibidos
    AND leido = FALSE;
$$;

-- Comentario sobre la función
COMMENT ON FUNCTION mark_conversation_as_read(UUID) IS 'Marca todos los mensajes no leídos de una conversación como leídos para el usuario actual.';

