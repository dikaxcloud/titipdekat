"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, PackagePlus, Truck } from "lucide-react";
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

const deliverySchema = z.object({
  offerId: z.string().min(1, "Pilih penawaran yang sudah diterima."),
  quantity: z
    .string()
    .min(1, "Jumlah wajib diisi.")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) > 0,
      "Jumlah harus bilangan bulat lebih dari 0.",
    ),
  note: z.string().max(300, "Catatan maksimal 300 karakter.").optional(),
});

type DeliveryValues = z.infer<typeof deliverySchema>;

interface DeliveryFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  producerId: string;
  offerId?: string;
}

export function DeliveryFormDialog({
  open,
  onOpenChange,
  producerId,
  offerId,
}: DeliveryFormDialogProps) {
  const data = useDemoData();
  const createDelivery = useDemoStore((state) => state.createDelivery);
  const [pending, setPending] = useState(false);

  const availableOffers = data.offers.filter(
    (offer) =>
      offer.producerId === producerId &&
      offer.status === "accepted" &&
      !data.deliveries.some((delivery) => delivery.offerId === offer.id),
  );

  const form = useForm<DeliveryValues>({
    resolver: zodResolver(deliverySchema),
    defaultValues: { offerId: "", quantity: "", note: "" },
  });

  useEffect(() => {
    if (!open) return;
    const preselected = availableOffers.find((offer) => offer.id === offerId);
    const first = preselected ?? availableOffers[0];
    form.reset({
      offerId: first?.id ?? "",
      quantity: first ? String(first.quantity) : "",
      note: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, offerId]);

  const selectedOfferId = useWatch({
    control: form.control,
    name: "offerId",
  });
  const selectedOffer = availableOffers.find(
    (offer) => offer.id === selectedOfferId,
  );
  const selectedProduct = selectedOffer
    ? data.products.find((product) => product.id === selectedOffer.productId)
    : undefined;
  const selectedShop = selectedOffer
    ? data.businesses.find((business) => business.id === selectedOffer.shopId)
    : undefined;
  const quantity = Number(useWatch({ control: form.control, name: "quantity" })) || 0;
  const gross = selectedOffer ? quantity * selectedOffer.price : 0;
  const commission = selectedOffer
    ? Math.round(gross * (selectedOffer.commissionRate / 100))
    : 0;

  const onSubmit = async (values: DeliveryValues) => {
    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    const result = createDelivery({
      offerId: values.offerId,
      quantity: Number(values.quantity),
      note: values.note?.trim() || undefined,
    });
    setPending(false);

    if (!result.ok || !result.code) {
      form.setError("root", {
        message:
          result.error ??
          "Pengiriman gagal dicatat. Pastikan penawaran sudah diterima dan belum memiliki pengiriman.",
      });
      return;
    }

    toast.success(`Pengiriman ${result.code} dicatat`, {
      description:
        "Tandai sebagai dikirim agar warung dapat mengonfirmasi penerimaan.",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Catat pengiriman</DialogTitle>
          <DialogDescription>
            Pilih penawaran yang sudah diterima warung, lalu catat jumlah barang
            yang dikirim.
          </DialogDescription>
        </DialogHeader>

        {availableOffers.length === 0 ? (
          <Alert variant="warning">
            <AlertDescription>
              Belum ada penawaran diterima yang belum dikirim. Minta warung
              menerima penawaran terlebih dahulu, atau periksa daftar
              pengiriman yang sudah ada.
            </AlertDescription>
          </Alert>
        ) : (
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

            <FormField
              label="Penawaran diterima"
              htmlFor="offerId"
              required
              error={form.formState.errors.offerId?.message}
            >
              <Controller
                control={form.control}
                name="offerId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={(value) => {
                      field.onChange(value);
                      const offer = availableOffers.find(
                        (item) => item.id === value,
                      );
                      if (offer) form.setValue("quantity", String(offer.quantity));
                    }}
                  >
                    <SelectTrigger id="offerId">
                      <SelectValue placeholder="Pilih penawaran" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableOffers.map((offer) => {
                        const product = data.products.find(
                          (item) => item.id === offer.productId,
                        );
                        const shop = data.businesses.find(
                          (item) => item.id === offer.shopId,
                        );
                        return (
                          <SelectItem key={offer.id} value={offer.id}>
                            {offer.code} · {product?.name ?? "Produk"} →{" "}
                            {shop?.businessName ?? "Warung"}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {selectedOffer && (
              <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3">
                <ProductThumb
                  name={selectedProduct?.name ?? "Produk"}
                  emoji={selectedProduct?.emoji ?? "📦"}
                  image={selectedProduct?.image}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {selectedProduct?.name ?? "Produk"}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {selectedShop?.businessName ?? "Warung"} · disepakati{" "}
                    {selectedOffer.quantity} pcs ·{" "}
                    {formatCurrency(selectedOffer.price)}/pcs
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                  {selectedOffer.code}
                </span>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Jumlah dikirim (pcs)"
                htmlFor="quantity"
                required
                error={form.formState.errors.quantity?.message}
                hint="Boleh berbeda jika pengiriman tidak penuh."
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

              <div className="rounded-xl border border-line bg-mist/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                  Estimasi nilai
                </p>
                <p className="mt-1 font-display text-base font-extrabold text-ink">
                  {formatCurrency(gross)}
                </p>
                <p className="text-[10px] text-muted">
                  Komisi mitra {selectedOffer?.commissionRate ?? 0}% ·{" "}
                  {formatCurrency(commission)}
                </p>
              </div>
            </div>

            <FormField
              label="Catatan pengiriman"
              htmlFor="note"
              error={form.formState.errors.note?.message}
              hint="Opsional, misalnya kurir, jam pengiriman, atau kondisi kemasan."
            >
              <Textarea
                id="note"
                rows={3}
                placeholder="Contoh: Diantar langsung sore ini oleh produsen."
                {...form.register("note")}
              />
            </FormField>

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
                ) : (
                  <Truck className="size-4" />
                )}
                Catat pengiriman
              </Button>
            </DialogFooter>
          </form>
        )}

        {availableOffers.length === 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <PackagePlus className="size-4" />
              Tutup
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
