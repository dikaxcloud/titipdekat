import type { Metadata } from "next";
import { DashboardShell } from "@/components/layout/dashboard-shell";

// Dashboard content is gated by client-side hydration of localStorage demo data,
// so it intentionally cannot guarantee an instant server-rendered UI.
export const instant = false;

export const metadata: Metadata = {
  title: "Dashboard Warung",
};

export default function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="shop">{children}</DashboardShell>;
}
