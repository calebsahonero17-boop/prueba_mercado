-- PASO 11: FUNCIONALIDAD DE COMPROBANTES DE PAGO
-- =====================================================

-- 1. MODIFICAR LA TABLA DE PEDIDOS
-- Agregamos una columna para la URL del comprobante y un estado de pago dedicado.
ALTER TABLE pedidos
ADD COLUMN IF NOT EXISTS comprobante_pago_url TEXT,
ADD COLUMN IF NOT EXISTS estado_pago VARCHAR(20) DEFAULT 'no_pagado' CHECK (estado_pago IN ('no_pagado', 'en_verificacion', 'pagado', 'rechazado'));

-- Crear un índice para consultar pedidos por estado de pago
CREATE INDEX IF NOT EXISTS idx_pedidos_estado_pago ON pedidos(estado_pago);


-- 2. CREAR BUCKET PARA COMPROBANTES
-- Bucket para almacenar las imágenes de los comprobantes de pago.
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes', 'comprobantes', false)
ON CONFLICT (id) DO NOTHING;


-- 3. POLÍTICAS DE SEGURIDAD PARA EL BUCKET 'comprobantes'
-- Estas políticas aseguran que los usuarios solo puedan subir/ver sus propios
-- comprobantes y que los vendedores puedan ver los de sus ventas.

-- Eliminar políticas existentes para evitar duplicados
DROP POLICY IF EXISTS "Permitir subida a usuarios autenticados" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura al dueño del pedido" ON storage.objects;
DROP POLICY IF EXISTS "Permitir lectura al vendedor del pedido" ON storage.objects;

-- Política para SUBIR (INSERT)
CREATE POLICY "Permitir subida a usuarios autenticados"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'comprobantes'
  -- La ruta del archivo debe ser: {userId}/{orderId}/{nombre_archivo}
  -- El usuario solo puede subir en su propia carpeta (su auth.uid()).
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para LEER (SELECT) - Dueño del pedido
CREATE POLICY "Permitir lectura al dueño del pedido"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'comprobantes'
  AND auth.uid() = (
    SELECT p.usuario_id FROM pedidos p
    -- El orderId se extrae del nombre de la carpeta.
    WHERE p.id = (storage.foldername(name))[2]::uuid
  )
);

-- Política para LEER (SELECT) - Vendedor del pedido
CREATE POLICY "Permititir lectura al vendedor del pedido"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'comprobantes'
  AND auth.uid() = (
    SELECT p.vendedor_id FROM pedidos p
    WHERE p.id = (storage.foldername(name))[2]::uuid
  )
);
