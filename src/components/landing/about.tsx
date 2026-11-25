import {
  Database,
  GitBranch,
  Layers3,
  ShieldCheck,
} from "lucide-react";
import { WordReveal } from "@/components/animation/word-reveal";
import { Reveal } from "@/components/animation/reveal";

const points = [
  {
    icon: GitBranch,
    title: "Satu sumber data",
    description:
      "Stok, penjualan, komisi, dan settlement dihitung dari catatan transaksi yang sama sehingga tidak ada penghitungan ganda.",
  },
  {
    icon: Layers3,
    title: "Dua sudut pandang",
    description:
      "Produsen dan warung melihat data yang relevan untuk perannya, tetapi perubahan dari satu pihak langsung terlihat oleh pihak lain.",
  },
  {
    icon: Database,
    title: "Siap dikembangkan",
    description:
      "Data mock dipisahkan dari komponen UI agar mudah dipindahkan ke Supabase pada tahap berikutnya.",
  },
];

export function About() {
  return (
    <section id="tentang" className="py-16 sm:py-20">
      <div className="container-page">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
              Tentang TitipDekat
            </p>
            <WordReveal
              as="h2"
              text="Konsinyasi seharusnya tidak membingungkan."
              className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
            />
            <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
              Banyak produsen rumahan dan warung masih mencatat titipan di buku,
              chat, atau spreadsheet terpisah. Akibatnya stok tidak cocok,
              komisi sulit dicek, dan pembayaran tertunda. TitipDekat menyatukan
              seluruh alur tersebut dalam satu catatan bersama yang dipakai
              kedua pihak.
            </p>
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-brand-600" />
              <div>
                <p className="text-sm font-bold text-brand-900">
                  Prototype frontend untuk semifinal STACK 2026
                </p>
                <p className="mt-1 text-xs leading-relaxed text-brand-800/80">
                  Belum terhubung ke backend. Semua transaksi disimulasikan dan
                  dapat direset untuk kebutuhan demonstrasi juri.
                </p>
              </div>
            </div>
          </div>

          <Reveal className="grid gap-4 sm:grid-cols-1" stagger={0.1}>
            {points.map((point, index) => (
              <article
                key={point.title}
                data-reveal
                className="flex gap-4 rounded-2xl border border-line bg-white p-5 shadow-sm"
              >
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-mist text-brand-700 ring-1 ring-line">
                  <point.icon className="size-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-muted">
                      0{index + 1}
                    </span>
                    <h3 className="font-display text-base font-bold text-ink">
                      {point.title}
                    </h3>
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-muted">
                    {point.description}
                  </p>
                </div>
              </article>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
