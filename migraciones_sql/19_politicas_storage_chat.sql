--
-- Políticas de Seguridad para el Almacenamiento de Imágenes del Chat (Supabase Storage)
--

-- 1. Política para permitir la LECTURA de imágenes a CUALQUIERA (ya que es un bucket público)
-- Esta política asegura que las imágenes se puedan mostrar en la aplicación.
DROP POLICY IF EXISTS "Permitir lectura pública de imágenes del chat" ON storage.objects;

CREATE POLICY "Permitir lectura pública de imágenes del chat"
ON storage.objects FOR SELECT
USING ( bucket_id = 'chat_images' );


-- 2. Política para permitir la ESCRITURA (subida de archivos) solo a los participantes de la conversación.
-- ESTA ES LA REGLA QUE FALTA Y SOLUCIONA EL ERROR.
DROP POLICY IF EXISTS "Permitir subida de imagen a participantes del chat" ON storage.objects;

CREATE POLICY "Permitir subida de imagen a participantes del chat"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat_images' AND
  -- La ruta del archivo debe ser: public/{conversation_id}/{user_id}-{timestamp}
  -- Extraemos el ID de la conversación de la ruta del archivo para verificar los permisos.
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE id = (string_to_array(name, '/'))[2]::uuid
      AND (auth.uid() = comprador_id OR auth.uid() = vendedor_id)
  )
);

-- Comentario para documentar la política
COMMENT ON POLICY "Permitir subida de imagen a participantes del chat" ON storage.objects IS 'Permite a un usuario autenticado subir una imagen solo si es parte de la conversación, cuyo ID está en la ruta del archivo.';

