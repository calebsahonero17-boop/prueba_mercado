import { supabase } from './supabase';

/**
 * Función para probar que el Storage está configurado correctamente
 */
export async function probarStorage() {
  console.log('🧪 INICIANDO PRUEBA DE STORAGE...');
  console.log('='.repeat(50));

  // 1. Verificar que existe el bucket
  console.log('\n📦 Paso 1: Verificando bucket "productos"...');
  try {
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();

    if (bucketsError) {
      console.error('❌ Error listando buckets:', bucketsError);
      console.error('❌ Error completo:', JSON.stringify(bucketsError, null, 2));
      return false;
    }

    console.log('📋 Total de buckets:', buckets?.length || 0);
    console.log('📋 Buckets disponibles:', buckets?.map(b => b.name).join(', ') || 'ninguno');
    console.log('📋 Detalles de buckets:', JSON.stringify(buckets, null, 2));

    const bucketProductos = buckets?.find(b => b.name === 'productos');

    if (!bucketProductos) {
      console.error('❌ El bucket "productos" NO SE ENCONTRÓ en la lista');
      console.log('⚠️ Pero tú dices que SÍ existe en el dashboard...');
      console.log('💡 Esto puede ser un problema de permisos de la API');
      console.log('💡 Intentando acceso directo al bucket...');

      // Intentar acceso directo
      const { data: testList, error: testError } = await supabase.storage
        .from('productos')
        .list('', { limit: 1 });

      if (testError) {
        console.error('❌ Error accediendo directamente al bucket:', testError);
        console.error('❌ Mensaje:', testError.message);
        return false;
      } else {
        console.log('✅ ¡Acceso directo al bucket funciona!');
        console.log('✅ El bucket existe pero listBuckets() no lo muestra');
        console.log('✅ Esto es normal, continuando con las pruebas...');
      }
    } else {
      console.log('✅ Bucket "productos" encontrado vía listBuckets()');
      console.log('📊 Configuración:', {
        public: bucketProductos.public,
        id: bucketProductos.id,
        created_at: bucketProductos.created_at
      });
    }

  } catch (error) {
    console.error('❌ Error verificando buckets:', error);
    return false;
  }

  // 2. Verificar permisos de lectura
  console.log('\n🔍 Paso 2: Verificando permisos de lectura...');
  try {
    const { data: archivos, error: listError } = await supabase.storage
      .from('productos')
      .list('', { limit: 1 });

    if (listError) {
      console.error('❌ Error listando archivos:', listError);
      console.log('💡 Esto puede significar que las políticas RLS no están configuradas');
      return false;
    }

    console.log('✅ Permisos de lectura: OK');
    console.log(`📁 Archivos en bucket: ${archivos?.length || 0}`);

  } catch (error) {
    console.error('❌ Error verificando lectura:', error);
    return false;
  }

  // 3. Verificar permisos de escritura (intento de upload)
  console.log('\n✍️ Paso 3: Verificando permisos de escritura...');
  try {
    // Crear un archivo de prueba pequeño
    const testBlob = new Blob(['test'], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt');

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('productos')
      .upload(`test/test_${Date.now()}.txt`, testFile, {
        upsert: true
      });

    if (uploadError) {
      console.error('❌ Error subiendo archivo de prueba:', uploadError);
      console.log('💡 Solución: Ejecuta el script SQL: supabase_storage_setup.sql');
      return false;
    }

    console.log('✅ Permisos de escritura: OK');
    console.log('✅ Archivo de prueba subido:', uploadData.path);

    // Limpiar archivo de prueba
    await supabase.storage.from('productos').remove([uploadData.path]);
    console.log('🧹 Archivo de prueba eliminado');

  } catch (error) {
    console.error('❌ Error verificando escritura:', error);
    return false;
  }

  console.log('\n' + '='.repeat(50));
  console.log('✅ TODAS LAS PRUEBAS PASARON');
  console.log('🎉 El Storage está configurado correctamente');
  console.log('='.repeat(50));

  return true;
}

/**
 * Función helper para ejecutar desde consola del navegador
 */
(window as any).probarStorage = probarStorage;

console.log('💡 TIP: Ejecuta probarStorage() en la consola para verificar el Storage');
