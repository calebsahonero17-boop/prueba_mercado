-- =====================================================
-- SOLUCIÓN TEMPORAL: DESACTIVAR RLS EN STORAGE
-- Esto es solo para PROBAR que el problema son las políticas
-- NO dejar así en producción
-- =====================================================

-- OPCIÓN 1: Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Imágenes públicas - lectura" ON storage.objects;
DROP POLICY IF EXISTS "Usuarios autenticados - subir imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Dueños - actualizar imágenes" ON storage.objects;
DROP POLICY IF EXISTS "Dueños y admins - eliminar imágenes" ON storage.objects;

-- Eliminar otras posibles políticas
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT policyname
    FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', pol.policyname);
    RAISE NOTICE 'Eliminada política: %', pol.policyname;
  END LOOP;
END $$;

-- OPCIÓN 2: Crear políticas súper permisivas (TEMPORAL)
CREATE POLICY "allow_all_select" ON storage.objects
FOR SELECT USING (true);

CREATE POLICY "allow_all_insert" ON storage.objects
FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_all_update" ON storage.objects
FOR UPDATE USING (true);

CREATE POLICY "allow_all_delete" ON storage.objects
FOR DELETE USING (true);

-- Verificación
SELECT
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects';

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '⚠️ POLÍTICAS TEMPORALES APLICADAS';
  RAISE NOTICE '⚠️ Esto permite cualquier operación';
  RAISE NOTICE '⚠️ Solo para TESTING';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📝 PRUEBA SUBIR UNA IMAGEN AHORA';
  RAISE NOTICE '';
  RAISE NOTICE 'Si funciona, el problema eran las políticas';
  RAISE NOTICE 'Después revertir con políticas seguras';
END $$;
