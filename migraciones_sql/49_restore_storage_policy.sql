-- migraciones_sql/49_restore_storage_policy.sql

-- Restoring the original, secure storage insert policy.

-- 1. Drop the debugging policy.
DROP POLICY IF EXISTS "DEBUG - Permitir subida de audio a participantes del chat" ON storage.objects;

-- 2. Re-create the original secure policy.
CREATE POLICY "Permitir subida de audio a participantes del chat"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat_audio' AND
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE id = (string_to_array(name, '/'))[1]::uuid
      AND (auth.uid() = comprador_id OR auth.uid() = vendedor_id)
  )
);
