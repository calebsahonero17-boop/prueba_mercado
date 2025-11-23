-- 1. Crear una función segura para obtener el rol del usuario actual.
-- SECURITY DEFINER es la clave: permite que la función se ejecute con privilegios elevados
-- para evitar el bucle de recursión infinita en las políticas de RLS.
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS TEXT AS $$
BEGIN
  -- Comprueba si el usuario está autenticado antes de intentar leer el perfil
  IF auth.uid() IS NULL THEN
    RETURN NULL;
  END IF;
  RETURN (SELECT rol FROM public.perfiles WHERE id = auth.uid());
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Eliminar las políticas problemáticas anteriores para empezar de cero.
DROP POLICY IF EXISTS "Allow admin to read all data" ON public.pedidos;
DROP POLICY IF EXISTS "Allow admin to read all data" ON public.perfiles;
DROP POLICY IF EXISTS "Allow admin to read all data" ON public.productos;
DROP POLICY IF EXISTS "Allow admin to read all data" ON public.detalle_pedidos;
DROP POLICY IF EXISTS "Los usuarios pueden ver sus propios perfiles" ON public.perfiles;


-- 3. Recrear las políticas para el dashboard de Analytics usando la nueva función.
-- Esto permite a los administradores leer todas las filas de estas tablas.
CREATE POLICY "Allow admin to read all data"
ON public.pedidos
FOR SELECT
TO authenticated
USING ( get_my_role() IN ('admin', 'super_admin') );

CREATE POLICY "Allow admin to read all data"
ON public.productos
FOR SELECT
TO authenticated
USING ( get_my_role() IN ('admin', 'super_admin') );

CREATE POLICY "Allow admin to read all data"
ON public.detalle_pedidos
FOR SELECT
TO authenticated
USING ( get_my_role() IN ('admin', 'super_admin') );


-- 4. Crear políticas para la tabla 'perfiles'.
-- Los administradores pueden leer todos los perfiles.
CREATE POLICY "Admins can read all profiles"
ON public.perfiles
FOR SELECT
TO authenticated
USING ( get_my_role() IN ('admin', 'super_admin') );

-- Y los usuarios autenticados pueden leer su PROPIO perfil.
-- Esto es crucial para que el login funcione para todos.
CREATE POLICY "Users can read their own profile"
ON public.perfiles
FOR SELECT
TO authenticated
USING ( auth.uid() = id );


-- Mensaje de confirmación
SELECT 'Políticas de RLS para analytics y perfiles corregidas exitosamente con la función get_my_role().';
