import Link from "next/link";
import { ArrowRight, CheckCircle2, Store, UtensilsCrossed } from "lucide-react";
import { Button } from "@/components/ui/button";

const producerBenefits = [
  "Kirim penawaran ke beberapa warung tanpa mencatat ulang.",
  "Pantau batch titipan yang sudah diterima dan sisa stoknya.",
  "Lihat komisi mitra serta piutang yang belum dibayarkan.",
  "Selesaikan pembayaran melalui alur settlement yang jelas.",
];

const shopBenefits = [
  "Terima atau tolak penawaran dengan informasi lengkap.",
  "Catat penjualan, retur, kerusakan, dan kedaluwarsa per batch.",
  "Ketahui stok menipis sebelum pelanggan kehabisan produk.",
  "Periksa komisi dan kewajiban pembayaran ke produsen.",
];

export function Benefits() {
  return (
    <section id="manfaat" className="border-y border-line bg-white py-16 sm:py-20">
      <div className="container-page">
        <div className="grid items-end gap-6 lg:grid-cols-[1fr_auto]">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
              Manfaat
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
              Satu catatan, dua pihak yang diuntungkan
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
              Produsen mendapatkan visibilitas, warung mendapatkan kemudahan.
              Keduanya melihat angka yang sama sehingga tidak ada lagi
              perbedaan catatan.
            </p>
          </div>
          <Button variant="outline" asChild>
            <Link href="/login">
              Coba akun demo
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          <article className="relative overflow-hidden rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-white p-6 shadow-sm sm:p-8">
            <div
              className="absolute -right-12 -top-12 size-40 rounded-full bg-brand-100/70 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
                <UtensilsCrossed className="size-6" />
              </span>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700">
                Untuk Produsen
              </p>
              <h3 className="mt-1 font-display text-xl font-extrabold text-ink">
                Pantau titipan tanpa bolak-balik ke warung
              </h3>
              <ul className="mt-5 space-y-3">
                {producerBenefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2.5 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-brand-100 bg-white/80 p-3">
                <p className="text-xs font-semibold text-ink">
                  Contoh angka demo
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Rp 568.000 penjualan · Rp 80.400 komisi mitra · Rp 487.600
                  hak produsen
                </p>
              </div>
            </div>
          </article>

          <article className="relative overflow-hidden rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 via-white to-white p-6 shadow-sm sm:p-8">
            <div
              className="absolute -right-12 -top-12 size-40 rounded-full bg-blue-100/70 blur-2xl"
              aria-hidden="true"
            />
            <div className="relative">
              <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-sm">
                <Store className="size-6" />
              </span>
              <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700">
                Untuk Warung
              </p>
              <h3 className="mt-1 font-display text-xl font-extrabold text-ink">
                Jual titipan dengan catatan yang rapi
              </h3>
              <ul className="mt-5 space-y-3">
                {shopBenefits.map((benefit) => (
                  <li key={benefit} className="flex gap-2.5 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-blue-600" />
                    <span className="leading-relaxed">{benefit}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 rounded-xl border border-blue-100 bg-white/80 p-3">
                <p className="text-xs font-semibold text-ink">
                  Contoh angka demo
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  19 pcs stok tersedia · 79 pcs terjual · Rp 93.600 komisi
                  diperoleh
                </p>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
