// check-schema.js - Script to check the database schema
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Check environment variables
if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase environment variables!');
  console.log('SUPABASE_URL:', SUPABASE_URL ? 'Set ✓' : 'Missing ✗');
  console.log('SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? 'Set ✓' : 'Missing ✗');
  console.log('SUPABASE_SERVICE_ROLE_KEY:', SUPABASE_SERVICE_ROLE_KEY ? 'Set ✓' : 'Missing ✗');
  process.exit(1);
}

// Create Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Inspect table schema
async function inspectTableSchema(tableName) {
  console.log(`\n📊 Inspecting schema for table: ${tableName}`);

  try {
    // First try getting a row to see column names
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);

    if (error) {
      console.error(`❌ Error fetching ${tableName} data:`, error.message);
      return;
    }

    if (!data || data.length === 0) {
      console.log(`ℹ️ No data in ${tableName} table to inspect columns`);
    } else {
      console.log(`\n✅ Column names in ${tableName} table:`);
      const columns = Object.keys(data[0]);
      columns.forEach(col => console.log(`   - ${col}`));
    }

    // Now try getting the table definition
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('get_table_definition', { table_name: tableName })
      .single();

    if (tableError) {
      if (tableError.message.includes('function') && tableError.message.includes('does not exist')) {
        console.log('\nℹ️ Function get_table_definition not available in this database');

        // Fallback - execute raw SQL (only works with service role)
        try {
          const { data: columnsData, error: columnsError } = await supabase
            .rpc('execute_sql', {
              query: `SELECT column_name, data_type, is_nullable
                     FROM information_schema.columns
                     WHERE table_name = '${tableName}'
                     ORDER BY ordinal_position;`
            });

          if (columnsError) {
            if (columnsError.message.includes('function') && columnsError.message.includes('does not exist')) {
              console.log('ℹ️ Function execute_sql not available in this database');
            } else {
              console.error('❌ SQL Error:', columnsError.message);
            }
          } else if (columnsData) {
            console.log('\n✅ Detailed column information:');
            columnsData.forEach(row => {
              console.log(`   - ${row[0]} (${row[1]}, ${row[2] === 'YES' ? 'nullable' : 'not nullable'})`);
            });
          }
        } catch (sqlError) {
          console.error('❌ Error executing SQL:', sqlError);
        }
      } else {
        console.error('❌ Error fetching table definition:', tableError.message);
      }
    } else if (tableInfo) {
      console.log('\n✅ Table definition:');
      console.log(tableInfo.definition);
    }

    // Count rows
    const { count, error: countError } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error(`❌ Error counting rows in ${tableName}:`, countError.message);
    } else {
      console.log(`\nℹ️ Total rows in ${tableName}: ${count || 0}`);
    }

  } catch (error) {
    console.error(`❌ Unexpected error inspecting ${tableName}:`, error);
  }
}

// Diagnose auth database
async function diagnoseAuth() {
  console.log('\n🔍 Checking Supabase Auth...');

  try {
    // Check if auth API is working
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError) {
      console.error('❌ Auth API error:', authError.message);
    } else {
      console.log('✅ Auth API is working');
    }

    // List users (requires service role)
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.error('❌ Admin API error:', error.message);
    } else {
      const users = data.users || [];
      console.log(`✅ Auth contains ${users.length} users`);

      if (users.length > 0) {
        console.log('\n📋 First few users:');
        users.slice(0, 3).forEach(user => {
          console.log(`   - ID: ${user.id}`);
          console.log(`     Email: ${user.email}`);
          console.log(`     Created: ${new Date(user.created_at).toLocaleString()}`);
          console.log(`     Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
          console.log('     ----------');
        });
      }
    }
  } catch (error) {
    console.error('❌ Unexpected error diagnosing auth:', error);
  }
}

// Find matching user in both Auth and DB
async function findMatchingUsers() {
  console.log('\n🔍 Looking for matching users between Auth and DB...');

  try {
    // Get auth users
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.error('❌ Could not list auth users:', authError.message);
      return;
    }

    const authUsers = authData.users || [];

    // Get DB users from usuario table
    const { data: dbUsers, error: dbError } = await supabase
      .from('usuario')
      .select('*');

    if (dbError) {
      console.error('❌ Could not fetch users from DB:', dbError.message);
      return;
    }

    console.log(`✅ Auth users: ${authUsers.length}`);
    console.log(`✅ DB users: ${dbUsers.length}`);

    // Try to find matching users
    console.log('\n📋 Matching attempts:');

    for (const authUser of authUsers) {
      console.log(`\nAuth user: ${authUser.email}`);

      // Try common email field names
      const possibleEmailFields = ['email', 'correo_electronico', 'correo', 'mail'];

      for (const field of possibleEmailFields) {
        if (dbUsers.length > 0 && dbUsers[0][field] !== undefined) {
          const match = dbUsers.find(u => u[field] === authUser.email);
          console.log(`  Field '${field}': ${match ? '✅ MATCH FOUND' : '❌ No match'}`);

          if (match) {
            console.log('  Matched DB user:');
            console.log('  ---------------');
            Object.entries(match).forEach(([key, value]) => {
              console.log(`  ${key}: ${value}`);
            });
            break;
          }
        } else {
          console.log(`  Field '${field}': ❓ Not present in DB`);
        }
      }
    }

  } catch (error) {
    console.error('❌ Unexpected error finding matching users:', error);
  }
}

// Main function
async function main() {
  console.log('🔍 Starting database schema inspection...');

  try {
    // First check usuario table
    await inspectTableSchema('usuario');

    // Check other tables
    await inspectTableSchema('producto');
    await inspectTableSchema('pedido');

    // Check auth
    await diagnoseAuth();

    // Find matching users
    await findMatchingUsers();

  } catch (error) {
    console.error('Fatal error:', error);
  } finally {
    console.log('\n🏁 Schema inspection completed');
  }
}

// Run the main function
main();
