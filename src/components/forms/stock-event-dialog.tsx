"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { ClipboardCheck } from "lucide-react";
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
import { STOCK_EVENT_LABELS } from "@/lib/constants";
import { buildStockLots } from "@/lib/calculations";
import { useDemoStore } from "@/lib/store";
import { formatCurrency, formatDateInput } from "@/lib/utils";

const stockEventSchema = z.object({
  deliveryId: z.string().min(1, "Pilih batch titipan."),
  type: z.enum(["sold", "returned", "damaged", "expired"]),
  quantity: z
    .string()
    .min(1, "Jumlah wajib diisi.")
    .refine(
      (value) => Number.isInteger(Number(value)) && Number(value) > 0,
      "Jumlah harus bilangan bulat lebih dari 0.",
    ),
  date: z.string().min(1, "Pilih tanggal transaksi."),
  note: z.string().max(200, "Catatan maksimal 200 karakter.").optional(),
});

type StockEventValues = z.infer<typeof stockEventSchema>;

interface StockEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shopId: string;
  preset?: {
    deliveryId?: string;
    productId?: string;
    producerId?: string;
  };
}

export function StockEventDialog({
  open,
  onOpenChange,
  shopId,
  preset,
}: StockEventDialogProps) {
  const data = useDemoData();
  const recordStockEvent = useDemoStore((state) => state.recordStockEvent);

  const lots = buildStockLots(data.deliveries, data.stockEvents, data.offers)
    .filter(
      (lot) =>
        lot.shopId === shopId &&
        lot.remaining > 0 &&
        (!preset?.deliveryId || lot.deliveryId === preset.deliveryId) &&
        (!preset?.productId || lot.productId === preset.productId) &&
        (!preset?.producerId || lot.producerId === preset.producerId),
    )
    .map((lot) => {
      const delivery = data.deliveries.find((item) => item.id === lot.deliveryId);
      const product = data.products.find((item) => item.id === lot.productId);
      const producer = data.businesses.find(
        (item) => item.id === lot.producerId,
      );
      return {
        ...lot,
        code: delivery?.code ?? "-",
        productName: product?.name ?? "Produk",
        productEmoji: product?.emoji ?? "📦",
        productImage: product?.image,
        producerName: producer?.businessName ?? "Produsen",
      };
    });

  const form = useForm<StockEventValues>({
    resolver: zodResolver(stockEventSchema),
    defaultValues: {
      deliveryId: "",
      type: "sold",
      quantity: "1",
      date: formatDateInput(),
      note: "",
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      deliveryId: lots[0]?.deliveryId ?? "",
      type: "sold",
      quantity: "1",
      date: formatDateInput(),
      note: "",
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, preset?.deliveryId, preset?.productId, preset?.producerId]);

  const selectedDeliveryId = useWatch({
    control: form.control,
    name: "deliveryId",
  });
  const selectedLot = lots.find((lot) => lot.deliveryId === selectedDeliveryId);
  const type = useWatch({ control: form.control, name: "type" });
  const quantity = Number(useWatch({ control: form.control, name: "quantity" })) || 0;
  const gross = selectedLot ? quantity * selectedLot.price : 0;
  const commission = selectedLot
    ? Math.round(gross * (selectedLot.commissionRate / 100))
    : 0;

  const onSubmit = async (values: StockEventValues) => {
    const qty = Number(values.quantity);
    const lot = lots.find((item) => item.deliveryId === values.deliveryId);

    if (lot && qty > lot.remaining) {
      form.setError("quantity", {
        message: `Stok batch ini hanya ${lot.remaining} pcs.`,
      });
      return;
    }

    const result = recordStockEvent({
      deliveryId: values.deliveryId,
      type: values.type,
      quantity: qty,
      date: values.date,
      note: values.note?.trim() || undefined,
    });

    if (!result.ok) {
      form.setError("root", {
        message: result.error ?? "Transaksi gagal dicatat.",
      });
      return;
    }

    toast.success(`${STOCK_EVENT_LABELS[values.type]} dicatat`, {
      description: `${qty} pcs ${lot?.productName ?? "produk"} pada batch ${
        lot?.code ?? ""
      }.`,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Catat pergerakan stok</DialogTitle>
          <DialogDescription>
            Catat penjualan, retur, kerusakan, atau kedaluwarsa pada batch
            titipan tertentu.
          </DialogDescription>
        </DialogHeader>

        {lots.length === 0 ? (
          <Alert variant="warning">
            <AlertDescription>
              Tidak ada batch titipan dengan sisa stok. Konfirmasi penerimaan
              pengiriman terlebih dahulu, atau pilih produk lain.
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
              label="Batch titipan"
              htmlFor="deliveryId"
              required
              error={form.formState.errors.deliveryId?.message}
            >
              <Controller
                control={form.control}
                name="deliveryId"
                render={({ field }) => (
                  <Select
                    value={field.value || undefined}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id="deliveryId">
                      <SelectValue placeholder="Pilih batch" />
                    </SelectTrigger>
                    <SelectContent>
                      {lots.map((lot) => (
                        <SelectItem key={lot.deliveryId} value={lot.deliveryId}>
                          {lot.code} · {lot.productName} · sisa {lot.remaining} pcs
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </FormField>

            {selectedLot && (
              <div className="flex items-center gap-3 rounded-xl border border-line bg-canvas/60 p-3">
                <ProductThumb
                  name={selectedLot.productName}
                  emoji={selectedLot.productEmoji}
                  image={selectedLot.productImage}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-ink">
                    {selectedLot.productName}
                  </p>
                  <p className="truncate text-xs text-muted">
                    {selectedLot.producerName} · sisa {selectedLot.remaining} dari{" "}
                    {selectedLot.received} pcs
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs font-bold text-ink">
                    {formatCurrency(selectedLot.price)}
                  </p>
                  <p className="text-[10px] text-muted">
                    komisi {selectedLot.commissionRate}%
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                label="Jenis transaksi"
                htmlFor="type"
                required
                error={form.formState.errors.type?.message}
              >
                <Controller
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="type">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {(
                          Object.keys(STOCK_EVENT_LABELS) as Array<
                            keyof typeof STOCK_EVENT_LABELS
                          >
                        ).map((key) => (
                          <SelectItem key={key} value={key}>
                            {STOCK_EVENT_LABELS[key]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </FormField>

              <FormField
                label="Jumlah (pcs)"
                htmlFor="quantity"
                required
                error={form.formState.errors.quantity?.message}
                hint={
                  selectedLot ? `Maksimal ${selectedLot.remaining} pcs.` : undefined
                }
              >
                <Input
                  id="quantity"
                  type="number"
                  min={1}
                  max={selectedLot?.remaining}
                  step={1}
                  inputMode="numeric"
                  {...form.register("quantity")}
                />
              </FormField>

              <FormField
                label="Tanggal transaksi"
                htmlFor="date"
                required
                error={form.formState.errors.date?.message}
              >
                <Input
                  id="date"
                  type="date"
                  max={formatDateInput()}
                  {...form.register("date")}
                />
              </FormField>

              <div className="rounded-xl border border-line bg-mist/60 p-3">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">
                  {type === "sold" ? "Nilai penjualan" : "Nilai stok keluar"}
                </p>
                <p className="mt-1 font-display text-base font-extrabold text-ink">
                  {formatCurrency(gross)}
                </p>
                <p className="text-[10px] text-muted">
                  {type === "sold"
                    ? `Komisi ${formatCurrency(commission)} · hak produsen ${formatCurrency(gross - commission)}`
                    : "Tidak dihitung sebagai penjualan."}
                </p>
              </div>
            </div>

            <FormField
              label="Catatan"
              htmlFor="stock-note"
              error={form.formState.errors.note?.message}
              hint="Opsional, misalnya nama pembeli atau kondisi barang."
            >
              <Textarea
                id="stock-note"
                rows={3}
                placeholder="Contoh: Terjual 3 pcs ke pelanggan langganan."
                {...form.register("note")}
              />
            </FormField>

            <DialogFooter className="mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Batal
              </Button>
              <Button type="submit">
                <ClipboardCheck className="size-4" />
                Simpan transaksi
              </Button>
            </DialogFooter>
          </form>
        )}

        {lots.length === 0 && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Tutup
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
