import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/utils";

interface PaymentRow {
  label: string;
  value: string;
}

interface PaymentSummaryCardProps {
  eyebrow: string;
  title: string;
  amount: number;
  amountLabel: string;
  rows: PaymentRow[];
  progress: number;
  progressLabel: string;
  href: string;
  cta: string;
}

export function PaymentSummaryCard({
  eyebrow,
  title,
  amount,
  amountLabel,
  rows,
  progress,
  progressLabel,
  href,
  cta,
}: PaymentSummaryCardProps) {
  return (
    <Card className="relative overflow-hidden border-brand-800 bg-brand-900 text-white">
      <div
        className="pointer-events-none absolute inset-0 bg-grid opacity-[0.08]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full bg-brand-400/20 blur-2xl"
        aria-hidden="true"
      />
      <div className="relative p-5 sm:p-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-300">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-display text-lg font-bold text-white">
          {title}
        </h3>
        <p className="mt-4 text-xs font-medium text-brand-100/70">{amountLabel}</p>
        <p className="mt-1 font-display text-3xl font-extrabold tracking-tight text-white">
          {formatCurrency(amount)}
        </p>

        <div className="mt-5 space-y-2.5">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-3 text-xs"
            >
              <span className="text-brand-100/70">{row.label}</span>
              <span className="font-semibold text-white">{row.value}</span>
            </div>
          ))}
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-[11px] text-brand-100/70">
            <span>{progressLabel}</span>
            <span className="font-bold text-white">{progress}%</span>
          </div>
          <Progress
            value={progress}
            className="mt-1.5 bg-white/15"
            indicatorClassName="bg-brand-300"
          />
        </div>

        <Link
          href={href}
          className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 text-xs font-semibold text-white transition-colors hover:bg-white/20"
        >
          {cta}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </Card>
  );
}
