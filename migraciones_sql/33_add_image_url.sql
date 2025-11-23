-- Borrar la función existente para asegurar una instalación limpia
DROP FUNCTION IF EXISTS buscar_productos(text,uuid,numeric,numeric,text,uuid);
DROP FUNCTION IF EXISTS public.buscar_productos;


-- VERSIÓN FINAL (CON URL DE IMAGEN)
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
    nombre CHARACTER VARYING,
    descripcion TEXT,
    precio NUMERIC,
    stock INT,
    url_imagen TEXT, -- AÑADIDO: La URL de la imagen principal
    categoria_id UUID,
    activo BOOLEAN,
    condicion TEXT,
    fecha_creacion TIMESTAMPTZ,
    fecha_actualizacion TIMESTAMPTZ,
    imagenes_adicionales TEXT[],
    estado CHARACTER VARYING,
    relevancia FLOAT
) AS $$
DECLARE
    query_busqueda tsquery;
BEGIN
    -- Manejo seguro de texto de búsqueda nulo para tsquery
    IF texto_busqueda IS NOT NULL AND texto_busqueda != '' THEN
        query_busqueda := websearch_to_tsquery('spanish', texto_busqueda);
    ELSE
        query_busqueda := to_tsquery('spanish', ''); -- Consulta vacía si no hay texto
    END IF;

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
            p.url_imagen, -- AÑADIDO: Se selecciona la columna de la imagen principal
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
            (categoria_id_filtro IS NULL OR p.categoria IN (SELECT cd.id FROM categoria_descendientes cd)) AND
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
END;
$$ LANGUAGE plpgsql;
