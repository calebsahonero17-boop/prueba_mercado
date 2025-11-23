--
-- Función para contar los mensajes no leídos de un usuario.
--
CREATE OR REPLACE FUNCTION count_unread_messages()
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INT
  FROM public.mensajes m
  JOIN public.conversaciones c ON m.conversacion_id = c.id
  WHERE 
    m.leido = FALSE
    AND m.remitente_id != auth.uid() -- El mensaje no fue enviado por mi
    AND (
      c.comprador_id = auth.uid() OR c.vendedor_id = auth.uid()
    ); -- Y yo soy parte de la conversación
$$;

-- Comentario sobre la función
COMMENT ON FUNCTION count_unread_messages() IS 'Calcula el número total de mensajes no leídos para el usuario autenticado.';

