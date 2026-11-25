"use client";

import { useLayoutEffect, useRef } from "react";
import {
  FilePlus2,
  PackageCheck,
  ShoppingCart,
  Store,
  Wallet,
} from "lucide-react";
import { WordReveal } from "@/components/animation/word-reveal";
import { gsap } from "@/lib/gsap";

const steps = [
  {
    icon: FilePlus2,
    title: "Produsen menawarkan produk",
    description:
      "Pilih warung, produk, jumlah, harga jual, dan komisi mitra. Simpan sebagai draft atau langsung kirim.",
  },
  {
    icon: Store,
    title: "Warung menerima penawaran",
    description:
      "Warung meninjau detail penawaran dan memutuskan untuk menerima atau menolak dengan satu konfirmasi.",
  },
  {
    icon: PackageCheck,
    title: "Produk diterima dan dicatat",
    description:
      "Produsen mencatat pengiriman, warung mengonfirmasi jumlah diterima. Selisih jumlah tercatat sebagai catatan.",
  },
  {
    icon: ShoppingCart,
    title: "Warung melaporkan penjualan",
    description:
      "Setiap penjualan, retur, kerusakan, dan kedaluwarsa mengurangi stok serta tercatat di riwayat bersama.",
  },
  {
    icon: Wallet,
    title: "Komisi & pembayaran dihitung",
    description:
      "Sistem menghitung penjualan bruto, komisi warung, dan jumlah yang harus dibayar ke produsen per periode.",
  },
];

export function HowItWorks() {
  const listRef = useRef<HTMLOListElement | null>(null);

  useLayoutEffect(() => {
    const element = listRef.current;
    if (!element) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-step]",
        { autoAlpha: 0, y: 16 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: { trigger: element, start: "top 82%", once: true },
        },
      );
      gsap.fromTo(
        "[data-connector]",
        { scaleX: 0, transformOrigin: "left center" },
        {
          scaleX: 1,
          duration: 0.5,
          stagger: 0.12,
          ease: "power1.out",
          scrollTrigger: { trigger: element, start: "top 82%", once: true },
        },
      );
    }, element);

    return () => context.revert();
  }, []);

  return (
    <section id="cara-kerja" className="py-16 sm:py-20">
      <div className="container-page">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-600">
            Cara kerja
          </p>
          <WordReveal
            as="h2"
            text="Lima langkah dari titipan menjadi lunas"
            className="mt-3 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
          />
          <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">
            Alur yang sama digunakan kedua role. Setiap perubahan langsung
            terlihat pada dashboard dan riwayat.
          </p>
        </div>

        <ol ref={listRef} className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-5 lg:gap-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative">
              {index < steps.length - 1 && (
                <span
                  data-connector
                  className="absolute left-[calc(50%+28px)] right-[-50%] top-7 hidden h-px bg-gradient-to-r from-brand-200 to-line lg:block"
                  aria-hidden="true"
                />
              )}
              <div
                data-step
                className="relative flex h-full flex-col items-center rounded-2xl border border-line bg-white p-5 text-center shadow-sm"
              >
                <span className="flex size-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-700 ring-1 ring-brand-100">
                  <step.icon className="size-6" />
                </span>
                <span className="mt-3 inline-flex items-center rounded-full bg-ink px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Langkah {index + 1}
                </span>
                <h3 className="mt-2 font-display text-sm font-bold leading-snug text-ink">
                  {step.title}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {step.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
