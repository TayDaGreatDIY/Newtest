import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn if credentials are missing
if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'Missing Supabase environment variables. ' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file. ' +
    'The app will not function correctly without these credentials.'
  );
}

// Create client with fallback values to prevent app from crashing
// Use valid URL format to satisfy createClient requirements
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key-replace-with-real-key'
);

export type Profile = {
  id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
};
