import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Store, UtensilsCrossed } from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Daftar",
};

const roles = [
  {
    role: "producer",
    icon: UtensilsCrossed,
    label: "Produsen",
    title: "Saya memproduksi dan menitipkan produk",
    description:
      "Buat katalog produk, kirim penawaran ke warung, catat pengiriman, dan pantau pembayaran konsinyasi.",
    href: "/register/producer",
    points: [
      "Kelola produk dan harga jual",
      "Kirim penawaran ke banyak warung",
      "Pantau stok, penjualan, dan piutang",
      "Ajukan settlement per periode",
    ],
    tone: "brand",
  },
  {
    role: "shop",
    icon: Store,
    label: "Pemilik Warung",
    title: "Saya menerima dan menjual produk titipan",
    description:
      "Tinjau penawaran masuk, konfirmasi penerimaan, catat penjualan harian, dan selesaikan pembayaran.",
    href: "/register/shop",
    points: [
      "Terima atau tolak penawaran",
      "Konfirmasi jumlah barang diterima",
      "Catat penjualan, retur, dan kerusakan",
      "Periksa komisi dan settlement",
    ],
    tone: "blue",
  },
] as const;

export default function RegisterPage() {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="container-page flex h-18 items-center justify-between py-3">
          <Link href="/" aria-label="TitipDekat — beranda">
            <Logo />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted hover:text-ink"
          >
            <ArrowLeft className="size-4" />
            Sudah punya akun? Masuk
          </Link>
        </div>
      </header>

      <main className="container-page py-12 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            Buat akun baru
          </p>
          <h1 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Pilih peran Anda di TitipDekat
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Setiap peran memiliki dashboard dan alur kerja yang saling terhubung.
            Anda dapat berganti role demo kapan saja setelah masuk.
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-5 md:grid-cols-2">
          {roles.map((item) => (
            <article
              key={item.role}
              className="group flex flex-col rounded-2xl border border-line bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md sm:p-7"
            >
              <span
                className={
                  item.tone === "brand"
                    ? "flex size-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100"
                    : "flex size-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 ring-1 ring-blue-100"
                }
              >
                <item.icon className="size-6" />
              </span>
              <p
                className={
                  item.tone === "brand"
                    ? "mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-700"
                    : "mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-blue-700"
                }
              >
                {item.label}
              </p>
              <h2 className="mt-1 font-display text-xl font-extrabold text-ink">
                {item.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
              <ul className="mt-5 space-y-2.5">
                {item.points.map((point) => (
                  <li
                    key={point}
                    className="flex items-center gap-2 text-sm text-muted"
                  >
                    <CheckCircle2
                      className={
                        item.tone === "brand"
                          ? "size-4 shrink-0 text-brand-600"
                          : "size-4 shrink-0 text-blue-600"
                      }
                    />
                    {point}
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex-1" />
              <Button asChild size="lg" className="w-full">
                <Link href={item.href}>
                  Pilih {item.label}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </article>
          ))}
        </div>

        <p className="mt-8 text-center text-xs text-muted">
          Dengan mendaftar, Anda menggunakan data simulasi pada prototype ini.
          Tidak ada data yang dikirim ke server.
        </p>
      </main>
    </div>
  );
}
