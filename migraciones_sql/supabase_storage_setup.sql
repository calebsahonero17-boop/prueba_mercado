-- =====================================================
-- CONFIGURACIÓN DE SUPABASE STORAGE
-- Para almacenamiento de imágenes de productos
-- Mercado Express - E-commerce Platform
-- =====================================================

-- PASO 1: Crear bucket para productos
-- =====================================================
-- NOTA: Este paso se debe hacer manualmente en el panel de Supabase
-- 1. Ve a Storage en el panel de Supabase
-- 2. Click en "Create Bucket"
-- 3. Nombre: "productos"
-- 4. Public bucket: YES (habilitado)
-- 5. File size limit: 5MB
-- 6. Allowed MIME types: image/jpeg, image/jpg, image/png, image/webp

-- =====================================================
-- PASO 2: Configurar políticas de acceso (RLS)
-- =====================================================

-- Política 1: Permitir que cualquiera VEA las imágenes (públicas)
CREATE POLICY "Imágenes públicas - lectura" ON storage.objects
FOR SELECT
USING (bucket_id = 'productos');

-- Política 2: Solo usuarios autenticados pueden SUBIR imágenes
CREATE POLICY "Usuarios autenticados - subir imágenes" ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'productos'
  AND auth.role() = 'authenticated'
);

-- Política 3: Solo el dueño puede ACTUALIZAR sus imágenes
CREATE POLICY "Dueños - actualizar imágenes" ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'productos'
  AND auth.uid() = owner
)
WITH CHECK (
  bucket_id = 'productos'
  AND auth.uid() = owner
);

-- Política 4: Solo el dueño o admins pueden ELIMINAR imágenes
CREATE POLICY "Dueños y admins - eliminar imágenes" ON storage.objects
FOR DELETE
USING (
  bucket_id = 'productos'
  AND (
    auth.uid() = owner
    OR EXISTS (
      SELECT 1 FROM perfiles
      WHERE id = auth.uid()
      AND rol IN ('admin', 'super_admin')
    )
  )
);

-- =====================================================
-- PASO 3: Verificar que la tabla productos soporta arrays
-- =====================================================

-- Verificar que la columna imagenes_adicionales existe
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'productos'
    AND column_name = 'imagenes_adicionales'
  ) THEN
    -- Agregar columna si no existe
    ALTER TABLE productos
    ADD COLUMN imagenes_adicionales TEXT[];

    RAISE NOTICE '✅ Columna imagenes_adicionales agregada';
  ELSE
    RAISE NOTICE 'ℹ️ Columna imagenes_adicionales ya existe';
  END IF;
END $$;

-- =====================================================
-- PASO 4: Crear índices para búsquedas más rápidas
-- =====================================================

-- Índice para búsquedas por vendedor
CREATE INDEX IF NOT EXISTS idx_productos_vendedor
ON productos(vendedor_id);

-- Índice para productos activos
CREATE INDEX IF NOT EXISTS idx_productos_activo
ON productos(activo);

-- Índice para búsquedas por categoría
CREATE INDEX IF NOT EXISTS idx_productos_categoria
ON productos(categoria);

-- =====================================================
-- PASO 5: Función helper para limpiar imágenes huérfanas
-- =====================================================

-- Función para encontrar imágenes que no están siendo usadas
CREATE OR REPLACE FUNCTION limpiar_imagenes_huerfanas()
RETURNS TABLE(archivo TEXT, tamaño BIGINT) AS $$
BEGIN
  RETURN QUERY
  SELECT
    name::TEXT as archivo,
    metadata->>'size' as tamaño
  FROM storage.objects
  WHERE bucket_id = 'productos'
  AND NOT EXISTS (
    SELECT 1 FROM productos
    WHERE url_imagen =
      'https://uqomjrkzhkxqkdzyrdke.supabase.co/storage/v1/object/public/productos/' || name
    OR name = ANY(
      SELECT UNNEST(imagenes_adicionales)
      FROM productos
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- MENSAJE DE CONFIRMACIÓN
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Configuración de Storage completada';
  RAISE NOTICE '========================================';
  RAISE NOTICE '';
  RAISE NOTICE '📦 Bucket: productos';
  RAISE NOTICE '🔒 Políticas RLS: 4 configuradas';
  RAISE NOTICE '📊 Índices: 3 creados';
  RAISE NOTICE '🛠️ Funciones: 1 helper creada';
  RAISE NOTICE '';
  RAISE NOTICE '⚠️ IMPORTANTE: Debes crear el bucket manualmente';
  RAISE NOTICE '1. Ve a: Storage en Supabase Dashboard';
  RAISE NOTICE '2. Click: Create Bucket';
  RAISE NOTICE '3. Nombre: productos';
  RAISE NOTICE '4. Public: YES';
  RAISE NOTICE '5. Size limit: 5MB';
  RAISE NOTICE '';
  RAISE NOTICE '🚀 Sistema de imágenes listo!';
END $$;

-- =====================================================
-- COMANDOS ÚTILES PARA ADMINISTRACIÓN
-- =====================================================

-- Ver todas las imágenes subidas
-- SELECT name, created_at, metadata->>'size' as size
-- FROM storage.objects
-- WHERE bucket_id = 'productos'
-- ORDER BY created_at DESC;

-- Ver imágenes huérfanas (no usadas)
-- SELECT * FROM limpiar_imagenes_huerfanas();

-- Contar imágenes por producto
-- SELECT
--   p.nombre,
--   p.url_imagen,
--   COALESCE(array_length(p.imagenes_adicionales, 1), 0) as total_imagenes
-- FROM productos p
-- ORDER BY total_imagenes DESC;

-- Ver espacio usado en storage
-- SELECT
--   bucket_id,
--   COUNT(*) as total_archivos,
--   pg_size_pretty(SUM((metadata->>'size')::bigint)) as espacio_usado
-- FROM storage.objects
-- WHERE bucket_id = 'productos'
-- GROUP BY bucket_id;
