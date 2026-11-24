import type { Metadata } from "next";
import { ShopOffers } from "@/features/shop/offers";

export const metadata: Metadata = {
  title: "Penawaran Masuk",
};

export default function ShopOffersPage() {
  return <ShopOffers />;
}
