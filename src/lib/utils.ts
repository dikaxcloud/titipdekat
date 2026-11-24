import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatCompactCurrency(value: number) {
  if (Math.abs(value) >= 1_000_000) {
    const millions = value / 1_000_000;
    return `Rp ${millions.toFixed(millions >= 10 ? 0 : 1).replace(".", ",")} jt`;
  }
  if (Math.abs(value) >= 1_000) {
    return `Rp ${Math.round(value / 1_000)} rb`;
  }
  return formatCurrency(value);
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat("id-ID").format(value);
}

export function formatDate(value: string | Date, pattern = "d MMM yyyy") {
  return format(new Date(value), pattern, { locale: localeId });
}

export function formatDateTime(value: string | Date) {
  return format(new Date(value), "d MMM yyyy · HH:mm", { locale: localeId });
}

export function formatDateInput(value: Date = new Date()) {
  return format(value, "yyyy-MM-dd");
}

export function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function createId(prefix: string) {
  const random = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now().toString(36)}-${random}`;
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export function percentage(part: number, total: number) {
  if (total <= 0) return 0;
  return Math.round((part / total) * 100);
}

export function isoNow() {
  return new Date().toISOString();
}

export function relativeDayLabel(value: string | Date) {
  const target = new Date(value);
  const today = new Date();
  const diff = Math.floor(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
      new Date(
        target.getFullYear(),
        target.getMonth(),
        target.getDate(),
      ).getTime()) /
      86_400_000,
  );
  if (diff <= 0) return "Hari ini";
  if (diff === 1) return "Kemarin";
  return `${diff} hari lalu`;
}
