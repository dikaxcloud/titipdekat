import type { Metadata } from "next";
import { ProducerDashboard } from "@/features/producer/dashboard";

export const metadata: Metadata = {
  title: "Dashboard Produsen",
};

export default function ProducerDashboardPage() {
  return <ProducerDashboard />;
}
