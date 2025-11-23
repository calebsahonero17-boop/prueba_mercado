--
-- Corregir la restricción en la tabla de mensajes para permitir mensajes que solo contienen imágenes.
--

-- 1. Eliminar la restricción "NOT NULL" de la columna "contenido".
-- Esto permitirá que se inserten mensajes donde el texto sea nulo (porque se está enviando una imagen).
ALTER TABLE public.mensajes
ALTER COLUMN contenido DROP NOT NULL;

-- 2. Eliminar la antigua restricción CHECK que requería que el contenido tuviera longitud > 0.
-- El nombre de la restricción es auto-generado por Postgres, usualmente "mensajes_contenido_check".
-- Usamos un bloque DO para intentar eliminarla sin causar un error si el nombre es diferente o no existe.
DO $$
BEGIN
   IF EXISTS (SELECT 1 FROM information_schema.constraint_column_usage 
              WHERE table_name = 'mensajes' AND constraint_name = 'mensajes_contenido_check')
   THEN
      ALTER TABLE public.mensajes DROP CONSTRAINT mensajes_contenido_check;
   END IF;
END $$;


-- 3. (Opcional pero recomendado) Añadir una nueva restricción a nivel de tabla que verifique la lógica correcta.
-- Esta nueva regla asegura que un mensaje debe tener O texto O una imagen, pero no puede estar vacío.
ALTER TABLE public.mensajes
ADD CONSTRAINT contenido_o_imagen_requeridos
CHECK (
  (contenido IS NOT NULL AND trim(contenido) <> '') OR
  (imagen_url IS NOT NULL)
);


