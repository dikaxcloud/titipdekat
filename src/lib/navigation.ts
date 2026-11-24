import type { LucideIcon } from "lucide-react";
import {
  Handshake,
  LayoutDashboard,
  History,
  Package,
  ShoppingCart,
  Truck,
  UserRound,
  Wallet,
} from "lucide-react";
import type { Role } from "@/types";

export interface NavItem {
  href: string;
  label: string;
  shortLabel: string;
  icon: LucideIcon;
}

export function getNavItems(role: Role): NavItem[] {
  const base: NavItem[] = [
    {
      href: `/${role}/dashboard`,
      label: "Beranda",
      shortLabel: "Beranda",
      icon: LayoutDashboard,
    },
    {
      href: `/${role}/offers`,
      label: "Penawaran",
      shortLabel: "Penawaran",
      icon: Handshake,
    },
    {
      href: `/${role}/products`,
      label: role === "producer" ? "Produk" : "Stok Titipan",
      shortLabel: "Produk",
      icon: Package,
    },
  ];

  if (role === "shop") {
    base.push({
      href: "/shop/sales",
      label: "Penjualan & Stok",
      shortLabel: "Penjualan",
      icon: ShoppingCart,
    });
  }

  base.push(
    {
      href: `/${role}/deliveries`,
      label: "Pengiriman",
      shortLabel: "Kirim",
      icon: Truck,
    },
    {
      href: `/${role}/settlements`,
      label: "Settlement",
      shortLabel: "Settlement",
      icon: Wallet,
    },
    {
      href: `/${role}/history`,
      label: "Riwayat",
      shortLabel: "Riwayat",
      icon: History,
    },
    {
      href: `/${role}/profile`,
      label: "Profil",
      shortLabel: "Profil",
      icon: UserRound,
    },
  );

  return base;
}

const pageTitles: Record<string, string> = {
  "/producer/dashboard": "Beranda Produsen",
  "/producer/offers": "Penawaran",
  "/producer/products": "Produk",
  "/producer/deliveries": "Pengiriman",
  "/producer/settlements": "Settlement",
  "/producer/history": "Riwayat Aktivitas",
  "/producer/profile": "Profil Usaha",
  "/shop/dashboard": "Beranda Warung",
  "/shop/offers": "Penawaran Masuk",
  "/shop/products": "Stok Titipan",
  "/shop/sales": "Penjualan & Stok",
  "/shop/deliveries": "Pengiriman",
  "/shop/settlements": "Settlement",
  "/shop/history": "Riwayat Aktivitas",
  "/shop/profile": "Profil Usaha",
};

export function getPageTitle(pathname: string) {
  return pageTitles[pathname] ?? "TitipDekat";
}
