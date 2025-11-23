-- PASO 6: CREAR TABLA PARA GESTIONAR LAS SOLICITUDES DE SUSCRIPCIÓN
-- ========================================================================

-- Esta tabla almacenará un registro cada vez que un usuario indique que ha pagado
-- por una suscripción. Esto crea una cola de trabajo para que los administradores
-- puedan verificar el pago y activar la suscripción del vendedor.

CREATE TABLE IF NOT EXISTS solicitudes_suscripcion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    usuario_id UUID NOT NULL REFERENCES public.perfiles(id),
    plan_solicitado TEXT NOT NULL,
    estado TEXT NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado')),
    
    -- Información adicional para referencia del administrador
    nombre_usuario VARCHAR(200),
    email_usuario VARCHAR(255),

    fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    fecha_decision TIMESTAMP WITH TIME ZONE, -- Cuando el admin aprueba o rechaza
    admin_id UUID, -- Opcional: para saber qué admin tomó la decisión

    notas_admin TEXT -- Opcional: para añadir notas sobre la decisión (ej. "pago no encontrado")
);

-- Asegurarnos de que RLS (Row Level Security) esté habilitado en la nueva tabla
ALTER TABLE public.solicitudes_suscripcion ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS DE SEGURIDAD para la tabla de solicitudes:
-- 1. Los usuarios solo pueden ver sus propias solicitudes.
CREATE POLICY "Los usuarios pueden ver sus propias solicitudes" 
ON public.solicitudes_suscripcion FOR SELECT
USING (auth.uid() = usuario_id);

-- 2. Los usuarios pueden crear una solicitud para sí mismos.
CREATE POLICY "Los usuarios pueden crear sus propias solicitudes"
ON public.solicitudes_suscripcion FOR INSERT
WITH CHECK (auth.uid() = usuario_id);

-- 3. Los administradores pueden verlo y gestionarlo todo.
-- (Asumimos que crearás una política de admin más adelante o gestionarás desde el dashboard con rol de servicio).


-- NOTA: Como antes, debes ejecutar este script en el "SQL Editor" de tu proyecto en Supabase.
