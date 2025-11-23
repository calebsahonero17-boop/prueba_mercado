-- ================================================================
-- MIGRACIÓN 55: [RESTAURACIÓN PARCIAL] Políticas de Usuario para Pedidos
-- FECHA: 2025-11-18
-- AUTOR: Asistente de IA
--
-- OBJETIVO:
-- Continuar la depuración del error de recursión.
-- Se restauran únicamente las políticas de seguridad para usuarios normales
-- en 'pedidos' y 'detalle_pedidos'. Estas políticas son simples y no deberían
-- causar recursión por sí mismas.
--
-- PASO SIGUIENTE:
-- Si después de ejecutar esto, el error de recursión NO vuelve, sabremos que
-- estas políticas son seguras y el problema está en las políticas de administrador.
-- ================================================================

BEGIN;

RAISE NOTICE 'Paso 1: Restaurando políticas de usuario para "pedidos"...';

-- Política para que los usuarios normales gestionen SUS PROPIOS pedidos.
CREATE POLICY "1_Usuarios gestionan sus pedidos" ON public.pedidos
FOR ALL
USING (auth.uid() = usuario_id)
WITH CHECK (auth.uid() = usuario_id);


RAISE NOTICE 'Paso 2: Restaurando políticas de usuario para "detalle_pedidos"...';

-- Política para que los usuarios normales vean y gestionen los detalles de sus propios pedidos.
CREATE POLICY "1_Usuarios gestionan detalles de sus pedidos" ON public.detalle_pedidos
FOR ALL
USING (EXISTS (
    SELECT 1 FROM public.pedidos
    WHERE pedidos.id = detalle_pedidos.pedido_id AND pedidos.usuario_id = auth.uid()
));


RAISE NOTICE '✅ MIGRACIÓN 55 COMPLETA: Políticas de usuario para pedidos restauradas.';
RAISE NOTICE 'Por favor, prueba la subida de audio de nuevo e informa del resultado.';

COMMIT;
