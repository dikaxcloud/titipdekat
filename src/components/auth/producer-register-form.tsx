"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, UserPlus } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useHydrated } from "@/hooks/use-hydrated";
import { CITIES, PRODUCER_BUSINESS_TYPES } from "@/lib/constants";
import { useDemoStore } from "@/lib/store";

const producerSchema = z
  .object({
    businessName: z
      .string()
      .min(3, "Nama usaha minimal 3 karakter.")
      .max(80, "Nama usaha maksimal 80 karakter."),
    businessType: z.string().min(1, "Pilih jenis usaha."),
    ownerName: z.string().min(3, "Nama pemilik minimal 3 karakter."),
    phone: z
      .string()
      .min(8, "Nomor telepon minimal 8 karakter.")
      .regex(/^[0-9+\-\s()]+$/, "Nomor telepon hanya boleh berisi angka dan tanda +, -, ()."),
    email: z.string().email("Format email tidak valid."),
    address: z.string().min(8, "Alamat usaha minimal 8 karakter."),
    city: z.string().min(1, "Pilih kota usaha."),
    password: z.string().min(6, "Password minimal 6 karakter."),
    confirmPassword: z.string().min(1, "Ulangi password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  });

type ProducerValues = z.infer<typeof producerSchema>;

export function ProducerRegisterForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useDemoStore((state) => state.session);
  const registerProducer = useDemoStore((state) => state.registerProducer);
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ProducerValues>({
    resolver: zodResolver(producerSchema),
    defaultValues: {
      businessName: "",
      businessType: "",
      ownerName: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (hydrated && session?.role === "producer") {
      router.replace("/producer/dashboard");
    }
  }, [hydrated, session, router]);

  const onSubmit = async (values: ProducerValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const result = await registerProducer({
      businessName: values.businessName,
      businessType: values.businessType,
      ownerName: values.ownerName,
      phone: values.phone,
      email: values.email,
      address: values.address,
      city: values.city,
      password: values.password,
    });

    if (!result.ok) {
      form.setError("email", {
        message: result.error ?? "Pendaftaran gagal. Coba lagi.",
      });
      return;
    }

    toast.success("Akun produsen berhasil dibuat", {
      description: "Selamat datang di dashboard TitipDekat.",
    });
    router.push("/producer/dashboard");
  };

  const rootError = form.formState.errors.root?.message;
  const isSubmitting = form.formState.isSubmitting;

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className="rounded-2xl border border-line bg-white p-5 shadow-sm sm:p-7"
      noValidate
    >
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">
            Data usaha produsen
          </h2>
          <p className="mt-1 text-sm text-muted">
            Lengkapi informasi usaha dan akun pemilik.
          </p>
        </div>
        <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-700">
          Gratis
        </span>
      </div>

      {rootError && (
        <Alert variant="danger" className="mb-5">
          <AlertDescription>{rootError}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label="Nama usaha/perusahaan"
          htmlFor="businessName"
          required
          error={form.formState.errors.businessName?.message}
          className="sm:col-span-2"
        >
          <Input
            id="businessName"
            placeholder="Contoh: Dapur Bu Sari"
            {...form.register("businessName")}
          />
        </FormField>

        <FormField
          label="Jenis usaha"
          htmlFor="businessType"
          required
          error={form.formState.errors.businessType?.message}
        >
          <Controller
            control={form.control}
            name="businessType"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="businessType">
                  <SelectValue placeholder="Pilih jenis usaha" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCER_BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Nama pemilik"
          htmlFor="ownerName"
          required
          error={form.formState.errors.ownerName?.message}
        >
          <Input
            id="ownerName"
            placeholder="Nama lengkap pemilik"
            {...form.register("ownerName")}
          />
        </FormField>

        <FormField
          label="Nomor telepon"
          htmlFor="phone"
          required
          error={form.formState.errors.phone?.message}
        >
          <Input
            id="phone"
            inputMode="tel"
            placeholder="0812-3456-7890"
            {...form.register("phone")}
          />
        </FormField>

        <FormField
          label="Email"
          htmlFor="email"
          required
          error={form.formState.errors.email?.message}
        >
          <Input
            id="email"
            type="email"
            placeholder="nama@usaha.id"
            {...form.register("email")}
          />
        </FormField>

        <FormField
          label="Kota usaha"
          htmlFor="city"
          required
          error={form.formState.errors.city?.message}
        >
          <Controller
            control={form.control}
            name="city"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="city">
                  <SelectValue placeholder="Pilih kota" />
                </SelectTrigger>
                <SelectContent>
                  {CITIES.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </FormField>

        <FormField
          label="Alamat usaha"
          htmlFor="address"
          required
          error={form.formState.errors.address?.message}
          className="sm:col-span-2"
        >
          <Input
            id="address"
            placeholder="Jalan, nomor, kelurahan, kecamatan"
            {...form.register("address")}
          />
        </FormField>
      </div>

      <div className="my-6 h-px bg-line" />

      <div>
        <h3 className="font-display text-base font-bold text-ink">
          Akun pemilik
        </h3>
        <p className="mt-0.5 text-xs text-muted">
          Digunakan untuk masuk ke dashboard produsen.
        </p>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <FormField
          label="Password"
          htmlFor="password"
          required
          error={form.formState.errors.password?.message}
          hint="Minimal 6 karakter."
        >
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Buat password"
              autoComplete="new-password"
              className="pr-16"
              {...form.register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2 py-1 text-[11px] font-semibold text-brand-700 hover:bg-brand-50"
            >
              {showPassword ? "Sembunyikan" : "Tampilkan"}
            </button>
          </div>
        </FormField>

        <FormField
          label="Konfirmasi password"
          htmlFor="confirmPassword"
          required
          error={form.formState.errors.confirmPassword?.message}
        >
          <Input
            id="confirmPassword"
            type={showPassword ? "text" : "password"}
            placeholder="Ulangi password"
            autoComplete="new-password"
            {...form.register("confirmPassword")}
          />
        </FormField>
      </div>

      <Button
        type="submit"
        size="lg"
        className="mt-6 w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Membuat akun…
          </>
        ) : (
          <>
            <UserPlus className="size-4" />
            Daftar sebagai Produsen
          </>
        )}
      </Button>

      <p className="mt-4 text-center text-xs text-muted">
        Sudah punya akun?{" "}
        <Link
          href="/login"
          className="font-semibold text-brand-700 hover:text-brand-800"
        >
          Masuk di sini
        </Link>
      </p>
    </form>
  );
}
