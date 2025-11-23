-- PASO 4: DATOS DE PRUEBA
-- =====================================================

-- Usuario administrador demo
INSERT INTO perfiles (
    id,
    nombres,
    apellidos,
    email,
    telefono,
    carnet_identidad,
    ciudad,
    rol,
    avatar
) VALUES (
    gen_random_uuid(),
    'Admin',
    'Sistema',
    'admin@mercadoexpress.bo',
    '70000000',
    '00000000',
    'La Paz',
    'admin',
    'AS'
) ON CONFLICT (email) DO NOTHING;

-- Usuario demo normal
INSERT INTO perfiles (
    id,
    nombres,
    apellidos,
    email,
    telefono,
    carnet_identidad,
    ciudad,
    rol,
    avatar
) VALUES (
    gen_random_uuid(),
    'Usuario',
    'Demo',
    'demo@mercadoexpress.bo',
    '70123456',
    '12345678',
    'La Paz',
    'usuario',
    'UD'
) ON CONFLICT (email) DO NOTHING;

-- Productos de ejemplo
INSERT INTO productos (nombre, descripcion, precio, categoria, stock, url_imagen) VALUES
('Laptop Dell Inspiron', 'Laptop Dell Inspiron 15 3000 con procesador Intel Core i5', 4500.00, 'Tecnología', 10, 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400'),
('iPhone 13', 'Apple iPhone 13 128GB disponible en varios colores', 6800.00, 'Tecnología', 5, 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400'),
('Mesa de Comedor', 'Mesa de comedor de madera para 6 personas', 1200.00, 'Hogar', 3, 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400'),
('Bicicleta Montaña', 'Bicicleta de montaña aro 26 con 21 velocidades', 2200.00, 'Deportes', 8, 'https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400'),
('Camiseta Nike', 'Camiseta deportiva Nike Dri-FIT para hombre', 180.00, 'Ropa', 25, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
('Audífonos Sony', 'Audífonos inalámbricos Sony WH-1000XM4 con cancelación de ruido', 1800.00, 'Tecnología', 12, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400')
ON CONFLICT DO NOTHING;