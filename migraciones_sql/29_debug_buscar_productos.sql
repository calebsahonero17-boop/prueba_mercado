-- Habilitar la extensión para búsqueda difusa si no está habilitada
CREATE EXTENSION IF NOT EXISTS pg_trgm;

DROP FUNCTION IF EXISTS buscar_productos(text,uuid,numeric,numeric,text,uuid);

-- VERSIÓN DE DEPURACIÓN DE LA FUNCIÓN DE BÚSQUEDA
CREATE OR REPLACE FUNCTION buscar_productos(
    texto_busqueda TEXT DEFAULT NULL,
    categoria_id_filtro UUID DEFAULT NULL,
    precio_min_filtro NUMERIC DEFAULT NULL,
    precio_max_filtro NUMERIC DEFAULT NULL,
    ordenar_por TEXT DEFAULT 'relevancia',
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
DECLARE
    query_busqueda tsquery;
    current_user_id UUID := auth.uid(); -- Get current user ID
    product_count INT;
BEGIN
    -- Log de entrada y parámetros
    RAISE NOTICE '--- Inicia buscar_productos ---';
    RAISE NOTICE 'ID de Usuario (auth.uid()): %', current_user_id;
    RAISE NOTICE 'Parámetros: texto_busqueda=%, categoria_id_filtro=%, precio_min=%, precio_max=%, ordenar_por=%, vendedor_id=%',
        texto_busqueda, categoria_id_filtro, precio_min_filtro, precio_max_filtro, ordenar_por, vendedor_id_filtro;

    -- Comprobar el acceso inicial a la tabla (para depurar RLS)
    SELECT count(*) INTO product_count FROM public.productos;
    RAISE NOTICE 'Conteo inicial de productos (antes de filtros RLS): %', product_count;

    -- Manejo seguro de texto de búsqueda nulo para tsquery
    IF texto_busqueda IS NOT NULL AND texto_busqueda != '' THEN
        query_busqueda := websearch_to_tsquery('spanish', texto_busqueda);
    ELSE
        query_busqueda := to_tsquery('spanish', ''); -- Consulta vacía si no hay texto
    END IF;
    RAISE NOTICE 'tsquery construido: %', query_busqueda;

    BEGIN
        RETURN QUERY
        WITH RECURSIVE categoria_descendientes AS (
            SELECT c.id
            FROM public.categorias c
            WHERE c.id = categoria_id_filtro

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
            p.activo = TRUE AND p.stock > 0 AND p.estado != 'vendido' AND
            (texto_busqueda IS NULL OR texto_busqueda = '' OR to_tsvector('spanish', p.nombre || ' ' || p.descripcion) @@ query_busqueda) AND
            (categoria_id_filtro IS NULL OR p.categoria IN (SELECT id FROM categoria_descendientes)) AND
            (precio_min_filtro IS NULL OR p.precio >= precio_min_filtro) AND
            (precio_max_filtro IS NULL OR p.precio <= precio_max_filtro) AND
            (vendedor_id_filtro IS NULL OR p.vendedor_id = vendedor_id_filtro)
        ORDER BY
            relevancia DESC,
            CASE WHEN ordenar_por = 'precio_asc' THEN p.precio END ASC,
            CASE WHEN ordenar_por = 'precio_desc' THEN p.precio END DESC,
            p.fecha_creacion DESC;
            
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '!!! ERROR DENTRO DE LA FUNCIÓN: %', SQLERRM;
            RAISE EXCEPTION 'Error en la consulta interna: %', SQLERRM;
    END;

    RAISE NOTICE '--- Finaliza buscar_productos ---';
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
