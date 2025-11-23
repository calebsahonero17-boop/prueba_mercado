-- PASO 8: POLÍTICAS DE ACCESO PARA EL BUCKET DE CÓDIGOS QR
-- ========================================================================

-- Estas políticas aseguran que los archivos en el bucket 'qrs_vendedores' 
-- puedan ser gestionados de forma segura por los usuarios.

-- 1. Política de SELECCIÓN (SELECT)
-- Permite que CUALQUIERA pueda ver los códigos QR. Esto es necesario para que
-- los compradores puedan ver el QR al momento de pagar.
CREATE POLICY "Public QR Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'qrs_vendedores' );


-- 2. Política de INSERCIÓN (INSERT)
-- Permite que un usuario autenticado suba un archivo solo si el nombre del archivo
-- empieza con su propio ID de usuario. Esto evita que un vendedor sobrescriba el QR de otro.
CREATE POLICY "Vendor QR Insert Policy" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'qrs_vendedores' AND auth.uid() = (storage.foldername(name))[1]::uuid );


-- 3. Política de ACTUALIZACIÓN (UPDATE)
-- Permite que un usuario autenticado actualice su propio archivo QR.
CREATE POLICY "Vendor QR Update Policy" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'qrs_vendedores' AND auth.uid() = (storage.foldername(name))[1]::uuid );


-- NOTA: Ejecuta este script en el "SQL Editor" de Supabase para aplicar los permisos.
