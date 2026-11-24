import Link from "next/link";
import { ArrowRight, KeyRound, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="pb-16 sm:pb-20">
      <div className="container-page">
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-6 py-12 text-white shadow-xl sm:px-10 sm:py-14">
          <div
            className="pointer-events-none absolute inset-0 bg-grid opacity-[0.08]"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-brand-400/20 blur-3xl"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute -bottom-24 left-10 size-64 rounded-full bg-brand-300/10 blur-3xl"
            aria-hidden="true"
          />

          <div className="relative grid items-center gap-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] text-brand-100">
                <Sparkles className="size-3.5" />
                Siap didemonstrasikan
              </div>
              <h2 className="mt-4 max-w-2xl font-display text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">
                Coba alur konsinyasi TitipDekat dari dua sisi.
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-brand-100/80 sm:text-base">
                Masuk sebagai produsen untuk membuat penawaran, lalu berganti ke
                role warung untuk menerima titipan dan mencatat penjualan. Semua
                perubahan saling terhubung.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" variant="secondary" asChild>
                  <Link href="/login">
                    <KeyRound className="size-4" />
                    Masuk dengan akun demo
                  </Link>
                </Button>
                <Button
                  size="lg"
                  asChild
                  className="border border-white/20 bg-white/10 text-white shadow-none hover:bg-white/20"
                >
                  <Link href="/register">
                    Daftar sekarang
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur sm:min-w-72">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-brand-200">
                Akun demo
              </p>
              <div className="mt-3 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-white">Produsen</p>
                  <p className="font-mono text-[11px] text-brand-100/80">
                    producer@titipdekat.demo
                  </p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-white">
                    Pemilik Warung
                  </p>
                  <p className="font-mono text-[11px] text-brand-100/80">
                    shop@titipdekat.demo
                  </p>
                </div>
                <div className="rounded-lg bg-black/15 px-2.5 py-2">
                  <p className="text-[10px] uppercase tracking-wider text-brand-200">
                    Password
                  </p>
                  <p className="font-mono text-sm font-bold text-white">
                    demo123
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
