import type { Metadata } from "next";
import { HistoryView } from "@/features/shared/history-view";

export const metadata: Metadata = {
  title: "Riwayat Produsen",
};

export default function ProducerHistoryPage() {
  return <HistoryView role="producer" />;
}
