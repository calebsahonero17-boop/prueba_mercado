-- Borrar tablas si existen para una ejecución limpia
DROP TABLE IF EXISTS public.mensajes;
DROP TABLE IF EXISTS public.conversaciones;

-- 1. Tabla para almacenar las conversaciones
-- Cada conversación es un hilo entre un comprador y un vendedor sobre un producto.
CREATE TABLE IF NOT EXISTS public.conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Participantes de la conversación
  comprador_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  vendedor_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  
  -- Contexto de la conversación (opcional pero muy útil)
  producto_id UUID REFERENCES public.productos(id) ON DELETE SET NULL,

  -- Para evitar duplicados: solo una conversación por comprador/vendedor/producto
  UNIQUE(comprador_id, vendedor_id, producto_id)
);

-- Comentarios sobre la tabla de conversaciones
COMMENT ON TABLE public.conversaciones IS 'Almacena las conversaciones entre compradores y vendedores.';
COMMENT ON COLUMN public.conversaciones.comprador_id IS 'El usuario que inicia la conversación (el comprador).';
COMMENT ON COLUMN public.conversaciones.vendedor_id IS 'El dueño del producto (el vendedor).';
COMMENT ON COLUMN public.conversaciones.producto_id IS 'El producto sobre el cual trata la conversación.';


-- 2. Tabla para almacenar los mensajes individuales
CREATE TABLE IF NOT EXISTS public.mensajes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Relación con la conversación
  conversacion_id UUID NOT NULL REFERENCES public.conversaciones(id) ON DELETE CASCADE,
  
  -- Quién envió el mensaje
  remitente_id UUID NOT NULL REFERENCES public.perfiles(id) ON DELETE CASCADE,
  
  -- Contenido del mensaje
  contenido TEXT NOT NULL CHECK (char_length(contenido) > 0 AND char_length(contenido) <= 2000),
  
  -- Estado de lectura
  leido BOOLEAN NOT NULL DEFAULT FALSE
);

-- Comentarios sobre la tabla de mensajes
COMMENT ON TABLE public.mensajes IS 'Almacena cada mensaje individual dentro de una conversación.';
COMMENT ON COLUMN public.mensajes.conversacion_id IS 'La conversación a la que pertenece este mensaje.';
COMMENT ON COLUMN public.mensajes.remitente_id IS 'El usuario que envió el mensaje.';
COMMENT ON COLUMN public.mensajes.contenido IS 'El texto del mensaje.';
COMMENT ON COLUMN public.mensajes.leido IS 'Indica si el destinatario ha leído el mensaje.';


-- 3. Habilitar la Seguridad a Nivel de Fila (RLS)
-- Es una buena práctica de seguridad en Supabase.
ALTER TABLE public.conversaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mensajes ENABLE ROW LEVEL SECURITY;


-- 4. Políticas de Seguridad para la tabla 'conversaciones'
-- Los usuarios solo pueden ver las conversaciones en las que participan.
CREATE POLICY "Permitir leer conversaciones a los participantes" 
ON public.conversaciones FOR SELECT
USING (auth.uid() = comprador_id OR auth.uid() = vendedor_id);

-- Los usuarios pueden crear nuevas conversaciones.
CREATE POLICY "Permitir crear conversaciones"
ON public.conversaciones FOR INSERT
WITH CHECK (auth.uid() = comprador_id);


-- 5. Políticas de Seguridad para la tabla 'mensajes'
-- Los usuarios solo pueden ver los mensajes de las conversaciones en las que participan.
CREATE POLICY "Permitir leer mensajes a los participantes"
ON public.mensajes FOR SELECT
USING (
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE conversaciones.id = mensajes.conversacion_id
  )
);

-- Un usuario solo puede insertar mensajes si es el remitente y participa en la conversación.
CREATE POLICY "Permitir crear mensajes a los participantes"
ON public.mensajes FOR INSERT
WITH CHECK (
  auth.uid() = remitente_id AND
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE conversaciones.id = mensajes.conversacion_id
  )
);

-- Permitir a los usuarios marcar mensajes como leídos (opcional, más avanzado)
CREATE POLICY "Permitir a los usuarios actualizar el estado de lectura"
ON public.mensajes FOR UPDATE
USING ( 
  EXISTS (
    SELECT 1
    FROM public.conversaciones
    WHERE conversaciones.id = mensajes.conversacion_id AND
          -- Solo el destinatario puede marcar como leído
          conversaciones.vendedor_id = auth.uid() AND remitente_id != auth.uid() OR
          conversaciones.comprador_id = auth.uid() AND remitente_id != auth.uid()
  )
)
WITH CHECK ( leido = TRUE );


-- 6. Índices para mejorar el rendimiento de las consultas
-- Esto es importante para que el chat sea rápido cuando tengas muchos mensajes.
CREATE INDEX IF NOT EXISTS idx_conversaciones_participantes ON public.conversaciones(comprador_id, vendedor_id);
CREATE INDEX IF NOT EXISTS idx_mensajes_conversacion ON public.mensajes(conversacion_id, fecha_creacion DESC);
CREATE INDEX IF NOT EXISTS idx_mensajes_remitente ON public.mensajes(remitente_id);


-- 7. Habilitar la funcionalidad de tiempo real en las nuevas tablas
-- Esto es lo que permite que el chat se actualice automáticamente.

-- NOTA: La configuración de realtime a veces es mejor hacerla desde la UI de Supabase
-- en la sección Database > Replication, para asegurar que todo esté bien configurado.
-- Si las tablas 'conversaciones' y 'mensajes' no aparecen en la sección de "Source",
-- puedes agregarlas manualmente haciendo clic en "0 tables" y seleccionándolas.

