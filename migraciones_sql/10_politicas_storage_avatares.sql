-- PASO 10: POLÍTICAS DE ACCESO PARA EL BUCKET DE AVATARES
-- ========================================================================

-- Estas políticas aseguran que los avatares en el bucket 'avatares' 
-- puedan ser gestionados de forma segura por los usuarios.

-- 1. Política de SELECCIÓN (SELECT)
-- Permite que CUALQUIERA pueda ver los avatares. Esto es necesario para 
-- mostrar las fotos de perfil en toda la aplicación.
DROP POLICY IF EXISTS "Public Avatar Read Access" ON storage.objects;
CREATE POLICY "Public Avatar Read Access" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'avatares' );


-- 2. Política de INSERCIÓN (INSERT)
-- Permite que un usuario autenticado suba un avatar solo si el nombre del archivo
-- está dentro de una carpeta con su propio ID de usuario.
DROP POLICY IF EXISTS "User Avatar Insert Policy" ON storage.objects;
CREATE POLICY "User Avatar Insert Policy" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'avatares' AND auth.uid() = ((string_to_array(name, '/'))[1])::uuid );


-- 3. Política de ACTUALIZACIÓN (UPDATE)
-- Permite que un usuario autenticado actualice su propio avatar.
DROP POLICY IF EXISTS "User Avatar Update Policy" ON storage.objects;
CREATE POLICY "User Avatar Update Policy" 
ON storage.objects FOR UPDATE 
USING ( bucket_id = 'avatares' AND auth.uid() = ((string_to_array(name, '/'))[1])::uuid );

-- 4. Política de BORRADO (DELETE)
-- Permite que un usuario autenticado elimine su propio avatar.
DROP POLICY IF EXISTS "User Avatar Delete Policy" ON storage.objects;
CREATE POLICY "User Avatar Delete Policy" 
ON storage.objects FOR DELETE 
USING ( bucket_id = 'avatares' AND auth.uid() = ((string_to_array(name, '/'))[1])::uuid );


-- NOTA: Ejecuta este script en el "SQL Editor" de Supabase para aplicar los permisos.
