import { supabase } from './supabase';

/**
 * Test de upload directo sin verificar listBuckets
 */
export async function testUploadDirecto() {
  console.log('🧪 TEST DE UPLOAD DIRECTO');
  console.log('='.repeat(50));

  try {
    // Crear un archivo de prueba pequeño
    console.log('📝 Creando archivo de prueba...');
    const testContent = 'Test de upload - ' + new Date().toISOString();
    const testBlob = new Blob([testContent], { type: 'text/plain' });
    const testFile = new File([testBlob], 'test.txt');

    const rutaPrueba = `test/upload_test_${Date.now()}.txt`;
    console.log('📁 Ruta de prueba:', rutaPrueba);

    // Intentar upload directo
    console.log('📤 Intentando upload...');
    const startTime = Date.now();

    const { data, error } = await supabase.storage
      .from('productos')
      .upload(rutaPrueba, testFile, {
        cacheControl: '3600',
        upsert: true
      });

    const uploadTime = Date.now() - startTime;
    console.log(`⏱️ Tiempo de upload: ${uploadTime}ms`);

    if (error) {
      console.error('❌ ERROR EN UPLOAD:', error);
      console.error('❌ Mensaje:', error.message);
      console.error('❌ Detalles:', JSON.stringify(error, null, 2));

      // Diagnóstico del error
      if (error.message.includes('not found') || error.message.includes('does not exist')) {
        console.log('💡 El bucket NO existe o tiene otro nombre');
        console.log('💡 Verifica en Supabase que se llame exactamente "productos"');
      } else if (error.message.includes('permission') || error.message.includes('policy')) {
        console.log('💡 Problema de permisos RLS');
        console.log('💡 Ejecuta el script: supabase_storage_setup.sql');
      } else if (error.message.includes('public')) {
        console.log('💡 El bucket no es público');
        console.log('💡 Ve a Supabase Storage → Edit bucket → Public: YES');
      }

      return false;
    }

    console.log('✅ UPLOAD EXITOSO!');
    console.log('📦 Path:', data.path);
    console.log('🆔 ID:', data.id);

    // Obtener URL pública
    console.log('\n🔗 Obteniendo URL pública...');
    const { data: urlData } = supabase.storage
      .from('productos')
      .getPublicUrl(data.path);

    console.log('✅ URL pública:', urlData.publicUrl);

    // Intentar leer el archivo
    console.log('\n📖 Intentando leer el archivo...');
    const { data: downloadData, error: downloadError } = await supabase.storage
      .from('productos')
      .download(data.path);

    if (downloadError) {
      console.error('❌ Error descargando:', downloadError);
    } else {
      console.log('✅ Archivo descargado correctamente');
      const text = await downloadData.text();
      console.log('📄 Contenido:', text);
    }

    // Limpiar
    console.log('\n🧹 Limpiando archivo de prueba...');
    await supabase.storage.from('productos').remove([data.path]);
    console.log('✅ Archivo eliminado');

    console.log('\n' + '='.repeat(50));
    console.log('✅ TODAS LAS PRUEBAS PASARON');
    console.log('🎉 El sistema de Storage funciona correctamente');
    console.log('='.repeat(50));

    return true;

  } catch (error: any) {
    console.error('❌ ERROR CRÍTICO:', error);
    console.error('❌ Stack:', error.stack);
    return false;
  }
}

// Hacer disponible globalmente
(window as any).testUploadDirecto = testUploadDirecto;

console.log('💡 Ejecuta testUploadDirecto() para probar el upload directo');
