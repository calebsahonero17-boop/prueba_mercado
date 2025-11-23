-- Borrar la función existente para aplicar la versión corregida.
DROP FUNCTION IF EXISTS public.productos_por_categoria_para_inicio(uuid);

-- Creación de la función corregida para la página de inicio (FIX de ambigüedad)
CREATE OR REPLACE FUNCTION public.productos_por_categoria_para_inicio(
    categoria_id_filtro UUID
)
RETURNS TABLE (
    id UUID,
    vendedor_id UUID,
    nombre CHARACTER VARYING,
    descripcion TEXT,
    precio NUMERIC,
    stock INT,
    url_imagen TEXT,
    categoria_id UUID,
    activo BOOLEAN,
    condicion TEXT,
    fecha_creacion TIMESTAMPTZ,
    fecha_actualizacion TIMESTAMPTZ,
    imagenes_adicionales TEXT[],
    estado CHARACTER VARYING,
    relevancia FLOAT,
    categoria_nombre TEXT
) AS $$
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
    ),
    ranked_products AS (
        SELECT
            p.*,
            ROW_NUMBER() OVER(PARTITION BY p.vendedor_id ORDER BY p.fecha_creacion DESC) as rn
        FROM
            public.productos p
        WHERE
            -- CORRECCIÓN: Se añade un alias 'cd' al subquery para desambiguar la columna 'id'
            p.categoria IN (SELECT cd.id FROM categoria_descendientes cd)
            AND p.activo = TRUE AND p.stock > 0 AND p.estado != 'vendido'
    )
    SELECT
        rp.id,
        rp.vendedor_id,
        rp.nombre,
        rp.descripcion,
        rp.precio,
        rp.stock,
        rp.url_imagen,
        rp.categoria AS categoria_id,
        rp.activo,
        rp.condicion,
        rp.fecha_creacion,
        rp.fecha_actualizacion,
        rp.imagenes_adicionales,
        rp.estado,
        0.0::FLOAT AS relevancia,
        cat.nombre AS categoria_nombre
    FROM
        ranked_products rp
    LEFT JOIN
        public.categorias cat ON rp.categoria = cat.id
    WHERE
        rp.rn <= 3
    ORDER BY
        rp.fecha_creacion DESC
    LIMIT 18;
END;
$$ LANGUAGE plpgsql;
