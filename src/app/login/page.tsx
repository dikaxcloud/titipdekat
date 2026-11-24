import type { Metadata } from "next";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Masuk",
};

export default function LoginPage() {
  return (
    <AuthShell
      eyebrow="Masuk ke TitipDekat"
      title="Kelola konsinyasi dengan tenang, dari mana saja."
      description="Pantau penawaran, stok titipan, penjualan, komisi, dan settlement dalam satu catatan bersama antara produsen dan warung."
    >
      <LoginForm />
    </AuthShell>
  );
}
