-- PASO 5: Políticas de seguridad para conversaciones
-- Los usuarios solo pueden ver conversaciones donde participan
CREATE POLICY "Users can view their own conversations" ON conversaciones
  FOR SELECT USING (
    auth.uid()::text = comprador_id::text OR
    auth.uid()::text = vendedor_id::text
  );

-- Los usuarios pueden crear conversaciones
CREATE POLICY "Users can create conversations" ON conversaciones
  FOR INSERT WITH CHECK (
    auth.uid()::text = comprador_id::text OR
    auth.uid()::text = vendedor_id::text
  );

-- Los usuarios pueden actualizar conversaciones donde participan
CREATE POLICY "Users can update their conversations" ON conversaciones
  FOR UPDATE USING (
    auth.uid()::text = comprador_id::text OR
    auth.uid()::text = vendedor_id::text
  );