import type { Metadata } from "next";
import { ShopDashboard } from "@/features/shop/dashboard";

export const metadata: Metadata = {
  title: "Dashboard Warung",
};

export default function ShopDashboardPage() {
  return <ShopDashboard />;
}
