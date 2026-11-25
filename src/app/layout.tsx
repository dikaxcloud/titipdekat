import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: {
    default: "TitipDekat — Kelola Konsinyasi Lebih Dekat",
    template: "%s · TitipDekat",
  },
  description:
    "TitipDekat membantu produsen makanan rumahan dan pemilik warung mengelola konsinyasi secara transparan: penawaran, stok, penjualan, komisi, dan settlement dalam satu tempat.",
  applicationName: "TitipDekat",
  authors: [{ name: "Team Xcloud" }],
  keywords: [
    "konsinyasi",
    "titip jual",
    "produsen",
    "warung",
    "UMKM",
    "TitipDekat",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${jakarta.variable}`}
    >
      <body>
        {children}
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            style: {
              borderRadius: "14px",
              fontFamily: "var(--font-inter), sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
