import type { Metadata } from "next";
import { SettlementsView } from "@/features/shared/settlements-view";

export const metadata: Metadata = {
  title: "Settlement Warung",
};

export default function ShopSettlementsPage() {
  return <SettlementsView role="shop" />;
}
