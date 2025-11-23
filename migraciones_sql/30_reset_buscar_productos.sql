-- Paso 1: Forzar el borrado de CUALQUIER función llamada 'buscar_productos'.
-- Esto es más agresivo y debería eliminar cualquier versión antigua o conflictiva.
DROP FUNCTION IF EXISTS public.buscar_productos;

-- Paso 2: Crear una versión MÍNIMA y a prueba de fallos de la función.
-- Esta versión ignora todos los parámetros de búsqueda y solo devuelve los 10 productos más nuevos.
-- Su propósito es únicamente para depuración.
CREATE FUNCTION public.buscar_productos(
    texto_busqueda TEXT DEFAULT NULL,
    categoria_id_filtro UUID DEFAULT NULL,
    precio_min_filtro NUMERIC DEFAULT NULL,
    precio_max_filtro NUMERIC DEFAULT NULL,
    ordenar_por TEXT DEFAULT 'relevancia',
    vendedor_id_filtro UUID DEFAULT NULL
)
RETURNS TABLE (
    -- Usamos la misma estructura de retorno que la función avanzada para mantener la compatibilidad con la app
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
    -- Esta consulta simple devuelve los 10 productos activos más recientes.
    -- Si esto funciona, el problema está en la lógica de la función de búsqueda avanzada.
    RETURN QUERY
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
        0.0::FLOAT AS relevancia -- La relevancia es siempre 0 en esta versión de prueba
    FROM
        public.productos p
    WHERE
        p.activo = TRUE AND p.stock > 0
    ORDER BY
        p.fecha_creacion DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql;
