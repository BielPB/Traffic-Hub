import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para uso em componentes de cliente ("use client").
 * Ainda não é chamado por nenhuma tela — entra em uso na Fase 1, quando os
 * módulos de Clientes/Financeiro passam a ler e escrever no Postgres.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
