# 🚀 CONFIGURACIÓN COMPLETA DE BASE DE DATOS SUPABASE
## Para hacer tu aplicación 100% funcional

### 📋 PASOS A SEGUIR:

## 1. **Acceder a tu Panel de Supabase**
1. Ve a [supabase.com](https://supabase.com)
2. Inicia sesión en tu cuenta
3. Selecciona tu proyecto (el que tiene la URL: `uqomjrkzhkxqkdzyrdke.supabase.co`)

## 2. **Ejecutar el Script SQL**
1. En el panel de Supabase, ve a la sección **"SQL Editor"** en el menú lateral
2. Crea una nueva consulta
3. Copia TODO el contenido del archivo `setup_database_completo.sql`
4. Pégalo en el editor SQL
5. Haz clic en **"RUN"** para ejecutar

## 3. **Obtener tu User ID para configurar tu perfil**
1. Ve a **"Authentication"** → **"Users"** en el panel de Supabase
2. Busca tu email `calebsahon@gmail.com`
3. Copia el **UUID** (algo como: `550e8400-e29b-41d4-a716-446655440000`)
4. Regresa al **SQL Editor** y ejecuta este comando (reemplazando TU_USER_ID):

```sql
INSERT INTO public.perfiles (
    id,
    email,
    nombres,
    apellidos,
    telefono,
    carnet_identidad,
    ciudad,
    rol,
    descripcion_vendedor,
    especialidad,
    acepta_envios,
    ciudades_envio
) VALUES (
    'TU_USER_ID_AQUI', -- ⚠️ REEMPLAZA CON TU UUID REAL
    'calebsahon@gmail.com',
    'Caleb',
    'Sahón',
    '70123456',
    '12345678',
    'La Paz',
    'admin',
    'Desarrollador y administrador de Mercado Express',
    'Tecnología y desarrollo',
    true,
    'La Paz, El Alto, Cochabamba, Santa Cruz'
) ON CONFLICT (id) DO UPDATE SET
    rol = 'admin',
    descripcion_vendedor = 'Desarrollador y administrador de Mercado Express',
    especialidad = 'Tecnología y desarrollo';
```

## 4. **Verificar que todo funcionó**
Ejecuta esta consulta para verificar:

```sql
SELECT 'Categorías creadas:' as tipo, COUNT(*) as cantidad FROM public.categorias
UNION ALL
SELECT 'Productos creados:' as tipo, COUNT(*) as cantidad FROM public.productos
UNION ALL
SELECT 'Perfiles creados:' as tipo, COUNT(*) as cantidad FROM public.perfiles;
```

**Deberías ver:**
- Categorías creadas: 8
- Productos creados: 17
- Perfiles creados: 2 (tú + el vendedor demo)

## 5. **¿Qué tendrás después de esto?**

### ✅ **8 Categorías completas:**
- Tecnología
- Hogar y Jardín
- Ropa y Moda
- Deportes y Fitness
- Libros y Educación
- Salud y Belleza
- Automotriz
- Artesanías Bolivianas

### ✅ **17 Productos reales con:**
- Precios en bolivianos
- Descripciones detalladas
- Imágenes de alta calidad
- Stock disponible
- Diferentes categorías
- Productos destacados

### ✅ **Ejemplos de productos:**
**Tecnología:**
- Laptop Dell Inspiron (Bs. 4,500)
- iPhone 14 (Bs. 6,800)
- Samsung Galaxy A54 (Bs. 2,800)
- Audífonos Sony (Bs. 1,800)

**Artesanías Bolivianas:**
- Aguayo Paceño (Bs. 150)
- Charango Boliviano (Bs. 850)
- Sombrero Borsalino (Bs. 1,200)

**Y muchos más...**

### ✅ **Sistema completo:**
- Gestión de usuarios y perfiles
- Carrito de compras funcional
- Sistema de pedidos
- Políticas de seguridad configuradas
- Índices para mejor rendimiento

## 6. **Después de configurar la DB**

1. **Reinicia tu aplicación** (si está corriendo)
2. **Haz login con tu cuenta** (`calebsahon@gmail.com`)
3. **Ve a la página "Comprar"** - ahora verás productos reales
4. **Podrás:**
   - Ver todos los productos con imágenes reales
   - Filtrar por categorías
   - Buscar productos
   - Agregar al carrito
   - Realizar pedidos completos
   - Gestionar tu perfil de vendedor

## 🔧 **Si algo falla:**

1. **Revisa la consola del navegador** para errores
2. **Verifica que las políticas RLS estén bien configuradas**
3. **Asegúrate de que tu User ID esté correcto en la tabla perfiles**

## 📞 **¿Necesitas ayuda?**

Si tienes problemas:
1. Copia cualquier error que veas
2. Verifica que el script SQL se ejecutó completamente
3. Comprueba que puedes ver las tablas en "Table Editor" de Supabase

---

**¡Con esto tendrás una aplicación de ecommerce 100% funcional y no una simple maqueta!** 🎉