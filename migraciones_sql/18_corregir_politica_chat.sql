--
-- Corregir la política de seguridad para leer mensajes
--

-- 1. Eliminar la política de lectura (SELECT) anterior que era incorrecta.
DROP POLICY IF EXISTS "Permitir leer mensajes a los participantes" ON public.mensajes;

-- 2. Crear la nueva política de lectura, más segura y explícita.
-- Esta regla asegura que un usuario solo puede leer mensajes si es
-- participante (comprador o vendedor) en la conversación padre.
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

-- Comentario para documentar el cambio
COMMENT ON POLICY "Permitir leer mensajes a los participantes" ON public.mensajes IS 'Los usuarios solo pueden leer mensajes de las conversaciones en las que participan.';

