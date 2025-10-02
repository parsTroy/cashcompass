// Supabase client for authentication only
// Database operations are now handled by Prisma
import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Supabase client for authentication
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  db: {
    schema: 'cash-compass'
  }
})

// Re-export Prisma client for database operations
export { prisma } from '@/lib/prisma'