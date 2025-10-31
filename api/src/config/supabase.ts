/**
 * Supabase Configuration
 *
 * This file re-exports the supabase client from database.ts
 * to maintain backward compatibility with existing imports
 */

import supabase, { supabaseAdmin } from "./database";

export { supabase, supabaseAdmin };
export default supabase;
