import type { Role } from "@/types";

export interface DemoAccountInfo {
  role: Role;
  label: string;
  businessName: string;
  email: string;
  description: string;
}

export const DEMO_ACCOUNTS: DemoAccountInfo[] = [
  {
    role: "producer",
    label: "Produsen",
    businessName: "Dapur Bu Sari",
    email: "producer@titipdekat.demo",
    description: "Kelola produk, penawaran, pengiriman, dan settlement.",
  },
  {
    role: "shop",
    label: "Pemilik Warung",
    businessName: "Warung Berkah Jaya",
    email: "shop@titipdekat.demo",
    description: "Terima titipan, catat penjualan, dan selesaikan pembayaran.",
  },
];

export { DEMO_PASSWORD_HASH } from "@/lib/auth/password";
