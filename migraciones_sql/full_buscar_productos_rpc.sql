CREATE OR REPLACE FUNCTION public.buscar_productos(
    texto_busqueda TEXT DEFAULT NULL,
    categoria_id_filtro UUID DEFAULT NULL,
    precio_min_filtro NUMERIC DEFAULT NULL,
    precio_max_filtro NUMERIC DEFAULT NULL,
    ordenar_por TEXT DEFAULT 'relevancia',
    vendedor_id_filtro UUID DEFAULT NULL
)
RETURNS TABLE (
    id UUID,
    nombre TEXT,
    descripcion TEXT,
    precio NUMERIC,
    categoria UUID, -- Keep this as UUID for filtering/internal use
    categoria_nombre TEXT, -- New column for category name
    stock INTEGER,
    url_imagen TEXT,
    imagenes_adicionales TEXT[],
    condicion TEXT,
    activo BOOLEAN,
    destacado BOOLEAN,
    vendedor_id UUID,
    fecha_creacion TIMESTAMP WITH TIME ZONE,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
AS $$
DECLARE
    query_str TEXT;
    where_clauses TEXT[] := ARRAY[]::TEXT[];
    order_by_clause TEXT;
BEGIN
    -- Construir cláusulas WHERE
    IF texto_busqueda IS NOT NULL AND texto_busqueda != '' THEN
        where_clauses := array_append(where_clauses, format(
            '(p.nombre ILIKE %L OR p.descripcion ILIKE %L)',
            '%' || texto_busqueda || '%',
            '%' || texto_busqueda || '%'
        ));
    END IF;

    IF categoria_id_filtro IS NOT NULL THEN
        where_clauses := array_append(where_clauses, format('p.categoria = %L', categoria_id_filtro));
    END IF;

    IF precio_min_filtro IS NOT NULL THEN
        where_clauses := array_append(where_clauses, format('p.precio >= %L', precio_min_filtro));
    END IF;

    IF precio_max_filtro IS NOT NULL THEN
        where_clauses := array_append(where_clauses, format('p.precio <= %L', precio_max_filtro));
    END IF;

    IF vendedor_id_filtro IS NOT NULL THEN
        where_clauses := array_append(where_clauses, format('p.vendedor_id = %L', vendedor_id_filtro));
    END IF;

    -- Siempre filtrar por productos activos
    where_clauses := array_append(where_clauses, 'p.activo = TRUE');

    -- Construir cláusula ORDER BY
    order_by_clause := CASE ordenar_por
        WHEN 'precio_asc' THEN 'p.precio ASC'
        WHEN 'precio_desc' THEN 'p.precio DESC'
        WHEN 'fecha_desc' THEN 'p.fecha_creacion DESC'
        ELSE 'p.destacado DESC, p.fecha_creacion DESC' -- Relevancia por defecto
    END;

    -- Construir la consulta principal
    query_str := '
        SELECT
            p.id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.categoria,
            c.nombre AS categoria_nombre, -- Join to get category name
            p.stock,
            p.url_imagen,
            p.imagenes_adicionales,
            p.condicion,
            p.activo,
            p.destacado,
            p.vendedor_id,
            p.fecha_creacion,
            p.fecha_actualizacion
        FROM
            public.productos p
        LEFT JOIN
            public.categorias c ON p.categoria = c.id
    ';

    IF array_length(where_clauses, 1) > 0 THEN
        query_str := query_str || ' WHERE ' || array_to_string(where_clauses, ' AND ');
    END IF;

    query_str := query_str || ' ORDER BY ' || order_by_clause;

    -- RAISE NOTICE 'Executing query: %', query_str; -- Para depuración

    RETURN QUERY EXECUTE query_str;
END;
$$;