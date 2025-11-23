-- migraciones_sql/48_debug_storage_policy.sql

-- Temporarily simplifying the storage insert policy for debugging.

-- 1. Drop the existing policy.
DROP POLICY IF EXISTS "Permitir subida de audio a participantes del chat" ON storage.objects;

-- 2. Create a simplified policy that allows any authenticated user to upload to the chat_audio bucket.
-- WARNING: This is insecure and should only be used for debugging.
CREATE POLICY "DEBUG - Permitir subida de audio a participantes del chat"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'chat_audio'
);