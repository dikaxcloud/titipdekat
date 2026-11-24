import type { Metadata } from "next";
import { ProducerProducts } from "@/features/producer/products";

export const metadata: Metadata = {
  title: "Produk Produsen",
};

export default function ProducerProductsPage() {
  return <ProducerProducts />;
}
