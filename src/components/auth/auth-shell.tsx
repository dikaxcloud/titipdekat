import Link from "next/link";
import { ArrowLeft, Handshake, PackageCheck, Wallet } from "lucide-react";
import { LogoMark } from "@/components/brand/logo";
import { cn } from "@/lib/utils";

const defaultBenefits = [
  {
    icon: Handshake,
    title: "Penawaran yang jelas",
    description: "Produsen dan warung menyepakati produk, harga, dan komisi.",
  },
  {
    icon: PackageCheck,
    title: "Stok yang dapat dipercaya",
    description: "Setiap penjualan dan retur tercatat pada batch titipan.",
  },
  {
    icon: Wallet,
    title: "Pembayaran transparan",
    description: "Komisi dan settlement dihitung dari transaksi yang sama.",
  },
];

interface AuthShellProps {
  children: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  contentClassName?: string;
  benefits?: typeof defaultBenefits;
}

export function AuthShell({
  children,
  eyebrow,
  title,
  description,
  contentClassName,
  benefits = defaultBenefits,
}: AuthShellProps) {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[1.02fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-brand-900 p-10 text-white lg:flex lg:flex-col xl:p-14">
        <div
          className="pointer-events-none absolute inset-0 bg-grid opacity-[0.07]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-brand-400/20 blur-3xl"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-20 size-80 rounded-full bg-brand-300/10 blur-3xl"
          aria-hidden="true"
        />

        <Link href="/" className="relative inline-flex items-center gap-2.5">
          <LogoMark />
          <span className="font-display text-xl font-extrabold tracking-tight">
            Titip<span className="text-brand-300">Dekat</span>
          </span>
        </Link>

        <div className="relative mt-16 max-w-md">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-brand-300">
            {eyebrow}
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
            {title}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-brand-100/75">
            {description}
          </p>
        </div>

        <div className="relative mt-10 space-y-3">
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.06] p-3.5 backdrop-blur-sm"
            >
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-400/15 text-brand-200">
                <benefit.icon className="size-4" />
              </span>
              <div>
                <p className="text-sm font-semibold text-white">
                  {benefit.title}
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-brand-100/65">
                  {benefit.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="relative mt-auto pt-10">
          <div className="rounded-xl border border-white/10 bg-black/10 p-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-300">
              Prototype STACK 2026
            </p>
            <p className="mt-1 text-sm font-semibold">
              TitipDekat — Team Xcloud
            </p>
            <p className="mt-1 text-xs leading-relaxed text-brand-100/60">
              Frontend demo dengan data simulasi. Tidak terhubung ke backend
              maupun payment gateway.
            </p>
          </div>
        </div>
      </aside>

      <main className="flex min-h-dvh flex-col">
        <div className="flex items-center justify-between px-4 py-4 sm:px-8 lg:justify-end">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink lg:hidden"
          >
            <LogoMark className="size-8" />
            TitipDekat
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-muted transition-colors hover:bg-mist hover:text-ink"
          >
            <ArrowLeft className="size-3.5" />
            Kembali ke beranda
          </Link>
        </div>

        <div
          className={cn(
            "flex flex-1 items-start justify-center px-4 pb-12 pt-2 sm:px-8 lg:items-center lg:pt-0",
            contentClassName,
          )}
        >
          <div className="w-full max-w-md">{children}</div>
        </div>

        <p className="px-4 pb-6 text-center text-[11px] text-muted lg:px-8">
          © 2026 TitipDekat · Team Xcloud · Data simulasi
        </p>
      </main>
    </div>
  );
}
