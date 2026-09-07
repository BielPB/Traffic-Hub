"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="flex h-10 items-center gap-2 rounded-lg bg-gradient-to-r from-purple to-blue px-4 text-sm font-semibold text-white print:hidden"
    >
      <Printer className="size-4" /> Imprimir / Salvar PDF
    </button>
  );
}
