-- 24_funcion_conversaciones_enriquecidas.sql

-- Esta función obtiene todas las conversaciones de un usuario
-- junto con detalles adicionales como el último mensaje, su fecha y el conteo de mensajes no leídos.

CREATE OR REPLACE FUNCTION get_conversations_with_details(p_user_id uuid)
RETURNS TABLE (
    id uuid,
    -- Perfiles de los participantes
    comprador_id jsonb,
    vendedor_id jsonb,
    -- Datos del producto
    producto_id jsonb,
    -- Detalles del último mensaje
    last_message_content text,
    last_message_at timestamptz,
    last_message_is_image boolean,
    -- Conteo de mensajes no leídos para el usuario que llama a la función
    unread_count bigint
) AS $$
BEGIN
    RETURN QUERY
    WITH last_message_details AS (
        -- Subconsulta para obtener el último mensaje de cada conversación
        SELECT DISTINCT ON (conversacion_id)
            conversacion_id,
            fecha_creacion,
            contenido,
            (imagen_url IS NOT NULL) as is_image
        FROM mensajes
        ORDER BY conversacion_id, fecha_creacion DESC
    ),
    unread_counts AS (
        -- Subconsulta para contar los mensajes no leídos por el usuario actual
        SELECT
            conversacion_id,
            COUNT(*) AS unreads
        FROM mensajes
        WHERE remitente_id != p_user_id AND leido = false
        GROUP BY conversacion_id
    )
    SELECT
        c.id,
        -- Construir JSON para los perfiles y producto
        jsonb_build_object('id', comp.id, 'nombres', comp.nombres, 'apellidos', comp.apellidos, 'avatar', comp.avatar) as comprador_id,
        jsonb_build_object('id', vend.id, 'nombres', vend.nombres, 'apellidos', vend.apellidos, 'avatar', vend.avatar) as vendedor_id,
        jsonb_build_object('id', prod.id, 'nombre', prod.nombre) as producto_id,
        -- Contenido del último mensaje
        lmd.contenido AS last_message_content,
        lmd.fecha_creacion AS last_message_at,
        lmd.is_image as last_message_is_image,
        -- Conteo de no leídos
        COALESCE(uc.unreads, 0) AS unread_count
    FROM
        conversaciones c
    LEFT JOIN last_message_details lmd ON c.id = lmd.conversacion_id
    LEFT JOIN unread_counts uc ON c.id = uc.conversacion_id
    -- Joins para obtener los datos completos en formato JSON
    LEFT JOIN perfiles comp ON c.comprador_id = comp.id
    LEFT JOIN perfiles vend ON c.vendedor_id = vend.id
    LEFT JOIN productos prod ON c.producto_id = prod.id
    WHERE
        c.comprador_id = p_user_id OR c.vendedor_id = p_user_id
    ORDER BY
        last_message_at DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql STABLE;