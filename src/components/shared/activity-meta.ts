import type { ActivityType } from "@/types";
import {
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ClipboardList,
  FilePenLine,
  PackageCheck,
  PackagePlus,
  PackageX,
  ShoppingCart,
  Truck,
  Undo2,
  UserRound,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface ActivityMeta {
  icon: LucideIcon;
  tone: string;
  label: string;
}

const meta: Record<ActivityType, ActivityMeta> = {
  offer_created: {
    icon: FilePenLine,
    tone: "bg-blue-50 text-blue-600 ring-blue-100",
    label: "Penawaran",
  },
  offer_accepted: {
    icon: CheckCircle2,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    label: "Penawaran",
  },
  offer_rejected: {
    icon: XCircle,
    tone: "bg-red-50 text-red-600 ring-red-100",
    label: "Penawaran",
  },
  offer_cancelled: {
    icon: XCircle,
    tone: "bg-slate-100 text-slate-600 ring-slate-200",
    label: "Penawaran",
  },
  delivery_created: {
    icon: PackagePlus,
    tone: "bg-violet-50 text-violet-600 ring-violet-100",
    label: "Pengiriman",
  },
  delivery_shipped: {
    icon: Truck,
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
    label: "Pengiriman",
  },
  delivery_received: {
    icon: PackageCheck,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    label: "Pengiriman",
  },
  delivery_disputed: {
    icon: PackageX,
    tone: "bg-red-50 text-red-600 ring-red-100",
    label: "Pengiriman",
  },
  sale_recorded: {
    icon: ShoppingCart,
    tone: "bg-brand-50 text-brand-600 ring-brand-100",
    label: "Penjualan",
  },
  return_recorded: {
    icon: Undo2,
    tone: "bg-amber-50 text-amber-600 ring-amber-100",
    label: "Retur",
  },
  damage_recorded: {
    icon: PackageX,
    tone: "bg-red-50 text-red-600 ring-red-100",
    label: "Kerusakan",
  },
  expiry_recorded: {
    icon: ClipboardList,
    tone: "bg-orange-50 text-orange-600 ring-orange-100",
    label: "Kedaluwarsa",
  },
  settlement_submitted: {
    icon: Banknote,
    tone: "bg-blue-50 text-blue-600 ring-blue-100",
    label: "Settlement",
  },
  settlement_completed: {
    icon: BadgeCheck,
    tone: "bg-emerald-50 text-emerald-600 ring-emerald-100",
    label: "Settlement",
  },
  product_created: {
    icon: PackagePlus,
    tone: "bg-violet-50 text-violet-600 ring-violet-100",
    label: "Produk",
  },
  product_updated: {
    icon: FilePenLine,
    tone: "bg-blue-50 text-blue-600 ring-blue-100",
    label: "Produk",
  },
  product_deleted: {
    icon: PackageX,
    tone: "bg-slate-100 text-slate-600 ring-slate-200",
    label: "Produk",
  },
  profile_updated: {
    icon: UserRound,
    tone: "bg-slate-100 text-slate-600 ring-slate-200",
    label: "Profil",
  },
  account_created: {
    icon: UserRound,
    tone: "bg-brand-50 text-brand-600 ring-brand-100",
    label: "Akun",
  },
};

export function getActivityMeta(type: ActivityType) {
  return meta[type];
}
