import type { Metadata } from "next";
import { ShopProducts } from "@/features/shop/products";

export const metadata: Metadata = {
  title: "Stok Titipan",
};

export default function ShopProductsPage() {
  return <ShopProducts />;
}
