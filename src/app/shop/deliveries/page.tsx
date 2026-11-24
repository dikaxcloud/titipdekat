import type { Metadata } from "next";
import { ShopDeliveries } from "@/features/shop/deliveries";

export const metadata: Metadata = {
  title: "Pengiriman Warung",
};

export default function ShopDeliveriesPage() {
  return <ShopDeliveries />;
}
