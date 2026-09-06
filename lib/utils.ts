import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(cents: number, currency = "BRL") {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
  }).format(cents / 100);
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(`${iso}T00:00:00`));
}

/** Converte "1.500,00" ou "1500,00" (formato pt-BR) em centavos (150000). */
export function centsFromInput(raw: string | null | undefined): number {
  if (!raw) return 0;
  const normalized = raw.trim().replace(/\./g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  if (Number.isNaN(value)) return 0;
  return Math.round(value * 100);
}

/** Formata centavos de volta para o formato de input pt-BR, ex.: 150000 -> "1500,00". */
export function centsToInputValue(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}
