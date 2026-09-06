import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";

export type SearchResults = {
  clients: { id: string; name: string; company: string | null }[];
  leads: { id: string; name: string; company: string | null }[];
  campaigns: { id: string; name: string; client_id: string; client_name: string | null }[];
};

export async function globalSearch(orgId: string, query: string): Promise<SearchResults> {
  if (!query.trim()) return { clients: [], leads: [], campaigns: [] };
  const supabase = createAdminClient();
  const pattern = `%${query}%`;

  const [clientsRes, leadsRes, campaignsRes] = await Promise.all([
    supabase.from("clients").select("id, name, company").eq("org_id", orgId).or(`name.ilike.${pattern},company.ilike.${pattern}`).limit(10),
    supabase.from("leads").select("id, name, company").eq("org_id", orgId).or(`name.ilike.${pattern},company.ilike.${pattern}`).limit(10),
    supabase.from("campaigns").select("id, name, client_id, client:client_id(name)").eq("org_id", orgId).ilike("name", pattern).limit(10),
  ]);

  return {
    clients: clientsRes.data ?? [],
    leads: leadsRes.data ?? [],
    campaigns: (campaignsRes.data ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      client_id: c.client_id,
      client_name: (c.client as unknown as { name: string } | null)?.name ?? null,
    })),
  };
}
