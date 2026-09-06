import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase com a service_role key — ignora Row Level Security.
 *
 * Uso temporário: enquanto não há login real (Fase 7), não existe uma sessão
 * autenticada para satisfazer current_org_id() nas policies de RLS, então o
 * servidor age em nome da organização semente usando esta chave. Nunca
 * importar este arquivo em um componente de cliente ("use client") — o
 * import "server-only" acima quebra o build se isso acontecer.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "SUPABASE_SERVICE_ROLE_KEY não configurada em .env.local — pegue em Project Settings > API > service_role.",
    );
  }
  return createSupabaseClient(url, key, { auth: { persistSession: false } });
}
