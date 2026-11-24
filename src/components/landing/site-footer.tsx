import Link from "next/link";
import { LogoMark } from "@/components/brand/logo";
import { Mail, MapPin, ShieldCheck } from "lucide-react";

const productLinks = [
  { href: "#fitur", label: "Fitur" },
  { href: "#cara-kerja", label: "Cara Kerja" },
  { href: "#manfaat", label: "Manfaat" },
  { href: "#tentang", label: "Tentang" },
];

const appLinks = [
  { href: "/login", label: "Masuk" },
  { href: "/register", label: "Daftar" },
  { href: "/login", label: "Akun Demo" },
];

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="container-page py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <div className="flex items-center gap-2.5">
              <LogoMark />
              <span className="font-display text-xl font-extrabold tracking-tight">
                Titip<span className="text-brand-300">Dekat</span>
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/65">
              Aplikasi pengelolaan konsinyasi untuk produsen makanan rumahan dan
              warung mitra. Satu catatan bersama, dari penawaran sampai
              settlement.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-brand-200">
              <ShieldCheck className="size-3.5" />
              Prototype frontend · data simulasi
            </div>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              Produk
            </p>
            <ul className="mt-4 space-y-2.5">
              {productLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              Aplikasi
            </p>
            <ul className="mt-4 space-y-2.5">
              {appLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-white/70 transition-colors hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              Tim
            </p>
            <p className="mt-4 font-display text-base font-bold">
              TitipDekat — Team Xcloud
            </p>
            <p className="mt-1 text-sm text-white/60">
              STACK 2026 · Semifinal Prototype
            </p>
            <div className="mt-4 space-y-2 text-sm text-white/60">
              <p className="flex items-center gap-2">
                <Mail className="size-4 text-brand-300" />
                hello@titipdekat.demo
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="size-4 text-brand-300" />
                Bandung, Indonesia
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 TitipDekat. Dibuat untuk demonstrasi kompetisi.</p>
          <p>
            Seluruh angka dan transaksi pada prototype ini merupakan data
            simulasi, bukan data bisnis nyata.
          </p>
        </div>
      </div>
    </footer>
  );
}
