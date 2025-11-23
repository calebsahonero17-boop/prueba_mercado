--
-- Creación del Bucket y Políticas de Seguridad para el Almacenamiento de Audio del Chat
--

-- 1. Crear el bucket para los audios del chat si no existe
-- Lo hacemos público para facilitar el acceso a los archivos, la seguridad se gestiona con RLS.
INSERT INTO storage.buckets (id, name, public)
VALUES ('chat_audio', 'chat_audio', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Política para permitir la LECTURA de audios a CUALQUIERA (bucket público)
DROP POLICY IF EXISTS "Permitir lectura pública de audios del chat" ON storage.objects;

CREATE POLICY "Permitir lectura pública de audios del chat"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat_audio' );

-- 3. Política para permitir la ESCRITURA (subida de audios) solo a los participantes de la conversación.
DROP POLICY IF EXISTS "Permitir subida de audio a participantes del chat" ON storage.objects;

CREATE POLICY "Permitir subida de audio a participantes del chat"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat_audio' AND
  -- La ruta del archivo debe ser: {conversation_id}/{user_id}-{timestamp}.{extension}
  -- Extraemos el ID de la conversación de la ruta del archivo para verificar los permisos.
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE id = (string_to_array(name, '/'))[1]::uuid
      AND (auth.uid() = comprador_id OR auth.uid() = vendedor_id)
  )
);

-- 4. Política para permitir a los usuarios ELIMINAR sus propios audios
DROP POLICY IF EXISTS "Permitir eliminar audios propios del chat" ON storage.objects;

CREATE POLICY "Permitir eliminar audios propios del chat"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'chat_audio' AND
  auth.uid() = owner
);
