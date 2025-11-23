-- MIGRACIÓN 61: Permitir a los administradores cambiar roles de usuario

-- Descripción:
-- La función de trigger 'funcion_proteger_cambio_rol' actualmente solo permite
-- a los 'super_admin' cambiar el rol de un usuario. Esto es demasiado restrictivo para la
-- operación de "Hacer Vendedor", que debe ser realizada por un 'admin'.
--
-- Esta migración actualiza la función para permitir que tanto 'admin' como 'super_admin'
-- puedan cambiar el rol de un usuario, utilizando la función auxiliar 'es_administrador_o_superior()'.

CREATE OR REPLACE FUNCTION public.funcion_proteger_cambio_rol()
RETURNS TRIGGER AS $$
DECLARE
  usuario_es_admin_o_superior BOOLEAN;
BEGIN
  -- Se verifica si el usuario que ejecuta la acción es un admin o super_admin
  SELECT public.es_administrador_o_superior() INTO usuario_es_admin_o_superior;

  -- Si el rol del registro está cambiando (NEW.rol es diferente de OLD.rol)
  -- Y el usuario que hace el cambio NO es un admin o super_admin
  IF NEW.rol IS DISTINCT FROM OLD.rol AND (usuario_es_admin_o_superior IS NULL OR usuario_es_admin_o_superior = FALSE) THEN
    -- Entonces, se lanza un error y se cancela la transacción
    RAISE EXCEPTION 'Acción no permitida: Solo los administradores o super_administradores pueden cambiar el rol de un usuario.';
  END IF;

  -- Si la condición no se cumple, se permite la actualización
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Nota: El trigger 'trigger_proteger_cambio_rol' en la tabla 'perfiles' ya existe
-- y no necesita ser modificado, ya que simplemente ejecuta esta función.
