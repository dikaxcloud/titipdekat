import Link from "next/link";
import { ArrowLeft, CheckCircle2, type LucideIcon } from "lucide-react";
import { Logo } from "@/components/brand/logo";

interface RegisterLayoutProps {
  roleLabel: string;
  title: string;
  description: string;
  icon: LucideIcon;
  checklist: string[];
  children: React.ReactNode;
}

export function RegisterLayout({
  roleLabel,
  title,
  description,
  icon: Icon,
  checklist,
  children,
}: RegisterLayoutProps) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header className="border-b border-line bg-white">
        <div className="container-page flex h-18 items-center justify-between py-3">
          <Link href="/" aria-label="TitipDekat — beranda">
            <Logo />
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="hidden items-center gap-1.5 text-xs font-semibold text-muted hover:text-ink sm:inline-flex"
            >
              <ArrowLeft className="size-3.5" />
              Ganti role
            </Link>
            <Link
              href="/login"
              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-brand-700 hover:bg-brand-50"
            >
              Masuk
            </Link>
          </div>
        </div>
      </header>

      <main className="container-page py-8 sm:py-12">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:gap-10">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-sm">
              <Icon className="size-6" />
            </span>
            <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-brand-600">
              Registrasi {roleLabel}
            </p>
            <h1 className="mt-1 font-display text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>

            <div className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide text-muted">
                Yang perlu disiapkan
              </p>
              <ul className="mt-3 space-y-2.5">
                {checklist.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-muted">
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-brand-600" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-4 rounded-2xl border border-brand-100 bg-brand-50/70 p-4">
              <p className="text-xs font-bold text-brand-900">
                Ingin mencoba tanpa mendaftar?
              </p>
              <p className="mt-1 text-xs leading-relaxed text-brand-800/80">
                Gunakan akun demo di halaman masuk untuk melihat data yang sudah
                terisi.
              </p>
              <Link
                href="/login"
                className="mt-2 inline-flex text-xs font-bold text-brand-700 hover:text-brand-800"
              >
                Buka halaman masuk →
              </Link>
            </div>

            <p className="mt-6 text-[11px] font-semibold uppercase tracking-wider text-muted">
              TitipDekat — Team Xcloud
            </p>
          </aside>

          <div>{children}</div>
        </div>
      </main>
    </div>
  );
}
