-- Agregar columna 'condicion' a la tabla productos
-- Esta columna faltaba y causaba error al insertar productos

ALTER TABLE productos
ADD COLUMN IF NOT EXISTS condicion TEXT DEFAULT 'nuevo'
CHECK (condicion IN ('nuevo', 'usado', 'reacondicionado'));

-- Mensaje de confirmación
DO $$
BEGIN
  RAISE NOTICE '✅ Columna "condicion" agregada a la tabla productos';
  RAISE NOTICE '📋 Valores permitidos: nuevo, usado, reacondicionado';
  RAISE NOTICE '🎉 Ahora puedes publicar productos sin error';
END $$;
