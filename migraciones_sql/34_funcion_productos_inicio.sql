-- Borrar funciones antiguas si existen para evitar conflictos.
DROP FUNCTION IF EXISTS public.productos_por_categoria_para_inicio(uuid);

-- Creación de la nueva función especializada para la página de inicio.
CREATE OR REPLACE FUNCTION public.productos_por_categoria_para_inicio(
    categoria_id_filtro UUID
)
RETURNS TABLE (
    -- La estructura de la tabla devuelta debe coincidir con lo que espera el ProductCard
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
    categoria_nombre TEXT -- Añadido para consistencia con lo que el card podría esperar
) AS $$
BEGIN
    RETURN QUERY
    WITH RECURSIVE categoria_descendientes AS (
        -- Obtiene la categoría principal y todas sus subcategorías
        SELECT c.id
        FROM public.categorias c
        WHERE c.id = categoria_id_filtro
        UNION ALL
        SELECT c.id
        FROM public.categorias c
        JOIN categoria_descendientes cd ON c.parent_id = cd.id
    ),
    ranked_products AS (
        -- Enumera los productos de cada vendedor, ordenados por fecha
        SELECT
            p.*,
            ROW_NUMBER() OVER(PARTITION BY p.vendedor_id ORDER BY p.fecha_creacion DESC) as rn
        FROM
            public.productos p
        WHERE
            -- Filtra productos que pertenecen a la categoría o sus descendientes
            p.categoria IN (SELECT id FROM categoria_descendientes)
            AND p.activo = TRUE AND p.stock > 0 AND p.estado != 'vendido'
    )
    -- Selecciona los productos finales
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
        0.0::FLOAT AS relevancia, -- La relevancia no se calcula en esta vista
        cat.nombre AS categoria_nombre
    FROM
        ranked_products rp
    LEFT JOIN
        public.categorias cat ON rp.categoria = cat.id
    WHERE
        rp.rn <= 3 -- La lógica clave: MÁXIMO 3 PRODUCTOS POR VENDEDOR
    ORDER BY
        rp.fecha_creacion DESC -- Ordena la lista final por fecha para mostrar los más nuevos primero
    LIMIT 18; -- Limita el total de productos en la fila a 18
END;
$$ LANGUAGE plpgsql;
