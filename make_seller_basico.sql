-- make_seller_basico.sql
--
-- Este script SQL te permite cambiar el rol de un usuario a 'vendedor'
-- y asignarle el plan de suscripción 'Vendedor Basico' en tu base de datos Supabase.
--
-- Pasos para usar este script:
-- 1. Copia el contenido de este archivo.
-- 2. Abre tu navegador y ve a https://app.supabase.com/.
-- 3. Inicia sesión y selecciona tu proyecto.
-- 4. En la barra lateral izquierda, haz clic en 'SQL Editor'.
-- 5. Pega el contenido de este script en el editor de SQL.
-- 6. Reemplaza el placeholder:
--    - '[UID_DEL_USUARIO]' con el ID real del usuario (ej: 'a7d348e9-b475-4223-bf00-bc586c9411df')
-- 7. Haz clic en el botón 'Run' (Ejecutar) para aplicar los cambios.
--
-- ¡IMPORTANTE! Ten mucho cuidado al ejecutar comandos SQL directamente,
-- ya que modifican la base de datos sin pasar por la lógica de tu aplicación.

UPDATE public.perfiles
SET 
    rol = 'vendedor',
    plan_suscripcion = 'Vendedor Basico', 
    fecha_expiracion_suscripcion = (NOW() + INTERVAL '1 month')::date, -- Establece la expiración a 1 mes desde ahora
    fecha_actualizacion = NOW()
WHERE id = '[UID_DEL_USUARIO]';

-- Opcional: Para verificar el cambio, puedes ejecutar esta consulta después:
-- SELECT id, email, rol, plan_suscripcion, fecha_expiracion_suscripcion FROM public.perfiles WHERE id = '[UID_DEL_USUARIO]';
