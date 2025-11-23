-- migraciones_sql/43_add_admin_rls_function_and_policy.sql

-- 1. Crear una función para verificar si el usuario autenticado es administrador o super_admin
CREATE OR REPLACE FUNCTION public.is_admin_or_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT rol INTO user_role FROM public.perfiles WHERE id = auth.uid();
  RETURN user_role IN ('admin', 'super_admin');
END;
$$;

-- 2. Añadir una política RLS a la tabla solicitudes_suscripcion para administradores
--    Esta política permitirá a los administradores ver todas las solicitudes.
CREATE POLICY "Admins and SuperAdmins can view all subscription requests"
ON public.solicitudes_suscripcion FOR SELECT
USING (public.is_admin_or_super_admin());

-- NOTA: Asegúrate de que la tabla 'perfiles' tenga la columna 'rol' y que los roles 'admin' y 'super_admin' estén definidos.
