-- MIGRACIÓN 62: Desactivar la protección de cambio de rol

-- Descripción:
-- Esta migración elimina el trigger 'trigger_proteger_cambio_rol' de la tabla 'public.perfiles'.
-- La función 'funcion_proteger_cambio_rol()' asociada a este trigger impedía que usuarios
-- que no fueran 'super_admin' (o 'admin' después de la última modificación) cambiaran el rol de un usuario.
--
-- Al eliminar este trigger, la protección a nivel de base de datos sobre los cambios de rol
-- se desactiva. Los usuarios con permisos de UPDATE sobre la tabla 'perfiles' podrán
-- cambiar el rol de cualquier usuario sin restricciones adicionales.

DROP TRIGGER IF EXISTS trigger_proteger_cambio_rol ON public.perfiles;

-- Nota: La función 'funcion_proteger_cambio_rol()' se mantendrá en la base de datos,
-- pero ya no será ejecutada automáticamente. Si en el futuro se desea restaurar
-- esta protección, se deberá recrear el trigger.
