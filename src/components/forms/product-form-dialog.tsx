"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, PackagePlus, Save } from "lucide-react";
import { ProductThumb } from "@/components/shared/product-thumb";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FormField } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { PRODUCT_CATEGORIES, PRODUCT_EMOJIS } from "@/lib/constants";
import { useDemoStore } from "@/lib/store";
import { cn, formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

const productSchema = z.object({
  name: z
    .string()
    .min(2, "Nama produk minimal 2 karakter.")
    .max(80, "Nama produk maksimal 80 karakter."),
  category: z.string().min(1, "Pilih kategori produk."),
  description: z
    .string()
    .min(10, "Deskripsi minimal 10 karakter.")
    .max(500, "Deskripsi maksimal 500 karakter."),
  price: z
    .string()
    .min(1, "Harga jual wajib diisi.")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 500,
      "Harga jual minimal Rp 500.",
    )
    .refine(
      (value) => Number(value) <= 10_000_000,
      "Harga jual maksimal Rp 10.000.000.",
    ),
  emoji: z.string().min(1, "Pilih ikon produk."),
  image: z
    .union([z.string().url("URL gambar tidak valid."), z.literal("")])
    .optional(),
  status: z.enum(["active", "inactive"]),
});

type ProductValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
}: ProductFormDialogProps) {
  const createProduct = useDemoStore((state) => state.createProduct);
  const updateProduct = useDemoStore((state) => state.updateProduct);
  const [pending, setPending] = useState(false);
  const isEditing = Boolean(product);

  const form = useForm<ProductValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "Camilan",
      description: "",
      price: "",
      emoji: "🍪",
      image: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      name: product?.name ?? "",
      category: product?.category ?? "Camilan",
      description: product?.description ?? "",
      price: product ? String(product.price) : "",
      emoji: product?.emoji ?? "🍪",
      image: product?.image ?? "",
      status: product?.status ?? "active",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, product?.id]);

  const name = useWatch({ control: form.control, name: "name" });
  const emoji = useWatch({ control: form.control, name: "emoji" });
  const image = useWatch({ control: form.control, name: "image" });
  const price = Number(useWatch({ control: form.control, name: "price" })) || 0;
  const category = useWatch({ control: form.control, name: "category" });
  const status = useWatch({ control: form.control, name: "status" });

  const onSubmit = async (values: ProductValues) => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    const payload = {
      name: values.name.trim(),
      category: values.category,
      description: values.description.trim(),
      price: Number(values.price),
      emoji: values.emoji,
      image: values.image?.trim() || undefined,
      status: values.status,
    };

    if (isEditing && product) {
      updateProduct(product.id, payload);
      toast.success("Produk diperbarui", {
        description: `${payload.name} berhasil disimpan.`,
      });
    } else {
      createProduct(payload);
      toast.success("Produk ditambahkan", {
        description: `${payload.name} kini tersedia di katalog Anda.`,
      });
    }
    setPending(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit produk" : "Tambah produk baru"}
          </DialogTitle>
          <DialogDescription>
            Informasi produk akan digunakan saat membuat penawaran ke warung
            mitra.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
          noValidate
        >
          {form.formState.errors.root?.message && (
            <Alert variant="danger">
              <AlertDescription>
                {form.formState.errors.root.message}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3">
            <ProductThumb
              name={name || "Produk baru"}
              emoji={emoji}
              image={image?.trim() || undefined}
              size="lg"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-ink">
                {name || "Nama produk"}
              </p>
              <p className="text-xs text-muted">
                {category} · {formatCurrency(price)}
              </p>
            </div>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                status === "active"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-line bg-mist text-muted",
              )}
            >
              {status === "active" ? "Aktif" : "Nonaktif"}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              label="Nama produk"
              htmlFor="name"
              required
              error={form.formState.errors.name?.message}
              className="sm:col-span-2"
            >
              <Input
                id="name"
                placeholder="Contoh: Keripik Pisang Pedas"
                {...form.register("name")}
              />
            </FormField>

            <FormField
              label="Kategori"
              htmlFor="category"
              required
              error={form.formState.errors.category?.message}
            >
              <Controller
                control={form.control}
                name="category"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      {PRODUCT_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label="Harga jual (Rp)"
              htmlFor="price"
              required
              error={form.formState.errors.price?.message}
              hint="Harga yang dibayar pelanggan warung."
            >
              <Input
                id="price"
                type="number"
                min={500}
                step={500}
                inputMode="numeric"
                placeholder="12000"
                {...form.register("price")}
              />
            </FormField>

            <FormField
              label="Deskripsi"
              htmlFor="description"
              required
              error={form.formState.errors.description?.message}
              className="sm:col-span-2"
            >
              <Textarea
                id="description"
                rows={3}
                placeholder="Jelaskan isi, ukuran kemasan, dan masa simpan produk."
                {...form.register("description")}
              />
            </FormField>
          </div>

          <FormField
            label="Ikon produk"
            htmlFor="emoji"
            required
            error={form.formState.errors.emoji?.message}
          >
            <Controller
              control={form.control}
              name="emoji"
              render={({ field }) => (
                <div
                  id="emoji"
                  className="grid grid-cols-6 gap-2 rounded-xl border border-line bg-canvas/50 p-2 sm:grid-cols-12"
                >
                  {PRODUCT_EMOJIS.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => field.onChange(option)}
                      aria-pressed={field.value === option}
                      className={cn(
                        "flex aspect-square items-center justify-center rounded-lg text-xl transition-colors",
                        field.value === option
                          ? "bg-brand-100 ring-2 ring-brand-400"
                          : "hover:bg-white",
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            />
          </FormField>

          <FormField
            label="URL gambar (opsional)"
            htmlFor="image"
            error={form.formState.errors.image?.message}
            hint="Kosongkan untuk memakai ikon produk. Prototype tidak mengunggah file."
          >
            <Input
              id="image"
              type="url"
              placeholder="https://contoh.com/gambar-produk.jpg"
              {...form.register("image")}
            />
          </FormField>

          <Controller
            control={form.control}
            name="status"
            render={({ field }) => (
              <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white p-4">
                <div>
                  <p className="text-sm font-semibold text-ink">
                    Produk aktif
                  </p>
                  <p className="text-xs text-muted">
                    Produk nonaktif tidak dapat dipilih saat membuat penawaran
                    baru.
                  </p>
                </div>
                <Switch
                  checked={field.value === "active"}
                  onCheckedChange={(checked) =>
                    field.onChange(checked ? "active" : "inactive")
                  }
                  aria-label="Status produk aktif"
                />
              </div>
            )}
          />

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={pending}
            >
              Batal
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : isEditing ? (
                <Save className="size-4" />
              ) : (
                <PackagePlus className="size-4" />
              )}
              {isEditing ? "Simpan perubahan" : "Tambah produk"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
