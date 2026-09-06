import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para uso em Server Components / Server Actions.
 * Propaga a sessão via cookies — passo a passo oficial do @supabase/ssr.
 * Ainda não é chamado por nenhuma tela (ver lib/session.ts para a sessão
 * semente atual); entra em uso na Fase 1.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // chamado a partir de um Server Component sem permissão de escrita;
            // middleware cuida do refresh de sessão quando isso acontecer.
          }
        },
      },
    },
  );
}
