import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://yokxwyfhvcolptscjltc.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlva3h3eWZodmNvbHB0c2NqbHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY2OTU4NzEsImV4cCI6MjA4MjI3MTg3MX0.rxOUUd932L2YyrwTfvm7kEA2LKPPIh4bIQnp-NYikbw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
