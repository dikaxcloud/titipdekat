import type { Metadata } from "next";
import { ProducerDeliveries } from "@/features/producer/deliveries";

export const metadata: Metadata = {
  title: "Pengiriman Produsen",
};

export default function ProducerDeliveriesPage() {
  return <ProducerDeliveries />;
}
