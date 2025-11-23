-- Script SQL simplificado para crear las tablas del sistema de chat
-- Ejecutar en el SQL Editor de Supabase (una sección a la vez)

-- PASO 1: Crear tabla de conversaciones
CREATE TABLE IF NOT EXISTS conversaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  comprador_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  vendedor_id UUID REFERENCES perfiles(id) ON DELETE CASCADE,
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  ultimo_mensaje TEXT,
  fecha_ultimo_mensaje TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  comprador_leido BOOLEAN DEFAULT true,
  vendedor_leido BOOLEAN DEFAULT false,
  activa BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);