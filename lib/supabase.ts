import { createClient } from '@supabase/supabase-js'

// Create a single supabase client for interacting with your database
const supabaseUrl = 'https://qwpeoezwynmytixmjjeb.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3cGVvZXp3eW5teXRpeG1qamViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODMyMTQsImV4cCI6MjA1Njc1OTIxNH0.5hfJK2wQsMAxfVURFDpNGM_V0e9uav9Kpn7A26LMqfM'
export const supabase = createClient(supabaseUrl, supabaseAnonKey)
