import type { Metadata } from "next";
import { ShopSales } from "@/features/shop/sales";

export const metadata: Metadata = {
  title: "Penjualan & Stok",
};

export default function ShopSalesPage() {
  return <ShopSales />;
}
