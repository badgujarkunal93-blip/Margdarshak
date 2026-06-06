import { createClient } from '@supabase/supabase-js'

const rawUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseUrl = rawUrl
  .replace(/\/rest\/v1\/?$/i, '')
  .replace(/\/+$/g, '')

export const supabase = createClient(
  supabaseUrl,
  import.meta.env.VITE_SUPABASE_ANON_KEY
)
