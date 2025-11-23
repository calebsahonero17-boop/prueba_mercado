-- =====================================================
-- AGREGAR COLUMNAS FALTANTES A LA TABLA PRODUCTOS
-- =====================================================

-- Agregar columna 'condicion' si no existe
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS condicion TEXT DEFAULT 'nuevo'
CHECK (condicion IN ('nuevo', 'usado', 'reacondicionado'));

-- Agregar columna 'destacado' si no existe
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS destacado BOOLEAN DEFAULT false;

-- Agregar columna 'activo' si no existe
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT true;

-- Agregar columna 'vendedor_id' si no existe (ya debería existir, pero verificamos)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'productos' AND column_name = 'vendedor_id'
  ) THEN
    ALTER TABLE productos ADD COLUMN vendedor_id UUID REFERENCES perfiles(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Verificar que todas las columnas existen
DO $$
DECLARE
  columnas_faltantes TEXT[] := ARRAY[]::TEXT[];
  columna TEXT;
BEGIN
  -- Lista de columnas requeridas
  FOREACH columna IN ARRAY ARRAY['condicion', 'destacado', 'activo', 'vendedor_id', 'imagenes_adicionales']
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'productos' AND column_name = columna
    ) THEN
      columnas_faltantes := array_append(columnas_faltantes, columna);
    END IF;
  END LOOP;

  IF array_length(columnas_faltantes, 1) IS NOT NULL THEN
    RAISE NOTICE '⚠️ Columnas que aún faltan: %', array_to_string(columnas_faltantes, ', ');
  ELSE
    RAISE NOTICE '✅ Todas las columnas requeridas existen';
  END IF;
END $$;

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Columnas agregadas a productos:';
  RAISE NOTICE '   - condicion (nuevo, usado, reacondicionado)';
  RAISE NOTICE '   - destacado (boolean)';
  RAISE NOTICE '   - activo (boolean)';
  RAISE NOTICE '   - vendedor_id (UUID)';
  RAISE NOTICE '========================================';
  RAISE NOTICE '🎉 Ahora puedes publicar productos!';
END $$;
