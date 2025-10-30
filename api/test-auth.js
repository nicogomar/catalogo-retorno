// test-auth.js - Script to test Supabase authentication

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

// Create Supabase clients
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Test email and password (change these to match your test user)
const TEST_EMAIL = 'nico@nico.com';
const TEST_PASSWORD = 'niconico';

// Helper to print JSON responses nicely
function printResponse(label, data) {
  console.log(`\n=== ${label} ===`);
  console.log(JSON.stringify(data, null, 2));
  console.log('====================\n');
}

// Test Supabase connection and authentication
async function runTests() {
  try {
    console.log('🔍 Starting Supabase authentication tests...');

    // Step 1: Check database connection
    console.log('\n1. Testing database connection...');
    try {
      const { data, error } = await supabase.from('usuario').select('count').limit(1);
      if (error) throw error;
      console.log('✅ Database connection successful!');
    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
    }

    // Step 2: Check if user exists in Auth
    console.log('\n2. Checking if test user exists in Supabase Auth...');
    try {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers();

      if (error) {
        console.error('❌ Could not list users:', error.message);
      } else {
        const users = data.users || [];
        const foundUser = users.find(u => u.email === TEST_EMAIL);

        if (foundUser) {
          console.log(`✅ User ${TEST_EMAIL} exists in Auth:`);
          console.log(`   - User ID: ${foundUser.id}`);
          console.log(`   - Created at: ${new Date(foundUser.created_at).toLocaleString()}`);
          console.log(`   - Email confirmed: ${foundUser.email_confirmed_at ? 'Yes' : 'No'}`);
        } else {
          console.log(`❌ User ${TEST_EMAIL} NOT found in Auth`);
        }

        console.log(`   Total users in Auth: ${users.length}`);
      }
    } catch (adminError) {
      console.error('❌ Admin API error:', adminError.message);
    }

    // Step 3: Test authentication
    console.log('\n3. Testing authentication with credentials...');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: TEST_EMAIL,
        password: TEST_PASSWORD
      });

      if (error) {
        console.error('❌ Authentication failed:');
        printResponse('Auth Error', error);
      } else if (data.user && data.session) {
        console.log('✅ Authentication successful!');
        console.log(`   User: ${data.user.email}`);
        console.log(`   Session expires: ${new Date(data.session.expires_at * 1000).toLocaleString()}`);
      } else {
        console.error('❓ Unexpected auth response:');
        printResponse('Auth Response', data);
      }
    } catch (authError) {
      console.error('❌ Authentication exception:', authError.message);
    }

    // Step 4: Check database for user
    console.log('\n4. Checking user in database...');
    try {
      const { data, error } = await supabase
        .from('usuario')
        .select('*')
        .eq('correo_electronico', TEST_EMAIL)
        .single();

      if (error) {
        console.error('❌ Database user check failed:');
        printResponse('Database Error', error);
      } else if (data) {
        console.log('✅ User found in database:');
        printResponse('User Data', {
          id: data.id,
          email: data.correo_electronico,
          role: data.rol,
          created_at: data.created_at
        });
      } else {
        console.log(`❌ User ${TEST_EMAIL} not found in database`);
      }
    } catch (dbError) {
      console.error('❌ Database exception:', dbError.message);
    }

  } catch (error) {
    console.error('Unhandled exception:', error);
  }
}

// Run the tests
runTests().then(() => {
  console.log('\n🏁 Auth tests completed');
});
