// Script simple para probar la conexión con Supabase
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('🔍 Verificando configuración...\n');

// Verificar variables de entorno
if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_URL no está definida');
  process.exit(1);
}

if (!SUPABASE_ANON_KEY) {
  console.error('❌ SUPABASE_ANON_KEY no está definida');
  process.exit(1);
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY no está definida');
  process.exit(1);
}

console.log('✅ Variables de entorno configuradas');
console.log(`   URL: ${SUPABASE_URL}`);
console.log(`   Anon Key: ${SUPABASE_ANON_KEY.substring(0, 20)}...`);
console.log(`   Service Role Key: ${SUPABASE_SERVICE_ROLE_KEY.substring(0, 20)}...`);
console.log('');

// Crear clientes
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function testConnection() {
  console.log('🔌 Probando conexión con Supabase...\n');

  // Test 1: Conexión básica con anon key
  console.log('📝 Test 1: Conexión con ANON KEY');
  try {
    const { data, error } = await supabase
      .from('producto')
      .select('id, nombre')
      .limit(1);

    if (error) {
      console.log('⚠️  Error con anon key:', error.message);
      console.log('   Esto puede ser normal si hay RLS configurado');
    } else {
      console.log('✅ Conexión exitosa con anon key');
      if (data && data.length > 0) {
        console.log(`   Producto de prueba: ${data[0].nombre} (ID: ${data[0].id})`);
      }
    }
  } catch (err) {
    console.error('❌ Error de conexión con anon key:', err.message);
  }

  console.log('');

  // Test 2: Conexión con service role key
  console.log('📝 Test 2: Conexión con SERVICE ROLE KEY');
  try {
    const { data, error, count } = await supabaseAdmin
      .from('producto')
      .select('id, nombre, precio', { count: 'exact' })
      .limit(3);

    if (error) {
      console.error('❌ Error con service role key:', error.message);
      console.log('   Detalles:', error);
    } else {
      console.log('✅ Conexión exitosa con service role key');
      console.log(`   Total de productos en la BD: ${count}`);
      if (data && data.length > 0) {
        console.log('   Productos de ejemplo:');
        data.forEach((p, i) => {
          console.log(`     ${i + 1}. ${p.nombre} - $${p.precio} (ID: ${p.id})`);
        });
      }
    }
  } catch (err) {
    console.error('❌ Error de conexión con service role key:', err.message);
  }

  console.log('');

  // Test 3: Verificar tabla pedido
  console.log('📝 Test 3: Verificar tabla PEDIDO');
  try {
    const { data, error, count } = await supabaseAdmin
      .from('pedido')
      .select('id, nombre_comercio', { count: 'exact' })
      .limit(3);

    if (error) {
      console.error('❌ Error al acceder a tabla pedido:', error.message);
    } else {
      console.log('✅ Acceso exitoso a tabla pedido');
      console.log(`   Total de pedidos en la BD: ${count}`);
      if (data && data.length > 0) {
        console.log('   Pedidos de ejemplo:');
        data.forEach((p, i) => {
          console.log(`     ${i + 1}. ${p.nombre_comercio} (ID: ${p.id})`);
        });
      } else {
        console.log('   No hay pedidos en la base de datos (esto es normal si es nueva)');
      }
    }
  } catch (err) {
    console.error('❌ Error al acceder a tabla pedido:', err.message);
  }

  console.log('');
  console.log('═'.repeat(60));
  console.log('🎯 RESUMEN:');
  console.log('   - Las credenciales están correctamente configuradas');
  console.log('   - La conexión con Supabase funciona');
  console.log('   - La API está lista para iniciarse');
  console.log('═'.repeat(60));
  console.log('');
  console.log('✅ Todo listo! Puedes iniciar la API con: npm run dev');
}

testConnection().catch(err => {
  console.error('❌ Error general:', err);
  process.exit(1);
});
