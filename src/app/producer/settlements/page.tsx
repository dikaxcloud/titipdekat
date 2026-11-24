import type { Metadata } from "next";
import { SettlementsView } from "@/features/shared/settlements-view";

export const metadata: Metadata = {
  title: "Settlement Produsen",
};

export default function ProducerSettlementsPage() {
  return <SettlementsView role="producer" />;
}
