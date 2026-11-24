"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  Crosshair,
  Loader2,
  MapPin,
  Navigation,
  Store,
  Trash2,
} from "lucide-react";
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
import { CITIES, SHOP_BUSINESS_TYPES } from "@/lib/constants";
import { useDemoStore } from "@/lib/store";

const shopSchema = z
  .object({
    businessName: z
      .string()
      .min(3, "Nama warung/toko minimal 3 karakter.")
      .max(80, "Nama warung/toko maksimal 80 karakter."),
    ownerName: z.string().min(3, "Nama pemilik minimal 3 karakter."),
    businessType: z.string().min(1, "Pilih jenis usaha."),
    phone: z
      .string()
      .min(8, "Nomor telepon minimal 8 karakter.")
      .regex(/^[0-9+\-\s()]+$/, "Nomor telepon hanya boleh berisi angka dan tanda +, -, ()."),
    email: z.string().email("Format email tidak valid."),
    address: z.string().min(8, "Alamat lengkap minimal 8 karakter."),
    city: z.string().min(1, "Pilih kota warung."),
    password: z.string().min(6, "Password minimal 6 karakter."),
    confirmPassword: z.string().min(1, "Ulangi password."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Konfirmasi password tidak sama.",
  });

type ShopValues = z.infer<typeof shopSchema>;

interface SimulatedLocation {
  label: string;
  latitude: number;
  longitude: number;
}

export function ShopRegisterForm() {
  const router = useRouter();
  const hydrated = useHydrated();
  const session = useDemoStore((state) => state.session);
  const registerShop = useDemoStore((state) => state.registerShop);
  const [showPassword, setShowPassword] = useState(false);
  const [location, setLocation] = useState<SimulatedLocation | null>(null);

  const form = useForm<ShopValues>({
    resolver: zodResolver(shopSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      businessType: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (hydrated && session?.role === "shop") {
      router.replace("/shop/dashboard");
    }
  }, [hydrated, session, router]);

  const useSimulatedLocation = () => {
    setLocation({
      label: "Sukamaju, Bandung",
      latitude: -6.8974,
      longitude: 107.5896,
    });
    if (!form.getValues("city")) {
      form.setValue("city", "Bandung", { shouldValidate: true });
    }
    toast.success("Lokasi simulasi dipilih", {
      description:
        "Pin ditempatkan di Sukamaju, Bandung. Integrasi Google Maps belum aktif.",
    });
  };

  const onSubmit = async (values: ShopValues) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const result = await registerShop({
      businessName: values.businessName,
      ownerName: values.ownerName,
      businessType: values.businessType,
      phone: values.phone,
      email: values.email,
      address: values.address,
      city: values.city,
      password: values.password,
      locationLabel: location?.label ?? values.city,
      latitude: location?.latitude,
      longitude: location?.longitude,
    });

    if (!result.ok) {
      form.setError("email", {
        message: result.error ?? "Pendaftaran gagal. Coba lagi.",
      });
      return;
    }

    toast.success("Akun warung berhasil dibuat", {
      description: "Selamat datang di dashboard TitipDekat.",
    });
    router.push("/shop/dashboard");
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
            Data warung/toko
          </h2>
          <p className="mt-1 text-sm text-muted">
            Lengkapi profil warung agar produsen mudah menemukan Anda.
          </p>
        </div>
        <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
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
          label="Nama warung/toko"
          htmlFor="businessName"
          required
          error={form.formState.errors.businessName?.message}
          className="sm:col-span-2"
        >
          <Input
            id="businessName"
            placeholder="Contoh: Warung Berkah Jaya"
            {...form.register("businessName")}
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
                  {SHOP_BUSINESS_TYPES.map((type) => (
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
          label="Nomor telepon"
          htmlFor="phone"
          required
          error={form.formState.errors.phone?.message}
        >
          <Input
            id="phone"
            inputMode="tel"
            placeholder="0821-9988-7766"
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
            placeholder="warung@usaha.id"
            {...form.register("email")}
          />
        </FormField>

        <FormField
          label="Kota"
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
          label="Alamat lengkap"
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

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-ink">Lokasi warung</p>
            <p className="text-xs text-muted">
              Placeholder pemilihan lokasi, belum terhubung Google Maps.
            </p>
          </div>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
            Simulasi
          </span>
        </div>

        <div className="relative h-48 overflow-hidden rounded-xl border border-line bg-mist">
          <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
          <div
            className="absolute left-[18%] top-0 h-full w-2 bg-white/70"
            aria-hidden="true"
          />
          <div
            className="absolute left-0 top-[62%] h-2 w-full bg-white/70"
            aria-hidden="true"
          />
          <div
            className="absolute left-[68%] top-0 h-full w-1.5 bg-white/50"
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-brand-100/20 to-transparent" />

          {location ? (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="relative flex size-12 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-white">
                <MapPin className="size-6" />
                <span className="absolute inset-0 animate-ping rounded-full bg-brand-400/40" />
              </span>
              <span className="mt-2 block rounded-lg bg-white px-2.5 py-1 text-[11px] font-bold text-ink shadow-sm">
                {location.label}
              </span>
            </div>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
              <span className="flex size-11 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm ring-1 ring-line">
                <MapPin className="size-5" />
              </span>
              <p className="mt-2 text-xs font-semibold text-ink">
                Belum ada lokasi dipilih
              </p>
              <p className="mt-0.5 max-w-xs text-[11px] leading-relaxed text-muted">
                Gunakan tombol di bawah untuk mensimulasikan pemilihan lokasi
                warung.
              </p>
            </div>
          )}
        </div>

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={useSimulatedLocation}
          >
            <Crosshair className="size-3.5" />
            Gunakan lokasi saat ini
          </Button>
          {location && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setLocation(null)}
            >
              <Trash2 className="size-3.5" />
              Hapus lokasi
            </Button>
          )}
          {location && (
            <span className="inline-flex items-center gap-1 text-[11px] text-muted">
              <Navigation className="size-3 text-brand-600" />
              {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
            </span>
          )}
        </div>
      </div>

      <div className="my-6 h-px bg-line" />

      <div>
        <h3 className="font-display text-base font-bold text-ink">Akun pemilik</h3>
        <p className="mt-0.5 text-xs text-muted">
          Digunakan untuk masuk ke dashboard warung.
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
            <Store className="size-4" />
            Daftar sebagai Pemilik Warung
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
