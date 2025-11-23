-- MIGRACIÓN 60: Añadir política de RLS para que administradores puedan actualizar solicitudes de suscripción

-- Descripción:
-- La política RLS existente para 'solicitudes_suscripcion' permite a los usuarios ver e insertar sus propias solicitudes,
-- y a los administradores ver todas las solicitudes. Sin embargo, no existe una política que permita
-- a los administradores actualizar el estado de estas solicitudes (aprobar/rechazar).
-- Esta migración añade una política que permite a los usuarios con rol 'admin' o 'super_admin'
-- actualizar cualquier fila en la tabla 'solicitudes_suscripcion'.

CREATE POLICY "Admins and SuperAdmins can update subscription requests"
ON public.solicitudes_suscripcion FOR UPDATE
USING (public.is_admin_or_super_admin());

-- Nota: La función public.is_admin_or_super_admin() debe existir. Fue creada en la migración 43.
