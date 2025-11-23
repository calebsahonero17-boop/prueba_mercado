-- PASO 12: AÑADIR ROL DE VENDEDOR
-- =====================================================

-- 1. ELIMINAR LA RESTRICCIÓN (CHECK) ANTIGUA
-- No se puede modificar un CHECK directamente, hay que eliminarlo y crearlo de nuevo.
ALTER TABLE perfiles DROP CONSTRAINT IF EXISTS perfiles_rol_check;

-- 2. AÑADIR LA NUEVA RESTRICCIÓN CON EL ROL 'vendedor'
ALTER TABLE perfiles
ADD CONSTRAINT perfiles_rol_check
CHECK (rol IN ('usuario', 'vendedor', 'moderador', 'admin', 'super_admin'));

-- 3. (Opcional) Asignar el rol de vendedor a un usuario de prueba
-- Reemplaza 'email_del_vendedor@ejemplo.com' con el email del usuario que quieras que sea vendedor.
-- UPDATE perfiles
-- SET rol = 'vendedor'
-- WHERE email = 'email_del_vendedor@ejemplo.com';
