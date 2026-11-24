"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  CheckCircle2,
  Package,
  Pencil,
  Plus,
  SearchX,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { ProductFormDialog } from "@/components/forms/product-form-dialog";
import { PageHeader } from "@/components/shared/page-header";
import { ProductThumb } from "@/components/shared/product-thumb";
import { SearchInput } from "@/components/shared/search-input";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { StatCard } from "@/components/shared/stat-card";
import { ProductStatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import { getProductStockSummary } from "@/lib/calculations";
import { useDemoStore } from "@/lib/store";
import {
  formatCurrency,
  formatDate,
  formatNumber,
} from "@/lib/utils";
import type { Product } from "@/types";

const statusFilters = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Nonaktif" },
];

export function ProducerProducts() {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const deleteProduct = useDemoStore((state) => state.deleteProduct);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [status, setStatus] = useState("all");
  const [query, setQuery] = useState("");

  if (!business) return null;

  const products = [...data.products]
    .filter((product) => product.producerId === business.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const summaries = new Map(
    products.map((product) => [
      product.id,
      getProductStockSummary(data, product.id),
    ]),
  );
  const totalRemaining = Array.from(summaries.values()).reduce(
    (total, summary) => total + summary.remaining,
    0,
  );

  const options = statusFilters.map((item) => ({
    ...item,
    count:
      item.value === "all"
        ? products.length
        : products.filter((product) => product.status === item.value).length,
  }));

  const needle = query.trim().toLowerCase();
  const filtered = products.filter((product) => {
    const matchesStatus = status === "all" || product.status === status;
    const matchesQuery =
      !needle ||
      product.name.toLowerCase().includes(needle) ||
      product.category.toLowerCase().includes(needle) ||
      product.description.toLowerCase().includes(needle);
    return matchesStatus && matchesQuery;
  });

  const openCreate = () => {
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setFormOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    const result = deleteProduct(deleteTarget.id);
    if (result.removed) {
      toast.success("Produk dihapus", {
        description: `${deleteTarget.name} dihapus dari katalog.`,
      });
    } else if (result.deactivated) {
      toast.info("Produk dinonaktifkan", {
        description:
          "Produk sudah memiliki riwayat penawaran sehingga dinonaktifkan agar data tetap konsisten.",
      });
    }
    setDeleteTarget(null);
  };

  return (
    <div>
      <PageHeader
        eyebrow="Katalog produk"
        title="Produk"
        description="Kelola produk yang dapat Anda tawarkan ke warung mitra, lengkap dengan harga dan performa stoknya."
        actions={
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Tambah produk
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total produk"
          value={formatNumber(products.length)}
          hint="Seluruh produk di katalog"
          icon={Package}
          tone="blue"
        />
        <StatCard
          label="Produk aktif"
          value={formatNumber(
            products.filter((product) => product.status === "active").length,
          )}
          hint="Dapat dipilih saat membuat penawaran"
          icon={CheckCircle2}
          tone="emerald"
        />
        <StatCard
          label="Produk nonaktif"
          value={formatNumber(
            products.filter((product) => product.status === "inactive").length,
          )}
          hint="Disembunyikan dari penawaran baru"
          icon={SearchX}
          tone="amber"
        />
        <StatCard
          label="Stok tersisa di mitra"
          value={`${formatNumber(totalRemaining)} pcs`}
          hint="Gabungan seluruh batch titipan"
          icon={Boxes}
          tone="violet"
        />
      </div>

      <div className="mb-4 mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SegmentedFilter options={options} value={status} onChange={setStatus} />
        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Cari nama, kategori, atau deskripsi…"
          className="lg:w-72"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Package}
          title={
            products.length === 0 ? "Katalog masih kosong" : "Tidak ada hasil"
          }
          description={
            products.length === 0
              ? "Tambahkan produk pertama Anda agar dapat mulai menawarkan ke warung mitra."
              : "Coba ubah filter status atau kata kunci pencarian."
          }
          action={
            products.length === 0 ? (
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Tambah produk
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((product) => {
            const summary = summaries.get(product.id);
            const soldPercent =
              summary && summary.received > 0
                ? Math.round((summary.sold / summary.received) * 100)
                : 0;
            return (
              <Card key={product.id} className="flex flex-col">
                <CardContent className="flex flex-1 flex-col pt-5">
                  <div className="flex items-start gap-3">
                    <ProductThumb
                      name={product.name}
                      emoji={product.emoji}
                      image={product.image}
                      size="lg"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <p className="text-sm font-bold leading-snug text-ink">
                          {product.name}
                        </p>
                        <ProductStatusBadge status={product.status} />
                      </div>
                      <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-700">
                        {product.category}
                      </p>
                      <p className="mt-1 font-display text-lg font-extrabold text-ink">
                        {formatCurrency(product.price)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-3 line-clamp-3 flex-1 text-xs leading-relaxed text-muted">
                    {product.description}
                  </p>

                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-mist/70 px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                        Diterima
                      </p>
                      <p className="text-xs font-bold text-ink">
                        {formatNumber(summary?.received ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-mist/70 px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-muted">
                        Terjual
                      </p>
                      <p className="text-xs font-bold text-ink">
                        {formatNumber(summary?.sold ?? 0)}
                      </p>
                    </div>
                    <div className="rounded-lg bg-brand-50 px-2 py-1.5 text-center">
                      <p className="text-[9px] font-bold uppercase tracking-wide text-brand-700">
                        Sisa
                      </p>
                      <p className="text-xs font-bold text-brand-900">
                        {formatNumber(summary?.remaining ?? 0)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
                    <span>
                      {summary?.batches ?? 0} batch ·{" "}
                      {formatDate(product.createdAt, "d MMM yyyy")}
                    </span>
                    <span>{soldPercent}% terjual</span>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2 border-t border-line pt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openEdit(product)}
                    >
                      <Pencil className="size-3.5" />
                      Edit
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href="/producer/offers#baru">
                        <ArrowRight className="size-3.5" />
                        Tawarkan
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive-soft"
                      className="ml-auto"
                      onClick={() => setDeleteTarget(product)}
                    >
                      <Trash2 className="size-3.5" />
                      Hapus
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editing}
      />
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null);
        }}
        title="Hapus produk?"
        description={`${deleteTarget?.name ?? "Produk"} akan dihapus dari katalog. Jika sudah pernah digunakan pada penawaran, produk akan dinonaktifkan agar riwayat tetap utuh.`}
        confirmLabel="Hapus produk"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </div>
  );
}
