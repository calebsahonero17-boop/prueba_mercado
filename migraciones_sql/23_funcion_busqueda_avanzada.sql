-- Habilitar la extensión para búsqueda difusa si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP FUNCTION IF EXISTS buscar_productos(text,uuid,numeric,numeric,text,uuid);

-- 1. CREAR LA FUNCIÓN DE BÚSQUEDA AVANZADA (VERSIÓN CORREGIDA)
CREATE FUNCTION buscar_productos(
    texto_busqueda TEXT DEFAULT NULL,
    categoria_id_filtro UUID DEFAULT NULL, -- CAMBIADO: Ahora acepta el ID de la categoría
    precio_min_filtro NUMERIC DEFAULT NULL,
    precio_max_filtro NUMERIC DEFAULT NULL,
    ordenar_por TEXT DEFAULT 'relevancia', -- Opciones: 'relevancia', 'precio_asc', 'precio_desc', 'fecha_desc'
    vendedor_id_filtro UUID DEFAULT NULL
) 
RETURNS TABLE (
    id UUID,
    vendedor_id UUID,
    nombre TEXT,
    descripcion TEXT,
    precio NUMERIC,
    stock INT,
    categoria_id UUID,
    activo BOOLEAN,
    condicion TEXT,
    fecha_creacion TIMESTAMPTZ,
    fecha_actualizacion TIMESTAMPTZ,
    imagenes_adicionales TEXT[],
    estado TEXT,
    relevancia FLOAT
) AS $$
BEGIN
    DECLARE
        query_busqueda tsquery := websearch_to_tsquery('spanish', texto_busqueda);
    BEGIN
        RETURN QUERY
        WITH RECURSIVE categoria_descendientes AS (
            SELECT id
            FROM public.categorias
            WHERE id = categoria_id_filtro

            UNION ALL

            SELECT c.id
            FROM public.categorias c
            JOIN categoria_descendientes cd ON c.parent_id = cd.id
        )
        SELECT 
            p.id,
            p.vendedor_id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.stock,
            p.categoria as categoria_id,
            p.activo,
            p.condicion,
            p.fecha_creacion,
            p.fecha_actualizacion,
            p.imagenes_adicionales,
            p.estado,
            (CASE 
                WHEN ordenar_por = 'relevancia' AND texto_busqueda IS NOT NULL AND texto_busqueda != '' THEN
                    ts_rank(to_tsvector('spanish', p.nombre || ' ' || p.descripcion), query_busqueda)
                ELSE 0
            END)::FLOAT AS relevancia
        FROM productos p
        WHERE
            -- Condición 1: El producto debe estar activo, tener stock y no estar vendido
            p.activo = TRUE AND p.stock > 0 AND p.estado != 'vendido' AND

            -- Condición 2: Filtro de búsqueda de texto
            (texto_busqueda IS NULL OR texto_busqueda = '' OR to_tsvector('spanish', p.nombre || ' ' || p.descripcion) @@ query_busqueda) AND

            -- Condición 3: Filtro por ID de categoría (NUEVO: soporta jerarquía)
            (categoria_id_filtro IS NULL OR p.categoria IN (SELECT id FROM categoria_descendientes)) AND

            -- Condición 4: Filtro por precio mínimo
            (precio_min_filtro IS NULL OR p.precio >= precio_min_filtro) AND

            -- Condición 5: Filtro por precio máximo
            (precio_max_filtro IS NULL OR p.precio <= precio_max_filtro) AND

            -- Condición 6: Filtro por vendedor
            (vendedor_id_filtro IS NULL OR p.vendedor_id = vendedor_id_filtro)

        ORDER BY
            relevancia DESC,
            CASE 
                WHEN ordenar_por = 'precio_asc' THEN p.precio
            END ASC,
            CASE 
                WHEN ordenar_por = 'precio_desc' THEN p.precio
            END DESC,
            p.fecha_creacion DESC;
    END;
END;
$$ LANGUAGE plpgsql;

-- El índice no necesita cambios, pero se mantiene aquí por completitud.
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'idx_productos_busqueda_texto') THEN
        CREATE INDEX idx_productos_busqueda_texto ON productos USING GIN (to_tsvector('spanish', nombre || ' ' || descripcion));
    END IF;
END
$$;