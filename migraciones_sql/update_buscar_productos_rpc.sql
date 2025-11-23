DROP FUNCTION IF EXISTS buscar_productos(text,uuid,numeric,numeric,text,uuid);
CREATE FUNCTION public.buscar_productos(
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
    categoria UUID,
    categoria_nombre TEXT,
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
    category_cte TEXT;
BEGIN
    -- CTE para obtener la jerarquía de categorías si se especifica un filtro de categoría
    IF categoria_id_filtro IS NOT NULL THEN
        category_cte := format(
            'WITH RECURSIVE subcategorias AS (
                SELECT c.id FROM public.categorias c WHERE c.id = %L
                UNION
                SELECT c.id FROM public.categorias c JOIN subcategorias s ON c.parent_id = s.id
            )',
            categoria_id_filtro
        );
        where_clauses := array_append(where_clauses, 'p.categoria IN (SELECT id FROM subcategorias)');
    ELSE
        category_cte := '';
    END IF;

    -- Construir cláusulas WHERE
    IF texto_busqueda IS NOT NULL AND texto_busqueda != '' THEN
        where_clauses := array_append(where_clauses, format(
            '(p.nombre ILIKE %L OR p.descripcion ILIKE %L)',
            '%' || texto_busqueda || '%',
            '%' || texto_busqueda || '%'
        ));
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
    query_str := category_cte || '
        SELECT
            p.id,
            p.nombre,
            p.descripcion,
            p.precio,
            p.categoria,
            cat.nombre AS categoria_nombre,
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
            public.categorias cat ON p.categoria = cat.id
    ';

    IF array_length(where_clauses, 1) > 0 THEN
        query_str := query_str || ' WHERE ' || array_to_string(where_clauses, ' AND ');
    END IF;

    query_str := query_str || ' ORDER BY ' || order_by_clause;

    -- RAISE NOTICE 'Executing query: %', query_str; -- Para depuración

    RETURN QUERY EXECUTE query_str;
END;
$$;