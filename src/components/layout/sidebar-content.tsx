"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LogOut,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { getShopStock } from "@/lib/calculations";
import { getNavItems } from "@/lib/navigation";
import { useDemoStore } from "@/lib/store";
import { cn, getInitials } from "@/lib/utils";
import type { Role } from "@/types";

interface SidebarContentProps {
  role: Role;
  onNavigate?: () => void;
  onResetDemo: () => void;
  onClose?: () => void;
}

export function SidebarContent({
  role,
  onNavigate,
  onResetDemo,
  onClose,
}: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const business = useCurrentBusiness();
  const logout = useDemoStore((state) => state.logout);
  const offers = useDemoStore((state) => state.offers);
  const deliveries = useDemoStore((state) => state.deliveries);
  const settlements = useDemoStore((state) => state.settlements);
  const stockEvents = useDemoStore((state) => state.stockEvents);
  const products = useDemoStore((state) => state.products);
  const businesses = useDemoStore((state) => state.businesses);

  const navItems = getNavItems(role);

  const pendingOffers = offers.filter(
    (offer) =>
      offer.status === "pending" &&
      (role === "producer"
        ? offer.producerId === business?.id
        : offer.shopId === business?.id),
  ).length;

  const deliveryCount = deliveries.filter(
    (delivery) =>
      (role === "producer"
        ? delivery.producerId === business?.id &&
          delivery.status === "preparing"
        : delivery.shopId === business?.id &&
          delivery.status === "shipped"),
  ).length;

  const settlementCount = settlements.filter(
    (settlement) =>
      settlement.status === "awaiting_confirmation" &&
      settlement.submittedBy !== role &&
      (role === "producer"
        ? settlement.producerId === business?.id
        : settlement.shopId === business?.id),
  ).length;

  const lowStock =
    role === "shop" && business
      ? getShopStock(
          {
            businesses,
            products,
            offers,
            deliveries,
            stockEvents,
            settlements,
          },
          business.id,
        ).filter((row) => row.status !== "safe").length
      : 0;

  const counts: Record<string, number> = {
    [`/${role}/offers`]: pendingOffers,
    [`/${role}/deliveries`]: deliveryCount,
    [`/${role}/settlements`]: settlementCount,
    [`/${role}/products`]: lowStock,
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between px-5 pb-4 pt-5">
        <Link href="/" aria-label="TitipDekat — beranda" onClick={onNavigate}>
          <Logo compact />
        </Link>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-muted hover:bg-mist hover:text-ink"
            aria-label="Tutup menu"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="px-4">
        <div className="rounded-2xl border border-line bg-mist/60 p-3">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-sm font-bold text-white shadow-sm">
              {getInitials(business?.businessName ?? "TitipDekat")}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">
                {business?.businessName ?? "Memuat usaha…"}
              </p>
              <p className="truncate text-[11px] font-medium text-muted">
                {role === "producer" ? "Produsen" : "Pemilik Warung"} ·{" "}
                {business?.city ?? "Indonesia"}
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-brand-700 ring-1 ring-brand-100">
            <Sparkles className="size-3" />
            Mode demo · data simulasi
          </div>
        </div>
      </div>

      <nav className="mt-5 flex-1 space-y-1 overflow-y-auto px-3 pb-4 scrollbar-thin">
        <p className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-muted">
          Menu utama
        </p>
        {navItems.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== `/${role}/dashboard` && pathname.startsWith(item.href));
          const count = counts[item.href] ?? 0;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-800"
                  : "text-muted hover:bg-mist hover:text-ink",
              )}
            >
              <item.icon
                className={cn(
                  "size-[18px] shrink-0",
                  isActive ? "text-brand-600" : "text-muted group-hover:text-ink",
                )}
              />
              <span className="flex-1">{item.label}</span>
              {count > 0 && (
                <span className="flex min-w-5 items-center justify-center rounded-full bg-brand-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {count}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-line p-4">
        <div className="flex items-start gap-2 rounded-xl bg-brand-50/70 p-3 text-[11px] leading-relaxed text-brand-800">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          <p>
            Prototype frontend. Semua transaksi disimulasikan dan tersimpan di
            browser.
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start text-muted"
          onClick={onResetDemo}
        >
          <RotateCcw className="size-4" />
          Reset data demo
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={() => {
            logout();
            toast.success("Anda telah keluar");
            router.push("/login");
          }}
        >
          <LogOut className="size-4" />
          Keluar
        </Button>
        <p className="pt-1 text-center text-[10px] font-semibold uppercase tracking-wider text-muted">
          TitipDekat — Team Xcloud
        </p>
      </div>
    </div>
  );
}
