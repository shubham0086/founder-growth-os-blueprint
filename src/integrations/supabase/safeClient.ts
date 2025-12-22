import { createClient } from "@supabase/supabase-js";
import type { Database } from "./types";

const env = import.meta.env;

const SUPABASE_URL =
  env.VITE_SUPABASE_URL ??
  (env.VITE_SUPABASE_PROJECT_ID
    ? `https://${env.VITE_SUPABASE_PROJECT_ID}.supabase.co`
    : undefined);

const SUPABASE_PUBLISHABLE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL) {
  throw new Error(
    "Backend URL is missing (VITE_SUPABASE_URL). Please verify your backend connection/environment variables."
  );
}

if (!SUPABASE_PUBLISHABLE_KEY) {
  throw new Error(
    "Backend publishable key is missing (VITE_SUPABASE_PUBLISHABLE_KEY). Please verify your backend connection/environment variables."
  );
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
