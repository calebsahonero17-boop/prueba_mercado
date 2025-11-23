-- Script para verificar y corregir políticas de RLS para actualización de perfiles

-- 1. Ver las políticas actuales
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
WHERE tablename = 'perfiles';

-- 2. Eliminar política antigua si existe y recrearla correctamente
DROP POLICY IF EXISTS "Los usuarios pueden actualizar su propio perfil" ON public.perfiles;

-- 3. Crear política de actualización correcta
CREATE POLICY "Los usuarios pueden actualizar su propio perfil"
ON public.perfiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 4. Verificar que RLS esté habilitado
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;

-- 5. Asegurar que la política de SELECT también esté correcta
DROP POLICY IF EXISTS "Los usuarios pueden ver todos los perfiles públicos" ON public.perfiles;

CREATE POLICY "Los usuarios pueden ver todos los perfiles públicos"
ON public.perfiles
FOR SELECT
USING (true);

-- 6. Verificar permisos de la tabla
GRANT SELECT, INSERT, UPDATE ON public.perfiles TO authenticated;
GRANT SELECT ON public.perfiles TO anon;

-- 7. Test rápido (reemplaza 'TU_USER_ID' con tu ID real)
-- SELECT id, nombres, apellidos, email FROM public.perfiles WHERE id = auth.uid();
