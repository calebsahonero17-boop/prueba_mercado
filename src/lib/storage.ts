import { supabase } from './supabase';

/**
 * Sube un archivo a un bucket de Supabase Storage.
 * @param file El archivo a subir.
 * @param bucket El nombre del bucket de destino.
 * @param path La ruta y nombre del archivo dentro del bucket (ej. 'public/avatar.png').
 * @returns La ruta (path) del archivo subido.
 */
export async function subirArchivo(file: File, bucket: string, path: string): Promise<string> {
  try {
    console.log(`📤 Subiendo archivo: ${file.name} a bucket '${bucket}' en la ruta '${path}'`);

    const { data, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(path, file, { 
        cacheControl: '3600',
        upsert: true // Sobrescribe el archivo si ya existe
      });

    if (uploadError) {
      console.error('❌ Error subiendo archivo:', uploadError);
      throw new Error(`Error al subir el archivo: ${uploadError.message}`);
    }

    console.log('✅ Archivo subido exitosamente.');

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    if (!urlData.publicUrl) {
      throw new Error('No se pudo obtener la URL pública del archivo.');
    }

    console.log('🔗 URL pública generada para la base de datos:', urlData.publicUrl);
    return urlData.publicUrl;

  } catch (error) {
    console.error('❌ Error en la función subirArchivo:', error);
    throw error;
  }
}


/**
 * Utilidades para manejo de almacenamiento de imágenes en Supabase Storage
 */

// Configuración
const BUCKET_NAME = 'productos';


const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
/**
 * Valida que un archivo sea una imagen válida
 */
export function validarImagen(file: File): { valido: boolean; error?: string } {
  // Validar que sea un tipo de imagen (cualquiera)
  if (!file.type.startsWith('image/')) {
    return {
      valido: false,
      error: 'El archivo debe ser una imagen'
    };
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    return {
      valido: false,
      error: `La imagen debe pesar menos de ${MAX_FILE_SIZE / 1024 / 1024}MB`
    };
  }

  return { valido: true };
}

/**
 * Comprime una imagen antes de subirla
 */
export async function comprimirImagen(file: File, maxWidth: number = 1200): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Crear canvas para redimensionar
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Redimensionar si es muy grande
        if (width > maxWidth) {
          height = (height / width) * maxWidth;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear contexto de canvas'));
          return;
        }

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Convertir a blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al comprimir imagen'));
              return;
            }

            // Crear nuevo archivo con el blob comprimido
            const compressedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });

            resolve(compressedFile);
          },
          file.type,
          0.85 // Calidad 85%
        );
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Error al leer el archivo'));
    reader.readAsDataURL(file);
  });
}

/**
 * Sube una imagen a Supabase Storage
 */
export async function subirImagen(
  file: File,
  productoId: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; path: string } | null> {
  try {
    // Validar imagen
    const validacion = validarImagen(file);
    if (!validacion.valido) {
      throw new Error(validacion.error);
    }

    console.log(`📤 Subiendo imagen: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`);
    console.log(`🆔 Producto ID: ${productoId}`);

    // Comprimir imagen
    console.log('🔄 Comprimiendo imagen...');
    const tiempoInicioCompresion = Date.now();
    const imagenComprimida = await comprimirImagen(file);
    const tiempoCompresion = Date.now() - tiempoInicioCompresion;
    console.log(`✅ Imagen comprimida en ${tiempoCompresion}ms: ${(imagenComprimida.size / 1024).toFixed(1)} KB`);

    // Generar nombre único para el archivo
    const timestamp = Date.now();
    const nombreLimpio = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const nombreArchivo = `${timestamp}_${nombreLimpio}`;
    const rutaArchivo = `${productoId}/${nombreArchivo}`;

    console.log(`📁 Ruta de almacenamiento: ${rutaArchivo}`);

    // Simular progreso inicial
    if (onProgress) onProgress(10);

    // Subir a Supabase Storage con reintentos
    console.log(`🔄 Iniciando upload a bucket: ${BUCKET_NAME}`);
    console.log(`⏱️ Timeout máximo: 60 segundos`);
    console.log(`🔁 Reintentos disponibles: 3`);

    let data: any = null;
    let error: any = null;
    const maxIntentos = 3;

    // Intentar upload hasta 3 veces
    for (let intento = 1; intento <= maxIntentos; intento++) {
      if (intento > 1) {
        console.log(`🔁 Intento ${intento} de ${maxIntentos}...`);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Esperar 1 segundo entre intentos
      }

      try {
        // Crear promise con timeout de 60 segundos
        const uploadPromise = supabase.storage
          .from(BUCKET_NAME)
          .upload(rutaArchivo, imagenComprimida, {
            cacheControl: '3600',
            upsert: true // Cambiar a true para permitir reintentos
          });

        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Timeout de 60 segundos'));
          }, 60000);
        });

        const resultado = await Promise.race([uploadPromise, timeoutPromise]);
        data = resultado.data;
        error = resultado.error;

        // Si funcionó, salir del loop
        if (!error && data) {
          console.log(`✅ Upload exitoso en intento ${intento}`);
          break;
        }

      } catch (err: any) {
        error = err;
        console.warn(`⚠️ Intento ${intento} falló:`, err.message);

        // Si es el último intento, lanzar el error
        if (intento === maxIntentos) {
          throw err;
        }
      }
    }

    if (error) {
      console.error('❌ Error subiendo imagen:', error);
      console.error('❌ Código de error:', error.message);
      console.error('❌ Detalles completos:', JSON.stringify(error, null, 2));

      // Errores comunes con soluciones
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        throw new Error(`El bucket '${BUCKET_NAME}' no existe. Ve a Supabase Storage y créalo.`);
      } else if (error.message.includes('permission') || error.message.includes('policy')) {
        throw new Error(`No tienes permisos para subir. Ejecuta el script SQL: supabase_storage_setup.sql`);
      } else if (error.message.includes('size') || error.message.includes('large')) {
        throw new Error(`La imagen es muy grande. Máximo ${MAX_FILE_SIZE / 1024 / 1024}MB`);
      }

      throw new Error(`Error al subir la imagen: ${error.message}`);
    }

    if (onProgress) onProgress(80);

    console.log('✅ Imagen subida exitosamente:', data.path);

    // Obtener URL pública
    const { data: urlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(data.path);

    if (onProgress) onProgress(100);

    console.log('🔗 URL pública generada:', urlData.publicUrl);

    return {
      url: urlData.publicUrl,
      path: data.path
    };

  } catch (error) {
    console.error('❌ Error en subirImagen:', error);
    throw error;
  }
}

/**
 * Sube múltiples imágenes
 */
export async function subirImagenes(
  files: File[],
  productoId: string,
  onProgress?: (imagenActual: number, total: number, progresoImagen: number) => void
): Promise<string[]> {
  const urls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    console.log(`📸 Procesando imagen ${i + 1} de ${files.length}`);

    const resultado = await subirImagen(
      file,
      productoId,
      (progreso) => {
        if (onProgress) {
          onProgress(i + 1, files.length, progreso);
        }
      }
    );

    if (resultado) {
      urls.push(resultado.url);
    }
  }

  console.log(`✅ ${urls.length} imágenes subidas exitosamente`);
  return urls;
}

/**
 * Elimina una imagen de Supabase Storage
 */
export async function eliminarImagen(path: string): Promise<boolean> {
  try {
    console.log(`🗑️ Eliminando imagen: ${path}`);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([path]);

    if (error) {
      console.error('❌ Error eliminando imagen:', error);
      return false;
    }

    console.log('✅ Imagen eliminada exitosamente');
    return true;

  } catch (error) {
    console.error('❌ Error en eliminarImagen:', error);
    return false;
  }
}

/**
 * Elimina todas las imágenes de un producto
 */
export async function eliminarImagenesProducto(productoId: string): Promise<boolean> {
  try {
    console.log(`🗑️ Eliminando todas las imágenes del producto: ${productoId}`);

    // Listar archivos en la carpeta del producto
    const { data: archivos, error: errorListar } = await supabase.storage
      .from(BUCKET_NAME)
      .list(productoId);

    if (errorListar) {
      console.error('❌ Error listando archivos:', errorListar);
      return false;
    }

    if (!archivos || archivos.length === 0) {
      console.log('ℹ️ No hay imágenes para eliminar');
      return true;
    }

    // Eliminar todos los archivos
    const rutasEliminar = archivos.map(archivo => `${productoId}/${archivo.name}`);

    const { error: errorEliminar } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(rutasEliminar);

    if (errorEliminar) {
      console.error('❌ Error eliminando archivos:', errorEliminar);
      return false;
    }

    console.log(`✅ ${archivos.length} imágenes eliminadas exitosamente`);
    return true;

  } catch (error) {
    console.error('❌ Error en eliminarImagenesProducto:', error);
    return false;
  }
}

/**
 * Obtiene la URL de una imagen desde su path
 */
export function obtenerUrlPublica(path: string): string {
  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(path);

  return data.publicUrl;
}
