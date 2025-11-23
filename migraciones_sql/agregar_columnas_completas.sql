-- =====================================================
-- AGREGAR COLUMNAS FALTANTES PARA FUNCIONALIDAD COMPLETA
-- Ejecuta esto para tener todas las funcionalidades
-- =====================================================

-- 1. Columna para múltiples imágenes
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS imagenes_adicionales TEXT[];

-- 2. Columna para condición del producto
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS condicion TEXT DEFAULT 'nuevo'
CHECK (condicion IN ('nuevo', 'usado', 'reacondicionado'));

-- 3. Columna para productos destacados
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false;

-- 4. Columna para fecha de actualización
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 5. Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_vendedor ON productos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria);
CREATE INDEX IF NOT EXISTS idx_productos_activo ON productos(activo);

-- 6. Trigger para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION actualizar_fecha_modificacion()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_actualizacion = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_actualizar_productos ON productos;
CREATE TRIGGER trigger_actualizar_productos
BEFORE UPDATE ON productos
FOR EACH ROW
EXECUTE FUNCTION actualizar_fecha_modificacion();

-- Verificación
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Columnas agregadas a productos:';
  RAISE NOTICE '   - imagenes_adicionales (array de URLs)';
  RAISE NOTICE '   - condicion (nuevo/usado/reacondicionado)';
  RAISE NOTICE '   - destacado (boolean)';
  RAISE NOTICE '   - fecha_actualizacion (timestamp)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Índices creados para mejor rendimiento';
  RAISE NOTICE '✅ Trigger de actualización automática';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 Tabla productos actualizada completamente!';
END $$;
