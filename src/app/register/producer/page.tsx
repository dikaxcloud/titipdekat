import type { Metadata } from "next";
import { UtensilsCrossed } from "lucide-react";
import { ProducerRegisterForm } from "@/components/auth/producer-register-form";
import { RegisterLayout } from "@/components/auth/register-layout";

export const metadata: Metadata = {
  title: "Registrasi Produsen",
};

export default function ProducerRegisterPage() {
  return (
    <RegisterLayout
      roleLabel="Produsen"
      title="Mulai titipkan produk Anda ke warung terdekat."
      description="Buat akun produsen untuk mengelola katalog, penawaran, pengiriman, dan pembayaran konsinyasi."
      icon={UtensilsCrossed}
      checklist={[
        "Nama usaha dan jenis produk yang diproduksi",
        "Nomor telepon dan email aktif",
        "Alamat usaha untuk kebutuhan administrasi",
        "Password untuk masuk ke dashboard",
      ]}
    >
      <ProducerRegisterForm />
    </RegisterLayout>
  );
}
