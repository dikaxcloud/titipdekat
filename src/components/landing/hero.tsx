import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Handshake,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { DashboardPreview } from "@/components/landing/dashboard-preview";
import { Button } from "@/components/ui/button";
import { WordReveal } from "@/components/animation/word-reveal";
import { MotionTap } from "@/components/animation/motion-tap";
import { Reveal } from "@/components/animation/reveal";

const trustPoints = [
  { icon: Handshake, label: "Satu catatan, dua pihak" },
  { icon: TrendingUp, label: "Stok & komisi otomatis" },
  { icon: Wallet, label: "Settlement transparan" },
];

export function Hero() {
  return (
    <section id="beranda" className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 bg-grid [mask-image:linear-gradient(to_bottom,black,transparent_85%)]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -left-32 top-10 size-80 rounded-full bg-brand-200/40 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-24 top-40 size-96 rounded-full bg-brand-100/50 blur-3xl"
        aria-hidden="true"
      />

      <div className="container-page relative pb-16 pt-10 sm:pt-14 lg:pb-24 lg:pt-20">
        <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_1fr] lg:gap-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-white/80 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-700 shadow-sm backdrop-blur">
              <Sparkles className="size-3.5" />
              Prototype STACK 2026 · Team Xcloud
            </div>

            <h1 className="mt-5 font-display text-4xl font-extrabold leading-[1.08] tracking-tight text-ink sm:text-5xl lg:text-[56px]">
              <WordReveal text="Titipan tercatat rapi." />
              <br />
              <span className="relative text-brand-600">
                <WordReveal text="Rekonsiliasi jelas." />
                <svg
                  className="absolute -bottom-2 left-0 h-2.5 w-full text-brand-300/70"
                  viewBox="0 0 200 10"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 8c40-6 100-6 196-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
              TitipDekat menyatukan pencatatan konsinyasi produsen dan warung
              mitra—dari penawaran, stok, penjualan, retur, komisi, sampai
              settlement dalam satu alur yang sama.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <MotionTap>
                <Button size="lg" asChild>
                  <Link href="/register">
                    Mulai Sekarang
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </MotionTap>
              <MotionTap>
                <Button size="lg" variant="outline" asChild>
                  <a href="#cara-kerja">
                    <PlayCircle className="size-4" />
                    Lihat Alur Rekonsiliasi
                  </a>
                </Button>
              </MotionTap>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-2">
              {trustPoints.map((point) => (
                <span
                  key={point.label}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted"
                >
                  <point.icon className="size-3.5 text-brand-600" />
                  {point.label}
                </span>
              ))}
            </div>

            <div className="mt-8 flex items-center gap-3 rounded-2xl border border-line bg-white/70 p-3 pr-4 shadow-sm backdrop-blur sm:max-w-md">
              <div className="flex -space-x-2">
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-brand-600 text-[10px] font-bold text-white">
                  DS
                </span>
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[10px] font-bold text-white">
                  WB
                </span>
                <span className="flex size-9 items-center justify-center rounded-full border-2 border-white bg-amber-500 text-[10px] font-bold text-white">
                  TS
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-ink">
                  Produsen & warung dalam satu alur
                </p>
                <p className="text-[11px] leading-relaxed text-muted">
                  Coba dua akun demo tanpa perlu membuat data dari nol.
                </p>
              </div>
              <ShieldCheck className="hidden size-5 shrink-0 text-brand-500 sm:block" />
            </div>
          </div>

          <div className="lg:pl-4">
            <Reveal y={24} start="top 90%">
              <DashboardPreview />
            </Reveal>
          </div>
        </div>

        <div className="mt-16 grid gap-4 rounded-2xl border border-line bg-white/80 p-5 shadow-sm backdrop-blur sm:grid-cols-3 lg:mt-20">
          {[
            {
              value: "5",
              label: "Alur inti konsinyasi",
              detail: "Penawaran → pengiriman → penjualan → komisi → settlement",
            },
            {
              value: "2",
              label: "Role saling terhubung",
              detail: "Produsen dan warung memakai satu sumber data yang sama",
            },
            {
              value: "100%",
              label: "Data simulasi lokal",
              detail: "Dapat direset kapan saja untuk kebutuhan demonstrasi",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex gap-3 rounded-xl px-2 py-1 sm:border-l sm:border-line sm:first:border-l-0 sm:pl-5 sm:first:pl-2"
            >
              <p className="font-display text-3xl font-extrabold text-brand-600">
                {item.value}
              </p>
              <div>
                <p className="text-sm font-bold text-ink">{item.label}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-muted">
                  {item.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs font-medium text-muted">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-brand-500" />
            Tanpa integrasi backend pada tahap prototype
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-brand-500" />
            Perubahan tersimpan di browser
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="size-3.5 text-brand-500" />
            Responsif di desktop & smartphone
          </span>
        </div>
      </div>
    </section>
  );
}
