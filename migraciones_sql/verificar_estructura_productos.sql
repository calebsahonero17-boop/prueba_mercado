-- Ver la estructura completa de la tabla productos
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'productos'
ORDER BY ordinal_position;
