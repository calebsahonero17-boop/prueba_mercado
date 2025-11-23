# 📸 GUÍA DE CONFIGURACIÓN DE STORAGE (Imágenes)

## 🎯 ¿Qué es esto?

Has implementado el sistema de **upload REAL de imágenes**. Ahora los vendedores pueden subir fotos de sus productos y las fotos se guardan permanentemente en Supabase Storage (la nube).

---

## ⚠️ CONFIGURACIÓN REQUERIDA (5 minutos)

### **PASO 1: Crear el Bucket en Supabase**

1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard/project/uqomjrkzhkxqkdzyrdke

2. En el menú lateral, click en **"Storage"**

3. Click en el botón verde **"Create a new bucket"** o **"New Bucket"**

4. Configura el bucket así:

   ```
   Name: productos
   Public bucket: ✅ YES (habilitado/checked)
   File size limit: 5242880 (5MB en bytes)
   Allowed MIME types: image/jpeg,image/jpg,image/png,image/webp
   ```

5. Click en **"Create bucket"** o **"Save"**

---

### **PASO 2: Ejecutar el Script SQL**

1. En Supabase, ve a **SQL Editor** (en el menú lateral)

2. Click en **"New query"**

3. Copia TODO el contenido del archivo: `supabase_storage_setup.sql`

4. Pega el contenido en el editor

5. Click en **"Run"** o presiona `Ctrl + Enter`

6. Deberías ver mensajes como:
   ```
   ✅ Configuración de Storage completada
   ✅ Políticas RLS: 4 configuradas
   ✅ Índices: 3 creados
   ```

---

## ✅ VERIFICAR QUE FUNCIONA

### **Prueba rápida:**

1. En tu app, ve a **"Vender"** (debes estar logueado)

2. Llena el formulario de un producto de prueba:
   - Título: "Producto de Prueba"
   - Categoría: Cualquiera
   - Precio: 100
   - Condición: Nuevo

3. Sube 1-3 fotos de prueba (cualquier imagen de tu PC)

4. Completa la descripción y ubicación

5. Click en **"Publicar Producto"**

6. Deberías ver:
   ```
   📤 Subiendo imágenes...
   💾 Guardando producto...
   ✅ ¡Producto "Producto de Prueba" publicado exitosamente!
   ```

7. Te redirige a la página de compras y **deberías ver tu producto con las fotos REALES**

---

## 🔍 VERIFICAR EN SUPABASE

### **Ver las imágenes subidas:**

1. Ve a **Storage** en Supabase

2. Click en el bucket **"productos"**

3. Deberías ver una carpeta con el ID del producto (ej: `prod_1234567_abc`)

4. Dentro de esa carpeta, están tus imágenes

5. Click en una imagen → deberías poder verla

---

### **Ver el producto en la base de datos:**

1. Ve a **Table Editor** en Supabase

2. Selecciona la tabla **"productos"**

3. Busca tu producto de prueba

4. Verifica que tenga:
   - `url_imagen`: URL completa de Supabase Storage
   - `imagenes_adicionales`: Array con URLs de todas las imágenes

---

## 🐛 SOLUCIÓN DE PROBLEMAS

### **Error: "Failed to upload image"**

**Causa:** El bucket no fue creado o no es público

**Solución:**
1. Ve a Storage en Supabase
2. Verifica que existe el bucket "productos"
3. Click en los 3 puntos del bucket → "Edit"
4. Asegúrate que "Public bucket" esté habilitado

---

### **Error: "new row violates row-level security policy"**

**Causa:** Las políticas RLS no se ejecutaron

**Solución:**
1. Ve a SQL Editor en Supabase
2. Ejecuta nuevamente el script `supabase_storage_setup.sql`
3. Verifica que no haya errores

---

### **Las imágenes se suben pero no se ven en el producto**

**Causa:** La columna `imagenes_adicionales` no existe

**Solución:**
1. Ve a SQL Editor en Supabase
2. Ejecuta:
   ```sql
   ALTER TABLE productos
   ADD COLUMN IF NOT EXISTS imagenes_adicionales TEXT[];
   ```

---

### **Error: "row is too big"**

**Causa:** Intentaste subir imágenes muy grandes

**Solución:**
- Las imágenes se comprimen automáticamente a 1200px de ancho
- Si aún falla, reduce el tamaño de las fotos antes de subirlas
- Máximo 5MB por imagen

---

## 📊 LÍMITES Y COSTOS

### **Plan Gratuito de Supabase:**

```
✅ Storage: 1 GB gratis
✅ Transferencia: 2 GB/mes gratis
✅ Estimado: ~1,250 productos con 3 fotos cada uno
```

### **Cuando necesites más:**

```
Plan Pro: $25/mes
- Storage: 100 GB
- Transferencia: 200 GB/mes
- Estimado: ~125,000 productos
```

---

## 🔒 SEGURIDAD

Las políticas configuradas aseguran que:

✅ Cualquiera puede **VER** las imágenes (son públicas)
✅ Solo usuarios **autenticados** pueden **SUBIR**
✅ Solo el **dueño** puede **ACTUALIZAR** sus imágenes
✅ Solo el **dueño** o **admins** pueden **ELIMINAR**

---

## 🛠️ COMANDOS ÚTILES

### **Ver todas las imágenes subidas:**

```sql
SELECT name, created_at, metadata->>'size' as size
FROM storage.objects
WHERE bucket_id = 'productos'
ORDER BY created_at DESC;
```

### **Ver espacio usado:**

```sql
SELECT
  bucket_id,
  COUNT(*) as total_archivos,
  pg_size_pretty(SUM((metadata->>'size')::bigint)) as espacio_usado
FROM storage.objects
WHERE bucket_id = 'productos'
GROUP BY bucket_id;
```

### **Limpiar imágenes no usadas:**

```sql
SELECT * FROM limpiar_imagenes_huerfanas();
```

---

## ✅ CHECKLIST FINAL

Antes de decir que todo funciona:

- [ ] Bucket "productos" creado en Supabase Storage
- [ ] Bucket configurado como público
- [ ] Script SQL ejecutado sin errores
- [ ] Producto de prueba publicado exitosamente
- [ ] Imágenes visibles en la página de compras
- [ ] Imágenes visibles en el bucket de Supabase
- [ ] URL de imagen guardada en la tabla productos

---

## 🎉 ¡LISTO!

Ahora tienes un sistema **REAL** de imágenes. Los vendedores pueden:

✅ Subir fotos de sus productos
✅ Las fotos se guardan permanentemente
✅ Los compradores ven las fotos reales
✅ Las URLs están en la base de datos
✅ Todo funciona como marketplace profesional

---

## 📞 AYUDA ADICIONAL

Si algo no funciona:

1. **Revisa la consola del navegador** (F12 → Console)
2. **Busca logs en rojo** que indiquen errores
3. **Verifica en Supabase** que el bucket existe
4. **Ejecuta el script SQL** nuevamente
5. **Prueba con imágenes pequeñas** primero (< 1MB)

**Los logs en consola dirán exactamente qué está pasando:**

```
📤 Subiendo imagen: foto.jpg (850.5 KB)
🔄 Comprimiendo imagen...
✅ Imagen comprimida: 320.8 KB
📁 Ruta de almacenamiento: prod_123/foto.jpg
✅ Imagen subida exitosamente
🔗 URL pública generada: https://...
```

---

¡Tu marketplace ahora es 100% funcional para vender productos reales! 🚀
