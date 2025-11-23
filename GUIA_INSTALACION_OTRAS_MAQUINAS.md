# 🚀 GUÍA PARA INSTALAR Y EJECUTAR EN OTRA MÁQUINA

## 📋 REQUISITOS PREVIOS

### 1. **Software necesario:**
- ✅ **Node.js** (versión 16 o superior) - [nodejs.org](https://nodejs.org/)
- ✅ **npm** (viene con Node.js)
- ✅ **Git** (opcional, pero recomendado) - [git-scm.com](https://git-scm.com/)

### 2. **Verificar instalación:**
```bash
node --version    # Debería mostrar v16.x.x o superior
npm --version     # Debería mostrar 8.x.x o superior
```

---

## 📁 PASOS DE INSTALACIÓN

### 1. **Copiar el proyecto**
Tienes varias opciones:

**Opción A: Copiar carpeta completa**
- Copia toda la carpeta del proyecto a la nueva máquina
- Asegúrate de incluir la carpeta `.env` y `node_modules` (si existe)

**Opción B: Solo código fuente**
- Copia solo el código (sin `node_modules`)
- Tendrás que instalar dependencias después

### 2. **Abrir terminal en la carpeta del proyecto**
```bash
cd ruta/al/proyecto
```

### 3. **Instalar dependencias**
```bash
npm install
```
Este comando descargará todas las librerías necesarias.

---

## 🔧 CONFIGURACIÓN CRUCIAL

### **🔑 Archivo .env (MUY IMPORTANTE)**

Este archivo contiene las credenciales de Supabase. Debe estar en la raíz del proyecto:

**Archivo: `.env`**
```env
# Supabase Configuration
VITE_SUPABASE_URL=https://uqomjrkzhkxqkdzyrdke.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVxb21qcmt6aGt4cWtkenlyZGtlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg0OTQ5NjUsImV4cCI6MjA3NDA3MDk2NX0.8JehnPDgT3R2959laU2P3feYaehZdEqc6RyaSahZIjI
```

**⚠️ IMPORTANTE:**
- Sin este archivo, la aplicación NO funcionará
- Las credenciales deben ser exactamente las mismas
- El archivo debe llamarse exactamente `.env`

---

## 🚀 EJECUTAR LA APLICACIÓN

### **Modo desarrollo:**
```bash
npm run dev
```

### **Construir para producción:**
```bash
npm run build
```

### **Vista previa de producción:**
```bash
npm run preview
```

---

## 🌐 ACCEDER A LA APLICACIÓN

Una vez ejecutado `npm run dev`, verás algo como:
```
Local:   http://localhost:5173/
Network: http://192.168.x.x:5173/
```

Abre el navegador en esa dirección.

---

## ✅ VERIFICACIÓN DE FUNCIONAMIENTO

### **1. Página principal carga correctamente**
- ✅ Se ven productos
- ✅ Logo se muestra
- ✅ No hay errores en la consola del navegador

### **2. Login funciona**
- ✅ Puedes hacer login con: `demo@mercadoexpress.bo` / `demo123`
- ✅ Puedes registrarte con un email nuevo

### **3. Productos cargan**
- ✅ En "Comprar" se ven los productos reales
- ✅ Puedes filtrar por categorías
- ✅ Puedes agregar al carrito

### **4. Perfil funciona**
- ✅ Puedes ver tu perfil personal
- ✅ Perfil de vendedor carga (aunque sea vacío)

---

## 🛠️ SOLUCIÓN DE PROBLEMAS COMUNES

### **❌ Error: "Missing Supabase environment variables"**
**Solución:** Falta el archivo `.env` o está mal configurado
- Verifica que existe el archivo `.env` en la raíz
- Verifica que contiene las variables correctas

### **❌ Error: "npm command not found"**
**Solución:** Node.js no está instalado
- Instala Node.js desde [nodejs.org](https://nodejs.org/)
- Reinicia la terminal después de instalar

### **❌ Error: "Module not found"**
**Solución:** Dependencias no están instaladas
```bash
rm -rf node_modules
npm install
```

### **❌ La página carga pero no hay productos**
**Solución:** Problema con Supabase
- Verifica que el archivo `.env` tenga las credenciales correctas
- Revisa la consola del navegador (F12) para errores

### **❌ Error al hacer build**
**Solución:**
```bash
npm run build
```
Si hay errores, léelos cuidadosamente y corrígelos.

---

## 📝 ESTRUCTURA DE ARCHIVOS IMPORTANTES

```
proyecto/
├── .env                    ← ¡MUY IMPORTANTE!
├── package.json            ← Dependencias
├── package-lock.json       ← Versiones exactas
├── src/
│   ├── components/         ← Componentes React
│   ├── pages/              ← Páginas
│   ├── lib/                ← Configuración Supabase
│   └── ...
├── public/
│   ├── logito-footer.png   ← Tu logo personalizado
│   └── ...
└── dist/                   ← Archivos de producción (después de build)
```

---

## 🔒 SEGURIDAD

### **Variables de entorno:**
- Las credenciales en `.env` son públicas (lado cliente)
- No contienen información ultra-secreta
- Son necesarias para conectar a Supabase

### **Base de datos:**
- La misma base de datos Supabase se usará desde cualquier máquina
- Los datos son compartidos entre todas las instalaciones

---

## 🚨 CHECKLIST FINAL

Antes de decir que funciona:

- [ ] Node.js instalado (verificado con `node --version`)
- [ ] Proyecto copiado completamente
- [ ] Archivo `.env` presente y correcto
- [ ] Dependencias instaladas (`npm install`)
- [ ] Aplicación ejecuta sin errores (`npm run dev`)
- [ ] Página principal carga
- [ ] Login demo funciona
- [ ] Productos se ven en "Comprar"
- [ ] No hay errores en consola del navegador (F12)

---

## 📞 AYUDA ADICIONAL

**Si algo no funciona:**
1. **Revisa la consola** del navegador (F12 → Console)
2. **Revisa la terminal** donde ejecutaste `npm run dev`
3. **Verifica el archivo .env** caracter por caracter
4. **Compara versiones** de Node.js

**Comandos útiles para debug:**
```bash
# Ver versión de Node
node --version

# Ver versión de npm
npm --version

# Limpiar cache de npm
npm cache clean --force

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install
```

---

## 🎉 ¡SUCCESS!

Si sigues esta guía paso a paso, tu aplicación debería funcionar perfectamente en cualquier máquina con las mismas funcionalidades:

- ✅ Sistema completo de ecommerce
- ✅ 17 productos reales
- ✅ Carrito de compras
- ✅ Sistema de usuarios
- ✅ Perfil de vendedor
- ✅ Conexión a Supabase

¡Tu aplicación está lista para ser compartida y usada en cualquier lugar! 🚀