"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { useHydrated } from "@/hooks/use-hydrated";
import { DEMO_ACCOUNTS } from "@/lib/demo-auth";
import { useDemoStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const loginSchema = z.object({
  identifier: z.string().min(1, "Masukkan email atau nomor telepon."),
  password: z.string().min(6, "Password minimal 6 karakter."),
});

type LoginValues = z.infer<typeof loginSchema>;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.6v3h3.9c2.3-2.1 3.5-5.2 3.5-8.8Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.2 0 5.9-1.1 7.9-2.9l-3.9-3c-1.1.7-2.4 1.2-4 1.2a7 7 0 0 1-6.6-4.8H1.4v3.1A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.4 14.5a7.2 7.2 0 0 1 0-5V6.4H1.4a12 12 0 0 0 0 10.2l4-2.1Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.8 0 3.4.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.4 6.4l4 3.1A7 7 0 0 1 12 4.8Z"
      />
    </svg>
  );
}

export function LoginForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useDemoStore((state) => state.session);
  const login = useDemoStore((state) => state.login);
  const loginAs = useDemoStore((state) => state.loginAs);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  useEffect(() => {
    if (hydrated && session) {
      router.replace(`/${session.role}/dashboard`);
    }
  }, [hydrated, session, router]);

  const onSubmit = async (values: LoginValues) => {
    await new Promise((resolve) => setTimeout(resolve, 350));
    const result = await login(values.identifier, values.password);
    if (!result.ok) {
      form.setError("root", {
        message: result.error ?? "Gagal masuk. Periksa kembali data Anda.",
      });
      return;
    }
    toast.success("Berhasil masuk", {
      description:
        result.role === "producer"
          ? "Selamat datang di dashboard produsen."
          : "Selamat datang di dashboard warung.",
    });
    router.push(`/${result.role}/dashboard`);
  };

  const quickLogin = (role: Role) => {
    const result = loginAs(role);
    if (!result.ok) {
      toast.error(result.error ?? "Akun demo tidak tersedia.");
      return;
    }
    toast.success(
      role === "producer"
        ? "Masuk sebagai Produsen (demo)"
        : "Masuk sebagai Pemilik Warung (demo)",
    );
    router.push(`/${role}/dashboard`);
  };

  const rootError = form.formState.errors.root?.message;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <div>
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-600">
          Masuk ke akun
        </p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink">
          Selamat Datang!
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Kelola konsinyasi produsen dan warung dalam satu tempat. Masuk untuk
          melanjutkan alur demo.
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {rootError && (
          <Alert variant="danger">
            <AlertDescription>{rootError}</AlertDescription>
          </Alert>
        )}

        <FormField
          label="Email atau nomor telepon"
          htmlFor="identifier"
          required
          error={form.formState.errors.identifier?.message}
        >
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              id="identifier"
              autoComplete="username"
              placeholder="nama@usaha.id atau 0812..."
              className="pl-10"
              {...form.register("identifier")}
            />
          </div>
        </FormField>

        <FormField
          label="Password"
          htmlFor="password"
          required
          error={form.formState.errors.password?.message}
        >
          <div className="relative">
            <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="Masukkan password"
              className="pl-10 pr-11"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-mist hover:text-ink"
              aria-label={
                showPassword ? "Sembunyikan password" : "Tampilkan password"
              }
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
        </FormField>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-xs font-semibold text-brand-700 hover:text-brand-800"
            onClick={() =>
              toast.info("Simulasi prototype", {
                description:
                  "Fitur lupa password belum terhubung ke email. Gunakan akun demo di bawah.",
              })
            }
          >
            Lupa password?
          </button>
          <span className="text-[11px] text-muted">Password demo: demo123</span>
        </div>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Memeriksa akun…
            </>
          ) : (
            <>
              Masuk
              <ArrowRight className="size-4" />
            </>
          )}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted">
          atau
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button
        type="button"
        variant="outline"
        size="lg"
        className="w-full"
        onClick={() =>
          toast.info("Simulasi UI login Google", {
            description:
              "Google OAuth belum terhubung pada tahap prototype frontend.",
          })
        }
      >
        <GoogleIcon />
        Masuk dengan Google
      </Button>

      <div className="mt-7 rounded-2xl border border-line bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-bold text-ink">Akun demo untuk juri</p>
          <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-brand-700">
            Siap pakai
          </span>
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Pilih role untuk langsung masuk tanpa mengisi form.
        </p>
        <div className="mt-3 grid gap-2">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.role}
              type="button"
              onClick={() => quickLogin(account.role)}
              className="group flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3 text-left transition-colors hover:border-brand-200 hover:bg-brand-50/60"
            >
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg ring-1",
                  account.role === "producer"
                    ? "bg-brand-50 text-brand-700 ring-brand-100"
                    : "bg-blue-50 text-blue-700 ring-blue-100",
                )}
              >
                {account.role === "producer" ? (
                  <UtensilsCrossed className="size-4" />
                ) : (
                  <Store className="size-4" />
                )}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold text-ink">
                  Masuk sebagai {account.label}
                </span>
                <span className="block truncate font-mono text-[10px] text-muted">
                  {account.email}
                </span>
              </span>
              <ArrowRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-brand-600" />
            </button>
          ))}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-muted">
        Belum punya akun?{" "}
        <Link
          href="/register"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}
