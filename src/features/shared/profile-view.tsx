"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import {
  BadgeCheck,
  CalendarDays,
  MapPin,
  Save,
  ShieldCheck,
  Sparkles,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { InfoRow } from "@/components/shared/info-row";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import {
  CITIES,
  PRODUCER_BUSINESS_TYPES,
  SHOP_BUSINESS_TYPES,
} from "@/lib/constants";
import { useDemoStore } from "@/lib/store";
import { formatDate, getInitials } from "@/lib/utils";
import type { Role } from "@/types";

const profileSchema = z.object({
  businessName: z
    .string()
    .min(3, "Nama usaha minimal 3 karakter.")
    .max(80, "Nama usaha maksimal 80 karakter."),
  ownerName: z.string().min(3, "Nama pemilik minimal 3 karakter."),
  businessType: z.string().min(1, "Pilih jenis usaha."),
  phone: z
    .string()
    .min(8, "Nomor telepon minimal 8 karakter.")
    .regex(
      /^[0-9+\-\s()]+$/,
      "Nomor telepon hanya boleh berisi angka dan tanda +, -, ().",
    ),
  email: z.string().email("Format email tidak valid."),
  address: z.string().min(8, "Alamat minimal 8 karakter."),
  city: z.string().min(1, "Pilih kota usaha."),
});

type ProfileValues = z.infer<typeof profileSchema>;

export function ProfileView({ role }: { role: Role }) {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const updateProfile = useDemoStore((state) => state.updateProfile);

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      businessName: "",
      ownerName: "",
      businessType: "",
      phone: "",
      email: "",
      address: "",
      city: "",
    },
  });

  useEffect(() => {
    if (!business) return;
    form.reset({
      businessName: business.businessName,
      ownerName: business.ownerName,
      businessType: business.businessType,
      phone: business.phone,
      email: business.email,
      address: business.address,
      city: business.city,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id]);

  if (!business) return null;

  const businessTypes =
    role === "producer" ? PRODUCER_BUSINESS_TYPES : SHOP_BUSINESS_TYPES;
  const products = data.products.filter(
    (product) => product.producerId === business.id,
  );
  const scopedOffers = data.offers.filter((offer) =>
    role === "producer"
      ? offer.producerId === business.id
      : offer.shopId === business.id,
  );

  const onSubmit = (values: ProfileValues) => {
    updateProfile({
      businessName: values.businessName.trim(),
      ownerName: values.ownerName.trim(),
      businessType: values.businessType,
      phone: values.phone.trim(),
      email: values.email.trim(),
      address: values.address.trim(),
      city: values.city,
    });
    toast.success("Profil usaha diperbarui", {
      description: "Perubahan langsung terlihat pada dashboard dan penawaran.",
    });
  };

  return (
    <div>
      <PageHeader
        eyebrow="Pengaturan akun"
        title="Profil usaha"
        description="Perbarui informasi usaha yang digunakan pada penawaran, pengiriman, dan settlement."
      />

      <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Informasi usaha</CardTitle>
            <CardDescription>
              Data ini terlihat oleh mitra saat Anda bertransaksi.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label={role === "producer" ? "Nama usaha" : "Nama warung"}
                  htmlFor="businessName"
                  required
                  error={form.formState.errors.businessName?.message}
                  className="sm:col-span-2"
                >
                  <Input id="businessName" {...form.register("businessName")} />
                </FormField>

                <FormField
                  label="Nama pemilik"
                  htmlFor="ownerName"
                  required
                  error={form.formState.errors.ownerName?.message}
                >
                  <Input id="ownerName" {...form.register("ownerName")} />
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
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger id="businessType">
                          <SelectValue placeholder="Pilih jenis usaha" />
                        </SelectTrigger>
                        <SelectContent>
                          {businessTypes.map((type) => (
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
                    {...form.register("phone")}
                  />
                </FormField>

                <FormField
                  label="Email"
                  htmlFor="email"
                  required
                  error={form.formState.errors.email?.message}
                  hint="Email juga digunakan untuk masuk."
                >
                  <Input id="email" type="email" {...form.register("email")} />
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
                      <Select value={field.value} onValueChange={field.onChange}>
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
                  <Input id="address" {...form.register("address")} />
                </FormField>
              </div>

              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    form.reset({
                      businessName: business.businessName,
                      ownerName: business.ownerName,
                      businessType: business.businessType,
                      phone: business.phone,
                      email: business.email,
                      address: business.address,
                      city: business.city,
                    })
                  }
                >
                  Batalkan perubahan
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  <Save className="size-4" />
                  Simpan profil
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="overflow-hidden">
            <div className="relative bg-brand-900 p-5 text-white">
              <div
                className="pointer-events-none absolute inset-0 bg-grid opacity-[0.08]"
                aria-hidden="true"
              />
              <div className="relative flex items-center gap-3">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/15 text-base font-bold">
                  {getInitials(business.businessName)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-base font-bold">
                    {business.businessName}
                  </p>
                  <p className="text-xs text-brand-100/75">
                    {role === "producer" ? "Akun Produsen" : "Akun Warung"}
                  </p>
                </div>
              </div>
              <div className="relative mt-4 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-brand-100">
                {role === "producer" ? (
                  <UtensilsCrossed className="size-3" />
                ) : (
                  <Store className="size-3" />
                )}
                {business.businessType}
              </div>
            </div>
            <CardContent className="space-y-2.5 pt-5">
              <InfoRow label="Email" value={business.email} />
              <InfoRow label="Telepon" value={business.phone} />
              <InfoRow
                label="Kota"
                value={business.city}
              />
              <InfoRow
                label="Bergabung"
                value={formatDate(business.joinedAt, "d MMMM yyyy")}
              />
              <div className="!mt-4 flex items-start gap-2 rounded-xl bg-mist/70 p-3 text-[11px] leading-relaxed text-muted">
                <ShieldCheck className="mt-0.5 size-4 shrink-0 text-brand-600" />
                <p>
                  Profil ini hanya tersimpan di browser pada prototype. Pada
                  tahap produksi, data akan disimpan di Supabase dengan autentikasi
                  yang aman.
                </p>
              </div>
            </CardContent>
          </Card>

          {role === "shop" ? (
            <Card>
              <CardHeader className="flex-row items-start justify-between gap-3">
                <div>
                  <CardTitle>Lokasi warung</CardTitle>
                  <CardDescription>
                    Titik lokasi untuk pencocokan produsen terdekat.
                  </CardDescription>
                </div>
                <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                  Simulasi
                </span>
              </CardHeader>
              <CardContent>
                <div className="relative h-36 overflow-hidden rounded-xl border border-line bg-mist">
                  <div className="absolute inset-0 bg-grid opacity-60" aria-hidden="true" />
                  <div className="absolute left-[24%] top-0 h-full w-2 bg-white/70" aria-hidden="true" />
                  <div className="absolute left-0 top-[58%] h-2 w-full bg-white/70" aria-hidden="true" />
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-100/30 to-transparent" />
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <span className="relative flex size-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-lg ring-4 ring-white">
                      <MapPin className="size-5" />
                    </span>
                    <span className="mt-1.5 block rounded-lg bg-white px-2 py-0.5 text-[10px] font-bold text-ink shadow-sm">
                      {business.locationLabel ?? business.city}
                    </span>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <InfoRow
                    label="Label lokasi"
                    value={business.locationLabel ?? "Belum diatur"}
                  />
                  <InfoRow
                    label="Koordinat"
                    value={
                      business.latitude && business.longitude
                        ? `${business.latitude.toFixed(4)}, ${business.longitude.toFixed(4)}`
                        : "Belum ada pin"
                    }
                  />
                </div>
                <p className="mt-3 flex items-start gap-1.5 text-[11px] leading-relaxed text-muted">
                  <Sparkles className="mt-0.5 size-3.5 shrink-0 text-brand-500" />
                  Pemilihan lokasi pada prototype masih disimulasikan. Integrasi
                  Google Maps direncanakan pada tahap berikutnya.
                </p>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Ringkasan katalog</CardTitle>
                <CardDescription>
                  Produk dan penawaran yang terkait dengan usaha Anda.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <InfoRow
                  label="Total produk"
                  value={`${products.length} produk`}
                />
                <InfoRow
                  label="Produk aktif"
                  value={`${products.filter((product) => product.status === "active").length} produk`}
                />
                <InfoRow
                  label="Total penawaran"
                  value={`${scopedOffers.length} penawaran`}
                />
                <div className="!mt-4 flex items-start gap-2 rounded-xl bg-brand-50/70 p-3 text-[11px] leading-relaxed text-brand-800">
                  <BadgeCheck className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Menjaga profil tetap akurat membantu warung mengenali produk
                    dan mempermudah proses settlement.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="flex items-start gap-3 pt-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-mist text-muted">
                <CalendarDays className="size-4" />
              </span>
              <div>
                <p className="text-xs font-bold text-ink">Akun demo</p>
                <p className="mt-0.5 text-[11px] leading-relaxed text-muted">
                  Perubahan profil dapat dikembalikan ke kondisi awal melalui
                  tombol “Reset data demo” di sidebar.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
