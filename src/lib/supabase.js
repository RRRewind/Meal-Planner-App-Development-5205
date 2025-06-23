import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://labsvtcxahdfzeqmnnyz.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxhYnN2dGN4YWhkZnplcW1ubnl6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3MTI5NDgsImV4cCI6MjA2NjI4ODk0OH0.hO7vRL-l_p9NRSxEp3fefp5HKBUIFekg1gsjaMPQDeA'

// Validate credentials
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing Supabase credentials')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Simple connection test
console.log('🔗 Supabase client initialized')

export default supabase