import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

// Fallbacks to prevent blank-screen crashes if VITE_* env injection fails.
// (These values are publishable and safe to ship.)
const FALLBACK_PROJECT_ID = "rodhcrqwunhzgxcopcqk";
const FALLBACK_URL = `https://${FALLBACK_PROJECT_ID}.supabase.co`;
const FALLBACK_PUBLISHABLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJvZGhjcnF3dW5oemd4Y29wY3FrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA1MDEwNzMsImV4cCI6MjA3NjA3NzA3M30.oAxbzh0ZHBV48DyBUQKX9EX09UOeV4J1tmsboEZnKAg";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || FALLBACK_URL;
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || FALLBACK_PUBLISHABLE_KEY;

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
