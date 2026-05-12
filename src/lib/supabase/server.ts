import { createClient } from '@supabase/supabase-js';

// Usar service_role key en server para evitar problemas de RLS (sin auth aún)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
