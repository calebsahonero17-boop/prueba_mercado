-- Verificar las políticas de Storage
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- Si no hay políticas, necesitas ejecutar esto:
-- Las políticas permiten que usuarios autenticados suban archivos

-- Eliminar políticas existentes si causan problemas
DROP POLICY IF EXISTS "Imágenes públicas - lectura" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados - subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Dueños - actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Dueños y admins - eliminar imágenes" ON storage.objects;

-- Crear políticas más permisivas para testing
CREATE POLICY "public_read_productos"
ON storage.objects FOR SELECT
USING (bucket_id = 'productos');

CREATE POLICY "authenticated_upload_productos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'productos'
  AND (storage.foldername(name))[1] IS NOT NULL
);

CREATE POLICY "authenticated_update_productos"
ON storage.objects FOR UPDATE
USING (bucket_id = 'productos');

CREATE POLICY "authenticated_delete_productos"
ON storage.objects FOR DELETE
USING (bucket_id = 'productos');
