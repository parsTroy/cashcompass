// Supabase client for authentication and database operations
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client configured for cash-compass schema
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'cash-compass'
  }
})