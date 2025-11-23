-- Agrega la columna 'activa' a la tabla 'conversaciones'
-- Esta columna se usa para filtrar conversaciones activas en el chat.
ALTER TABLE public.conversaciones
ADD COLUMN IF NOT EXISTS activa BOOLEAN DEFAULT TRUE;

-- Opcional: Añadir un índice si se va a consultar mucho por esta columna
-- CREATE INDEX IF NOT EXISTS idx_conversaciones_activa ON public.conversaciones (activa);

-- Opcional: Actualizar las conversaciones existentes para que sean activas por defecto
-- UPDATE public.conversaciones SET activa = TRUE WHERE activa IS NULL;

-- Asegurar que las políticas de RLS permitan la lectura/escritura de esta columna si es necesario.
