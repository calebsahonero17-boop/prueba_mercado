-- 28_migrate_product_categories.sql

-- 1. Añadir la nueva columna categoria_id a la tabla productos
ALTER TABLE public.productos
ADD COLUMN categoria_id uuid;

-- 2. Crear un índice en la nueva columna para optimizar la actualización y futuras búsquedas
CREATE INDEX IF NOT EXISTS idx_productos_categoria_id ON public.productos USING btree (categoria_id);

-- 3. Actualizar los productos existentes para vincularlos a las nuevas categorías
--    Esto requiere un mapeo de los nombres de categoría antiguos a los IDs de las nuevas categorías.
--    Para simplificar, mapearemos los productos existentes a la categoría principal más relevante.
--    NOTA: Si tienes productos con categorías muy específicas que no coinciden con las nuevas categorías principales,
--          necesitarás ajustar este mapeo manualmente o crear categorías adicionales.

UPDATE public.productos p
SET categoria_id = c.id
FROM public.categorias c
WHERE p.categoria = c.nombre AND c.parent_id IS NULL; -- Mapear a categorías principales

-- Si hay productos con categorías que no coinciden con las nuevas categorías principales,
-- puedes decidir qué hacer con ellos (ej. asignarlos a una categoría "Otros" o dejarlos NULL temporalmente).
-- Por ahora, los que no coincidan se quedarán con categoria_id NULL.

-- 4. Añadir la restricción de clave foránea
ALTER TABLE public.productos
ADD CONSTRAINT fk_categoria
FOREIGN KEY (categoria_id) REFERENCES public.categorias(id) ON DELETE SET NULL; -- O ON DELETE RESTRICT/CASCADE

-- 5. Hacer la columna categoria_id NOT NULL (si todos los productos han sido mapeados)
--    NOTA: Ejecuta esto SOLO después de asegurarte de que todos los productos tienen una categoria_id válida.
--    Si hay productos con categoria_id NULL, esta sentencia fallará.
-- ALTER TABLE public.productos
-- ALTER COLUMN categoria_id SET NOT NULL;

-- 6. Eliminar la columna antigua 'categoria' (text)
ALTER TABLE public.productos
DROP COLUMN categoria;

-- 7. Renombrar la columna 'categoria_id' a 'categoria' para mantener la convención de nombres
ALTER TABLE public.productos
RENAME COLUMN categoria_id TO categoria;

-- NOTA IMPORTANTE:
-- Después de ejecutar este script, deberás revisar tus datos.
-- Si tienes productos con categorías antiguas que no se mapearon a las nuevas categorías principales,
-- su campo 'categoria' (ahora el UUID) será NULL. Deberás asignarlos manualmente.
-- Una vez que todos los productos tengan una categoría asignada, puedes ejecutar:
-- ALTER TABLE public.productos ALTER COLUMN categoria SET NOT NULL;