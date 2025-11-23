-- 27_create_categories_table.sql

-- Crear la tabla de categorías
CREATE TABLE IF NOT EXISTS public.categorias (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    parent_id uuid REFERENCES public.categorias(id) ON DELETE CASCADE,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- Crear índices para optimizar búsquedas
CREATE INDEX IF NOT EXISTS idx_categorias_parent_id ON public.categorias USING btree (parent_id);
CREATE INDEX IF NOT EXISTS idx_categorias_slug ON public.categorias USING btree (slug);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.categorias ENABLE ROW LEVEL SECURITY;

-- Políticas de RLS (ejemplo básico, ajustar según necesidad)
DROP POLICY IF EXISTS "Enable read access for all users" ON public.categorias;
CREATE POLICY "Enable read access for all users" ON public.categorias FOR SELECT USING (true);

-- Insertar categorías y subcategorías
-- Categorías principales
INSERT INTO public.categorias (id, nombre, slug, parent_id) VALUES
    ('00000000-0000-0000-0000-000000000001', 'Hogar y jardín', 'hogar-y-jardin', NULL),
    ('00000000-0000-0000-0000-000000000002', 'Vehículos', 'vehiculos', NULL),
    ('00000000-0000-0000-0000-000000000003', 'Ropa y accesorios', 'ropa-y-accesorios', NULL),
    ('00000000-0000-0000-0000-000000000004', 'Bebés y niños', 'bebes-y-ninos', NULL),
    ('00000000-0000-0000-0000-000000000005', 'Electrónica', 'electronica', NULL),
    ('00000000-0000-0000-0000-000000000006', 'Libros, música y entretenimiento', 'libros-musica-entretenimiento', NULL),
    ('00000000-0000-0000-0000-000000000007', 'Deportes y actividades al aire libre', 'deportes-actividades-aire-libre', NULL),
    ('00000000-0000-0000-0000-000000000008', 'Mascotas', 'mascotas', NULL),
    ('00000000-0000-0000-0000-000000000009', 'Hobbies y coleccionismo', 'hobbies-coleccionismo', NULL),
    ('00000000-0000-0000-0000-000000000010', 'Oficina y negocios', 'oficina-y-negocios', NULL),
    ('00000000-0000-0000-0000-000000000011', 'Propiedades', 'propiedades', NULL)
ON CONFLICT (id) DO NOTHING; -- Use ON CONFLICT to avoid errors if run multiple times

-- Subcategorías de Hogar y jardín
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Muebles', 'muebles', (SELECT id FROM public.categorias WHERE slug = 'hogar-y-jardin')),
    ('Decoración del hogar', 'decoracion-del-hogar', (SELECT id FROM public.categorias WHERE slug = 'hogar-y-jardin')),
    ('Electrodomésticos', 'electrodomesticos', (SELECT id FROM public.categorias WHERE slug = 'hogar-y-jardin')),
    ('Cocina y comedor', 'cocina-y-comedor', (SELECT id FROM public.categorias WHERE slug = 'hogar-y-jardin')),
    ('Jardín y exteriores', 'jardin-y-exteriores', (SELECT id FROM public.categorias WHERE slug = 'hogar-y-jardin')),
    ('Mejoras para el hogar', 'mejoras-para-el-hogar', (SELECT id FROM public.categorias WHERE slug = 'hogar-y-jardin'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Vehículos
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Autos', 'autos', (SELECT id FROM public.categorias WHERE slug = 'vehiculos')),
    ('Motos', 'motos', (SELECT id FROM public.categorias WHERE slug = 'vehiculos')),
    ('Camionetas y furgonetas', 'camionetas-y-furgonetas', (SELECT id FROM public.categorias WHERE slug = 'vehiculos')),
    ('Piezas y accesorios para vehículos', 'piezas-accesorios-vehiculos', (SELECT id FROM public.categorias WHERE slug = 'vehiculos')),
    ('Vehículos recreativos, botes y otros', 'vehiculos-recreativos-botes-otros', (SELECT id FROM public.categorias WHERE slug = 'vehiculos'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Ropa y accesorios
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Ropa para mujer', 'ropa-para-mujer', (SELECT id FROM public.categorias WHERE slug = 'ropa-y-accesorios')),
    ('Ropa para hombre', 'ropa-para-hombre', (SELECT id FROM public.categorias WHERE slug = 'ropa-y-accesorios')),
    ('Calzado', 'calzado', (SELECT id FROM public.categorias WHERE slug = 'ropa-y-accesorios')),
    ('Bolsos, carteras y mochilas', 'bolsos-carteras-mochilas', (SELECT id FROM public.categorias WHERE slug = 'ropa-y-accesorios')),
    ('Joyas y relojes', 'joyas-y-relojes', (SELECT id FROM public.categorias WHERE slug = 'ropa-y-accesorios')),
    ('Accesorios', 'accesorios', (SELECT id FROM public.categorias WHERE slug = 'ropa-y-accesorios'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Bebés y niños
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Ropa para bebés y niños', 'ropa-para-bebes-y-ninos', (SELECT id FROM public.categorias WHERE slug = 'bebes-y-ninos')),
    ('Juguetes', 'juguetes', (SELECT id FROM public.categorias WHERE slug = 'bebes-y-ninos')),
    ('Artículos para bebé (cochecitos, cunas, sillas, etc.)', 'articulos-para-bebe', (SELECT id FROM public.categorias WHERE slug = 'bebes-y-ninos'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Electrónica
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Teléfonos celulares', 'telefonos-celulares', (SELECT id FROM public.categorias WHERE slug = 'electronica')),
    ('Computadoras y laptops', 'computadoras-y-laptops', (SELECT id FROM public.categorias WHERE slug = 'electronica')),
    ('Televisores', 'televisores', (SELECT id FROM public.categorias WHERE slug = 'electronica')),
    ('Consolas y videojuegos', 'consolas-y-videojuegos', (SELECT id FROM public.categorias WHERE slug = 'electronica')),
    ('Cámaras', 'camaras', (SELECT id FROM public.categorias WHERE slug = 'electronica')),
    ('Accesorios electrónicos', 'accesorios-electronicos', (SELECT id FROM public.categorias WHERE slug = 'electronica'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Libros, música y entretenimiento
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Libros', 'libros', (SELECT id FROM public.categorias WHERE slug = 'libros-musica-entretenimiento')),
    ('Películas', 'peliculas', (SELECT id FROM public.categorias WHERE slug = 'libros-musica-entretenimiento')),
    ('Música', 'musica', (SELECT id FROM public.categorias WHERE slug = 'libros-musica-entretenimiento')),
    ('Instrumentos musicales', 'instrumentos-musicales', (SELECT id FROM public.categorias WHERE slug = 'libros-musica-entretenimiento')),
    ('Juegos de mesa y rompecabezas', 'juegos-mesa-rompecabezas', (SELECT id FROM public.categorias WHERE slug = 'libros-musica-entretenimiento'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Deportes y actividades al aire libre
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Equipos deportivos', 'equipos-deportivos', (SELECT id FROM public.categorias WHERE slug = 'deportes-actividades-aire-libre')),
    ('Bicicletas', 'bicicletas', (SELECT id FROM public.categorias WHERE slug = 'deportes-actividades-aire-libre')),
    ('Camping y senderismo', 'camping-y-senderismo', (SELECT id FROM public.categorias WHERE slug = 'deportes-actividades-aire-libre')),
    ('Fitness y entrenamiento', 'fitness-y-entrenamiento', (SELECT id FROM public.categorias WHERE slug = 'deportes-actividades-aire-libre'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Mascotas
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Accesorios para mascotas', 'accesorios-para-mascotas', (SELECT id FROM public.categorias WHERE slug = 'mascotas')),
    ('Comida y suministros', 'comida-y-suministros', (SELECT id FROM public.categorias WHERE slug = 'mascotas')),
    ('Adopciones o venta de animales (según políticas locales de Facebook)', 'adopciones-venta-animales', (SELECT id FROM public.categorias WHERE slug = 'mascotas'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Hobbies y coleccionismo
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Arte y manualidades', 'arte-y-manualidades', (SELECT id FROM public.categorias WHERE slug = 'hobbies-coleccionismo')),
    ('Antigüedades y artículos de colección', 'antiguedades-articulos-coleccion', (SELECT id FROM public.categorias WHERE slug = 'hobbies-coleccionismo')),
    ('Modelismo, cómics, figuras, etc.', 'modelismo-comics-figuras', (SELECT id FROM public.categorias WHERE slug = 'hobbies-coleccionismo'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Oficina y negocios
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Mobiliario de oficina', 'mobiliario-de-oficina', (SELECT id FROM public.categorias WHERE slug = 'oficina-y-negocios')),
    ('Equipos y suministros comerciales', 'equipos-suministros-comerciales', (SELECT id FROM public.categorias WHERE slug = 'oficina-y-negocios')),
    ('Herramientas y materiales', 'herramientas-y-materiales', (SELECT id FROM public.categorias WHERE slug = 'oficina-y-negocios'))
ON CONFLICT (nombre) DO NOTHING;

-- Subcategorías de Propiedades
INSERT INTO public.categorias (nombre, slug, parent_id) VALUES
    ('Casas y departamentos en venta', 'casas-departamentos-venta', (SELECT id FROM public.categorias WHERE slug = 'propiedades')),
    ('Alquileres', 'alquileres', (SELECT id FROM public.categorias WHERE slug = 'propiedades')),
    ('Terrenos', 'terrenos', (SELECT id FROM public.categorias WHERE slug = 'propiedades')),
    ('Oficinas y locales comerciales', 'oficinas-locales-comerciales', (SELECT id FROM public.categorias WHERE slug = 'propiedades'))
ON CONFLICT (nombre) DO NOTHING;