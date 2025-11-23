-- Script para agregar campos de perfil de vendedor a la tabla perfiles
-- Ejecutar en el SQL Editor de Supabase

-- Agregar columnas para perfil de vendedor
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS descripcion_vendedor TEXT;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS especialidad VARCHAR(255);
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS horario_atencion VARCHAR(255);
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS telefono_whatsapp VARCHAR(20);
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS acepta_envios BOOLEAN DEFAULT true;
ALTER TABLE perfiles ADD COLUMN IF NOT EXISTS ciudades_envio TEXT;

-- Agregar columna vendedor_id a productos si no existe
ALTER TABLE productos ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES perfiles(id);

-- Agregar columna vendedor_id a pedidos si no existe
ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS vendedor_id UUID REFERENCES perfiles(id);

-- Actualizar productos existentes para asignar vendedor_id basado en el usuario demo
-- (solo si hay productos sin vendedor_id)
UPDATE productos
SET vendedor_id = (SELECT id FROM perfiles WHERE email = 'demo@mercadoexpress.bo' LIMIT 1)
WHERE vendedor_id IS NULL;

-- Comentarios sobre las nuevas columnas:
-- descripcion_vendedor: Descripción personal del vendedor
-- especialidad: Qué tipo de productos vende principalmente
-- horario_atencion: Horarios en que atiende consultas
-- telefono_whatsapp: Número de WhatsApp para contacto directo
-- acepta_envios: Si el vendedor realiza envíos
-- ciudades_envio: A qué ciudades envía productos

-- Crear índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_productos_vendedor_id ON productos(vendedor_id);
CREATE INDEX IF NOT EXISTS idx_pedidos_vendedor_id ON pedidos(vendedor_id);