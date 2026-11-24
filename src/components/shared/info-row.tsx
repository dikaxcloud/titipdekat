import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface InfoRowProps {
  label: string;
  value: ReactNode;
  className?: string;
  valueClassName?: string;
}

export function InfoRow({
  label,
  value,
  className,
  valueClassName,
}: InfoRowProps) {
  return (
    <div className={cn("flex items-start justify-between gap-4 text-xs", className)}>
      <span className="shrink-0 text-muted">{label}</span>
      <span className={cn("text-right font-semibold text-ink", valueClassName)}>
        {value}
      </span>
    </div>
  );
}

interface SummaryBoxProps {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "brand" | "emerald" | "amber" | "blue";
  className?: string;
}

const tones: Record<NonNullable<SummaryBoxProps["tone"]>, string> = {
  default: "border-line bg-mist/60 text-ink",
  brand: "border-brand-100 bg-brand-50/70 text-brand-900",
  emerald: "border-emerald-100 bg-emerald-50/70 text-emerald-900",
  amber: "border-amber-100 bg-amber-50/70 text-amber-900",
  blue: "border-blue-100 bg-blue-50/70 text-blue-900",
};

export function SummaryBox({
  label,
  value,
  hint,
  tone = "default",
  className,
}: SummaryBoxProps) {
  return (
    <div className={cn("rounded-xl border p-3", tones[tone], className)}>
      <p className="text-[10px] font-bold uppercase tracking-wide opacity-70">
        {label}
      </p>
      <p className="mt-1 truncate font-display text-base font-extrabold">{value}</p>
      {hint && <p className="mt-0.5 text-[10px] opacity-70">{hint}</p>}
    </div>
  );
}
