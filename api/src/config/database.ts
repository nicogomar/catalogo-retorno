import { createClient, SupabaseClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Validate environment variables
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL) {
  console.error("⚠️ SUPABASE_URL is not defined in environment variables");
}

if (!SUPABASE_ANON_KEY) {
  console.error("⚠️ SUPABASE_ANON_KEY is not defined in environment variables");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("⚠️ SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables");
}

/**
 * Supabase client with anonymous key
 * Use this for regular operations that respect RLS (Row Level Security)
 */
export const supabase: SupabaseClient = SUPABASE_URL && SUPABASE_ANON_KEY 
  ? createClient(
      SUPABASE_URL,
      SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
          detectSessionInUrl: false,
        },
      },
    )
  : null as any;

/**
 * Supabase admin client with service role key
 * Use this for operations that bypass RLS
 * ⚠️ WARNING: Use with caution - this bypasses all security rules
 */
export const supabaseAdmin: SupabaseClient = SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY
  ? createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      },
    )
  : null as any;

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    if (!supabase) {
      console.error("Database client not initialized - missing environment variables");
      return false;
    }
    
    const { error } = await supabase.from("producto").select("count").limit(1);

    if (error) {
      console.error("Database connection test failed:", error);
      return false;
    }

    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("Database connection test error:", error);
    return false;
  }
}

export default supabase;
