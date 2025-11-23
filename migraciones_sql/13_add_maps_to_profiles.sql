-- PASO 13: AÑADIR COORDENADAS PARA GOOGLE MAPS
-- =====================================================

-- 1. AÑADIR COLUMNAS DE LATITUD Y LONGITUD A LA TABLA DE PERFILES
-- Usamos el tipo NUMERIC para alta precisión, ideal para coordenadas geográficas.
ALTER TABLE perfiles
ADD COLUMN IF NOT EXISTS latitud NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitud NUMERIC(10, 7);

-- Comentario sobre las nuevas columnas:
-- latitud: Almacena la latitud de la ubicación del negocio del vendedor.
-- longitud: Almacena la longitud de la ubicación del negocio del vendedor.
