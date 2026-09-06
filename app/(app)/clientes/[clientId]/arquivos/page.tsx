import { Paperclip } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";

export default function ClienteArquivosPage() {
  return (
    <EmptyState
      icon={Paperclip}
      title="Arquivos e links ainda não implementados"
      description="Upload de contratos, comprovantes e links importantes (via Supabase Storage) chega na Fase 6."
      phase="Fase 6 · Fechamento do MVP"
    />
  );
}
