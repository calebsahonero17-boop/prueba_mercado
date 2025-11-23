-- MIGRACIÓN 59: Corregir política de RLS para el bucket 'comprobantes_pago'

-- Descripción:
-- La política de SELECT actual ('owner_select_comprobantes_pago') solo permite al dueño del archivo (el usuario que lo subió)
-- verlo. Esto previene que los administradores puedan revisar los comprobantes de pago.
--
-- Esta migración reemplaza esa política por una nueva que permite el acceso a:
-- 1. El dueño del archivo.
-- 2. Los usuarios con rol 'admin' o 'super_admin' (usando la función 'is_admin()').

-- PASO 1: Eliminar la política de SELECT existente.
DROP POLICY IF EXISTS "owner_select_comprobantes_pago" ON storage.objects;

-- PASO 2: Crear la nueva política de SELECT con acceso para administradores.
CREATE POLICY "select_comprobantes_pago_con_admin" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'comprobantes_pago' AND (
    (storage.foldername(name))[1]::uuid = auth.uid() OR
    public.is_admin_or_super_admin()
  )
);

-- Nota: La función is_admin() debe existir. Fue creada en la migración 43.
