import {
  Boxes,
  Handshake,
  LineChart,
  ReceiptText,
  Wallet,
} from "lucide-react";
import { WordReveal } from "@/components/animation/word-reveal";
import { MotionCard } from "@/components/animation/motion-card";

const features = [
  {
    icon: Handshake,
    title: "Pengelolaan Penawaran",
    description:
      "Produsen mengirim penawaran produk, warung meninjau detail, lalu menerima atau menolak dengan status yang jelas.",
    tone: "bg-blue-50 text-blue-600 ring-blue-100",
    tag: "Kolaborasi",
  },
  {
    icon: Boxes,
    title: "Pencatatan Stok",
    description:
      "Stok dihitung dari batch titipan yang benar-benar diterima, dikurangi penjualan, retur, kerusakan, dan kedaluwarsa.",
    tone: "bg-violet-50 text-violet-600 ring-violet-100",
    tag: "Akurasi",
  },
  {
    icon: LineChart,
    title: "Pemantauan Penjualan",
    description:
      "Grafik penjualan dan produk terlaris membantu kedua pihak memahami performa titipan tanpa rekap manual.",
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    tag: "Insight",
  },
  {
    icon: ReceiptText,
    title: "Perhitungan Komisi",
    description:
      "Komisi warung dihitung otomatis dari harga jual dan persentase yang disepakati pada setiap penawaran.",
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
    tag: "Transparan",
  },
  {
    icon: Wallet,
    title: "Settlement & Riwayat",
    description:
      "Ringkasan pembayaran per periode, alur pengajuan dan konfirmasi, serta riwayat aktivitas yang dapat ditelusuri.",
    tone: "bg-brand-50 text-brand-700 ring-brand-100",
    tag: "Penyelesaian",
  },
];

export function Features() {
  return (
    <section id="fitur" className="border-y border-line bg-white py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            Inti rekonsiliasi
          </p>
          <WordReveal
            as="h2"
            text="Satu alur, dua pihak, angka yang sama"
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
          />
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Dirancang untuk alur kerja nyata produsen rumahan dan warung mitra.
            Setiap peristiwa titipan dicatat sekali, lalu menjadi dasar stok,
            komisi, dan settlement kedua belah pihak.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <MotionCard
              key={feature.title}
              as="article"
              index={index}
              className={
                index === 4
                  ? "group h-full rounded-2xl border border-line bg-gradient-to-br from-brand-50 to-white p-6 shadow-sm transition-shadow hover:shadow-md md:col-span-2 lg:col-span-1"
                  : "group h-full rounded-2xl border border-line bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
              }
            >
              <div className="flex items-start justify-between">
                <span
                  className={`flex size-11 items-center justify-center rounded-xl ring-1 ${feature.tone}`}
                >
                  <feature.icon className="size-5" />
                </span>
                <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-muted">
                  {feature.tag}
                </span>
              </div>
              <h3 className="mt-4 font-display text-lg font-bold text-ink">
                {feature.title}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-muted">
                {feature.description}
              </p>
            </MotionCard>
          ))}
        </div>
      </div>
    </section>
  );
}
