import type { Metadata } from "next";
import { HistoryView } from "@/features/shared/history-view";

export const metadata: Metadata = {
  title: "Riwayat Warung",
};

export default function ShopHistoryPage() {
  return <HistoryView role="shop" />;
}
