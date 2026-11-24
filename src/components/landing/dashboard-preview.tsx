import { BadgeCheck, PackageCheck, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const bars = [34, 46, 39, 57, 50, 64, 59, 73, 67, 85, 78, 94];

const offers = [
  {
    product: "Keripik Pisang Pedas",
    shop: "Warung Berkah Jaya",
    qty: "40 pcs",
    status: "Diterima",
    variant: "success" as const,
  },
  {
    product: "Kue Kering Nastar",
    shop: "Toko Sinar Rasa",
    qty: "20 pcs",
    status: "Dikirim",
    variant: "warning" as const,
  },
  {
    product: "Brownies Kukus",
    shop: "Warung Berkah Jaya",
    qty: "15 pcs",
    status: "Menunggu",
    variant: "info" as const,
  },
];

export function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
      <div
        className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-brand-200/70 via-brand-100/40 to-transparent blur-2xl"
        aria-hidden="true"
      />

      <div className="relative overflow-hidden rounded-2xl border border-line bg-white shadow-[0_24px_70px_-24px_rgba(16,35,28,0.35)]">
        <div className="flex items-center gap-2 border-b border-line bg-mist/70 px-4 py-2.5">
          <span className="size-2.5 rounded-full bg-red-300" />
          <span className="size-2.5 rounded-full bg-amber-300" />
          <span className="size-2.5 rounded-full bg-emerald-300" />
          <div className="ml-2 flex-1 rounded-md bg-white/80 px-2.5 py-1 text-[10px] font-medium text-muted ring-1 ring-line">
            app.titipdekat.id/producer/dashboard
          </div>
        </div>

        <div className="bg-canvas/70 p-4 sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-brand-600">
                Beranda Produsen
              </p>
              <p className="mt-0.5 font-display text-base font-extrabold text-ink sm:text-lg">
                Selamat pagi, Bu Sari 👋
              </p>
              <p className="text-[11px] text-muted">
                Ringkasan konsinyasi Dapur Bu Sari
              </p>
            </div>
            <span className="hidden items-center gap-1 rounded-full border border-brand-100 bg-brand-50 px-2 py-1 text-[10px] font-bold text-brand-700 sm:inline-flex">
              <span className="size-1.5 rounded-full bg-brand-500" />
              Data live demo
            </span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: "Penjualan", value: "Rp 568 rb", icon: TrendingUp },
              { label: "Komisi mitra", value: "Rp 80 rb", icon: PackageCheck },
              { label: "Piutang", value: "Rp 488 rb", icon: BadgeCheck },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-xl border border-line bg-white p-2.5 shadow-sm"
              >
                <div className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-muted">
                  <stat.icon className="size-3 text-brand-500" />
                  {stat.label}
                </div>
                <p className="mt-1 truncate font-display text-xs font-extrabold text-ink sm:text-sm">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl border border-line bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-bold text-ink">Tren penjualan</p>
              <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-bold text-emerald-700">
                +12,4% vs pekan lalu
              </span>
            </div>
            <div className="mt-3 flex h-24 items-end gap-1.5">
              {bars.map((height, index) => (
                <div
                  key={index}
                  className="flex-1 rounded-t-sm bg-gradient-to-t from-brand-200 to-brand-500"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[8px] font-medium text-muted">
              <span>1 Nov</span>
              <span>8 Nov</span>
              <span>15 Nov</span>
              <span>22 Nov</span>
            </div>
          </div>

          <div className="mt-3 rounded-xl border border-line bg-white p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-bold text-ink">Penawaran terbaru</p>
              <span className="text-[9px] font-semibold text-brand-700">
                Lihat semua
              </span>
            </div>
            <div className="space-y-2">
              {offers.map((offer) => (
                <div
                  key={offer.product}
                  className="flex items-center gap-2 rounded-lg bg-mist/60 px-2 py-1.5"
                >
                  <span className="flex size-6 items-center justify-center rounded-md bg-white text-xs ring-1 ring-line">
                    {offer.product.includes("Pisang")
                      ? "🍌"
                      : offer.product.includes("Nastar")
                        ? "🍪"
                        : "🍫"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[10px] font-bold text-ink">
                      {offer.product}
                    </p>
                    <p className="truncate text-[9px] text-muted">
                      {offer.shop} · {offer.qty}
                    </p>
                  </div>
                  <Badge
                    variant={offer.variant}
                    className="px-1.5 py-0 text-[8px]"
                  >
                    {offer.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -right-3 top-20 hidden w-44 rounded-xl border border-line bg-white p-3 shadow-xl md:block lg:-right-6">
        <div className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <BadgeCheck className="size-4" />
          </span>
          <div>
            <p className="text-[10px] font-bold text-ink">Penawaran diterima</p>
            <p className="text-[9px] text-muted">Warung Berkah Jaya</p>
          </div>
        </div>
        <p className="mt-2 text-[9px] leading-relaxed text-muted">
          40 pcs Keripik Pisang siap dicatat pengirimannya.
        </p>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden w-48 rounded-xl border border-line bg-white p-3 shadow-xl md:block lg:-left-6">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-bold text-ink">Settlement selesai</p>
          <span className="rounded-full bg-emerald-50 px-1.5 py-0.5 text-[8px] font-bold text-emerald-700">
            Selesai
          </span>
        </div>
        <p className="mt-1 font-display text-sm font-extrabold text-ink">
          Rp 263.500
        </p>
        <p className="text-[9px] text-muted">
          Diterima produsen · periode 1–15 Nov
        </p>
      </div>
    </div>
  );
}
