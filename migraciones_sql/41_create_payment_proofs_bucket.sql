-- migraciones_sql/41_create_payment_proofs_bucket.sql

-- Crear el bucket 'comprobantes_pago'
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprobantes_pago', 'comprobantes_pago', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS para el bucket
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS para el bucket 'comprobantes_pago'

-- Permitir que usuarios autenticados suban comprobantes a su propia carpeta
CREATE POLICY "Allow authenticated users to upload their own payment proofs"
ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'comprobantes_pago' AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Permitir que usuarios autenticados vean sus propios comprobantes
CREATE POLICY "Allow authenticated users to view their own payment proofs"
ON storage.objects FOR SELECT USING (
  bucket_id = 'comprobantes_pago' AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Permitir que usuarios autenticados actualicen sus propios comprobantes
CREATE POLICY "Allow authenticated users to update their own payment proofs"
ON storage.objects FOR UPDATE USING (
  bucket_id = 'comprobantes_pago' AND auth.uid() = (storage.foldername(name))[1]::uuid
);

-- Permitir que usuarios autenticados eliminen sus propios comprobantes
CREATE POLICY "Allow authenticated users to delete their own payment proofs"
ON storage.objects FOR DELETE USING (
  bucket_id = 'comprobantes_pago' AND auth.uid() = (storage.foldername(name))[1]::uuid
);
