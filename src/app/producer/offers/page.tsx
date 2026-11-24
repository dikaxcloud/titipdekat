import type { Metadata } from "next";
import { ProducerOffers } from "@/features/producer/offers";

export const metadata: Metadata = {
  title: "Penawaran Produsen",
};

export default function ProducerOffersPage() {
  return <ProducerOffers />;
}
