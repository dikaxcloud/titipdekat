import type { Metadata } from "next";
import { Store } from "lucide-react";
import { RegisterLayout } from "@/components/auth/register-layout";
import { ShopRegisterForm } from "@/components/auth/shop-register-form";

export const metadata: Metadata = {
  title: "Registrasi Pemilik Warung",
};

export default function ShopRegisterPage() {
  return (
    <RegisterLayout
      roleLabel="Pemilik Warung"
      title="Buka peluang produk baru untuk pelanggan warung Anda."
      description="Buat akun warung untuk menerima penawaran titipan, mencatat penjualan, dan mengelola settlement dengan produsen."
      icon={Store}
      checklist={[
        "Nama warung dan jenis usaha",
        "Nomor telepon dan email aktif",
        "Alamat lengkap serta lokasi warung",
        "Password untuk masuk ke dashboard",
      ]}
    >
      <ShopRegisterForm />
    </RegisterLayout>
  );
}
