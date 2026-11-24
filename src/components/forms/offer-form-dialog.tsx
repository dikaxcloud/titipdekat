"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Send, Sparkles } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { useDemoData } from "@/hooks/use-demo-data";
import { useDemoStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";

const offerSchema = z.object({
  shopId: z.string().min(1, "Pilih warung mitra."),
  productId: z.string().min(1, "Pilih produk yang akan ditawarkan."),
  quantity: z
    .string()
    .min(1, "Jumlah wajib diisi.")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) > 0,
      "Jumlah harus bilangan bulat lebih dari 0.",
    )
    .refine((value) => Number(value) <= 10000, "Jumlah maksimal 10.000 pcs."),
  price: z
    .string()
    .min(1, "Harga jual wajib diisi.")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) >= 500,
      "Harga jual minimal Rp 500.",
    ),
  commissionRate: z
    .string()
    .min(1, "Komisi mitra wajib diisi.")
    .refine(
      (value) => {
        const rate = Number(value);
        return Number.isFinite(rate) && rate >= 0 && rate <= 100;
      },
      "Komisi harus antara 0–100%.",
    ),
  note: z.string().max(300, "Catatan maksimal 300 karakter.").optional(),
});

type OfferValues = z.infer<typeof offerSchema>;

interface OfferFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producerId: string;
}

export function OfferFormDialog({
  open,
  onOpenChange,
  producerId,
}: OfferFormDialogProps) {
  const data = useDemoData();
  const createOffer = useDemoStore((state) => state.createOffer);
  const [pending, setPending] = useState(false);

  const shops = data.businesses.filter((business) => business.role === "shop");
  const products = data.products.filter(
    (product) => product.producerId === producerId && product.status === "active",
  );

  const form = useForm<OfferValues>({
    resolver: zodResolver(offerSchema),
    defaultValues: {
      shopId: "",
      productId: "",
      quantity: "20",
      price: "",
      commissionRate: "15",
      note: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    const firstProduct = products[0];
    form.reset({
      shopId: shops[0]?.id ?? "",
      productId: firstProduct?.id ?? "",
      quantity: "20",
      price: firstProduct ? String(firstProduct.price) : "",
      commissionRate: "15",
      note: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const productId = useWatch({ control: form.control, name: "productId" });
  const quantity = Number(useWatch({ control: form.control, name: "quantity" })) || 0;
  const price = Number(useWatch({ control: form.control, name: "price" })) || 0;
  const commissionRate =
    Number(useWatch({ control: form.control, name: "commissionRate" })) || 0;
  const selectedProduct = data.products.find(
    (product) => product.id === productId,
  );
  const gross = quantity * price;
  const commission = Math.round(gross * (commissionRate / 100));
  const net = gross - commission;

  const submit = async (asDraft: boolean) => {
    await form.handleSubmit(async (values) => {
      setPending(true);
      await new Promise((resolve) => setTimeout(resolve, 300));
      const code = createOffer(
        {
          shopId: values.shopId,
          productId: values.productId,
          quantity: Number(values.quantity),
          price: Number(values.price),
          commissionRate: Number(values.commissionRate),
          note: values.note?.trim() || undefined,
        },
        asDraft,
      );
      setPending(false);

      if (!code) {
        form.setError("root", {
          message: "Penawaran gagal dibuat. Periksa kembali data Anda.",
        });
        return;
      }

      toast.success(
        asDraft ? `Draft ${code} disimpan` : `Penawaran ${code} terkirim`,
        {
          description: asDraft
            ? "Anda dapat mengirim draft ini nanti dari daftar penawaran."
            : "Warung mitra akan menerima penawaran ini di dashboardnya.",
        },
      );
      form.reset();
      onOpenChange(false);
    })();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Buat penawaran baru</DialogTitle>
          <DialogDescription>
            Tawarkan produk Anda ke warung mitra dengan harga dan komisi yang
            disepakati.
          </DialogDescription>
        </DialogHeader>

        {shops.length === 0 || products.length === 0 ? (
          <Alert variant="warning">
            <AlertDescription>
              {products.length === 0
                ? "Belum ada produk aktif. Tambahkan produk terlebih dahulu di halaman Produk."
                : "Belum ada warung mitra yang tersedia pada data demo."}
            </AlertDescription>
          </Alert>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => event.preventDefault()}
            noValidate
          >
            {form.formState.errors.root?.message && (
              <Alert variant="danger">
                <AlertDescription>
                  {form.formState.errors.root.message}
                </AlertDescription>
              </Alert>
            )}

            <FormField
              label="Warung mitra"
              htmlFor="shopId"
              required
              error={form.formState.errors.shopId?.message}
            >
              <Controller
                control={form.control}
                name="shopId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="shopId">
                      <SelectValue placeholder="Pilih warung" />
                    </SelectTrigger>
                    <SelectContent>
                      {shops.map((shop) => (
                        <SelectItem key={shop.id} value={shop.id}>
                          {shop.businessName} · {shop.city}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            <FormField
              label="Produk"
              htmlFor="productId"
              required
              error={form.formState.errors.productId?.message}
            >
              <Controller
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const product = products.find((item) => item.id === value);
                      if (product) form.setValue("price", String(product.price));
                    }}
                  >
                    <SelectTrigger id="productId">
                      <SelectValue placeholder="Pilih produk" />
                    </SelectTrigger>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.emoji} {product.name} ·{" "}
                          {formatCurrency(product.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {selectedProduct && (
              <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3">
                <ProductThumb
                  name={selectedProduct.name}
                  emoji={selectedProduct.emoji}
                  image={selectedProduct.image}
                  size="sm"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-semibold text-ink">
                    {selectedProduct.name}
                  </p>
                  <p className="text-[11px] text-muted">
                    {selectedProduct.category} · Harga katalog{" "}
                    {formatCurrency(selectedProduct.price)}
                  </p>
                </div>
                <Sparkles className="size-4 text-brand-500" />
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Jumlah produk (pcs)"
                htmlFor="quantity"
                required
                error={form.formState.errors.quantity?.message}
              >
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  step={1}
                  inputMode="numeric"
                  {...form.register("quantity")}
                />
              </FormField>

              <FormField
                label="Harga jual per pcs"
                htmlFor="price"
                required
                error={form.formState.errors.price?.message}
              >
                <Input
                  id="price"
                  type="number"
                  min={500}
                  step={500}
                  inputMode="numeric"
                  {...form.register("price")}
                />
              </FormField>

              <FormField
                label="Komisi mitra (%)"
                htmlFor="commissionRate"
                required
                error={form.formState.errors.commissionRate?.message}
                hint="Persentase dari penjualan bruto."
              >
                <Input
                  id="commissionRate"
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  inputMode="numeric"
                  {...form.register("commissionRate")}
                />
              </FormField>

              <div className="rounded-xl border border-line bg-mist/60 p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Estimasi pembayaran
                </p>
                <p className="mt-1 font-display text-lg font-extrabold text-ink">
                  {formatCurrency(net)}
                </p>
                <p className="text-[10px] text-muted">
                  dari bruto {formatCurrency(gross)}
                </p>
              </div>
            </div>

            <FormField
              label="Catatan untuk warung"
              htmlFor="note"
              error={form.formState.errors.note?.message}
              hint="Opsional, misalnya instruksi display atau tanggal kedaluwarsa."
            >
              <Textarea
                id="note"
                rows={3}
                placeholder="Contoh: Mohon simpan di tempat sejuk dan jauh dari sinar matahari."
                {...form.register("note")}
              />
            </FormField>

            <div className="rounded-xl border border-brand-100 bg-brand-50/60 p-3">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-800/70">
                    Bruto
                  </p>
                  <p className="text-xs font-bold text-brand-900">
                    {formatCurrency(gross)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-800/70">
                    Komisi {commissionRate}%
                  </p>
                  <p className="text-xs font-bold text-brand-900">
                    {formatCurrency(commission)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-brand-800/70">
                    Hak produsen
                  </p>
                  <p className="text-xs font-bold text-brand-900">
                    {formatCurrency(net)}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={pending}
              >
                Batal
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => submit(true)}
                disabled={pending}
              >
                Simpan draft
              </Button>
              <Button type="button" onClick={() => submit(false)} disabled={pending}>
                {pending ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Send className="size-4" />
                )}
                Kirim penawaran
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
