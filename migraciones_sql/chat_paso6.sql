-- PASO 6: Políticas de seguridad para mensajes
-- Los usuarios solo pueden ver mensajes de sus conversaciones
CREATE POLICY "Users can view messages from their conversations" ON mensajes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversaciones
      WHERE id = conversacion_id
      AND (comprador_id::text = auth.uid()::text OR vendedor_id::text = auth.uid()::text)
    )
  );

-- Los usuarios pueden enviar mensajes a sus conversaciones
CREATE POLICY "Users can send messages to their conversations" ON mensajes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM conversaciones
      WHERE id = conversacion_id
      AND (comprador_id::text = auth.uid()::text OR vendedor_id::text = auth.uid()::text)
    )
    AND remitente_id::text = auth.uid()::text
  );