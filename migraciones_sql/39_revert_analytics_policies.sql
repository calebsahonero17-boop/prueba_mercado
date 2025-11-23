-- Este script revierte los cambios de las políticas de analytics para restaurar el inicio de sesión.

-- 1. Eliminar la función y TODAS las políticas que dependen de ella en un solo paso.
-- La opción CASCADE es la clave aquí, como sugirió el mensaje de error.
DROP FUNCTION IF EXISTS get_my_role() CASCADE;

-- 2. Re-crear la política ESENCIAL para que el inicio de sesión funcione.
-- Esta política permite a cada usuario leer únicamente su propio perfil.
CREATE POLICY "Los usuarios pueden ver sus propios perfiles"
ON public.perfiles
FOR SELECT
TO authenticated
USING ( auth.uid() = id );

SELECT 'Script de reversión completado. El inicio de sesión debería funcionar ahora.';