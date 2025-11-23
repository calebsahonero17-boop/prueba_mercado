--
-- V2: Corregir la política de seguridad para la subida de imágenes del chat
-- Este enfoque simplifica la ruta del archivo y la lógica de la política para ser más robusto.
--

-- 1. Eliminar la política de ESCRITURA (INSERT) anterior.
DROP POLICY IF EXISTS "Permitir subida de imagen a participantes del chat" ON storage.objects;

-- 2. Crear la nueva política de ESCRITURA v2.
-- Esta política espera un nombre de archivo como: {conversation_id}_{user_id}_{timestamp}.jpg
-- y extrae la primera parte para la validación.
CREATE POLICY "Permitir subida de imagen a participantes del chat v2"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat_images' AND
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE id = (split_part(name, '_', 1))::uuid
      AND (auth.uid() = comprador_id OR auth.uid() = vendedor_id)
  )
);

-- Comentario para documentar la nueva política
COMMENT ON POLICY "Permitir subida de imagen a participantes del chat v2" ON storage.objects IS 'V2: Permite subir una imagen si el ID de la conversación (la primera parte del nombre del archivo) corresponde a una en la que el usuario participa.';

