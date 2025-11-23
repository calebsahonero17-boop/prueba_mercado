-- PASO 9: CORREGIR LAS POLÍTICAS DE LECTURA DE PERFILES
-- ========================================================================

-- Las políticas anteriores eran demasiado restrictivas, causando que los
-- usuarios no pudieran ver perfiles públicos, e incluso a veces ni el suyo propio.
-- Esta corrección simplifica las reglas para permitir la lectura pública de perfiles,
-- lo cual es seguro y necesario para un marketplace.

-- 1. Eliminar las políticas de LECTURA (SELECT) antiguas para la tabla 'perfiles'.
DROP POLICY IF EXISTS "Ver propio perfil" ON public.perfiles;
DROP POLICY IF EXISTS "Admins ven todos los perfiles" ON public.perfiles;

-- 2. Crear una nueva política de LECTURA (SELECT) que permite a cualquiera ver los perfiles.
-- Esto es seguro porque la información en la tabla 'perfiles' (nombre, avatar, etc.) no es sensible.
CREATE POLICY "Permitir lectura pública de perfiles" 
ON public.perfiles FOR SELECT
USING (true);


-- NOTA: Las políticas para ACTUALIZAR (UPDATE) no se tocan, por lo que un usuario
-- solo puede modificar su propio perfil, manteniendo la seguridad.

-- Por favor, ejecuta este script en el "SQL Editor" de Supabase para aplicar la corrección.
