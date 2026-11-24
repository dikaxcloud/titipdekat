"use client";

import { useMemo, useState } from "react";
import { subDays } from "date-fns";
import { CalendarDays, History } from "lucide-react";
import { getActivityMeta } from "@/components/shared/activity-meta";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { SegmentedFilter } from "@/components/shared/segmented-filter";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { useDemoData } from "@/hooks/use-demo-data";
import { cn, formatDate } from "@/lib/utils";
import type { ActivityType, Role } from "@/types";

const categoryByType: Record<ActivityType, string> = {
  offer_created: "offer",
  offer_accepted: "offer",
  offer_rejected: "offer",
  offer_cancelled: "offer",
  delivery_created: "delivery",
  delivery_shipped: "delivery",
  delivery_received: "delivery",
  delivery_disputed: "delivery",
  sale_recorded: "sale",
  return_recorded: "sale",
  damage_recorded: "sale",
  expiry_recorded: "sale",
  settlement_submitted: "settlement",
  settlement_completed: "settlement",
  product_created: "product",
  product_updated: "product",
  product_deleted: "product",
  profile_updated: "profile",
  account_created: "profile",
};

const categories = [
  { value: "all", label: "Semua" },
  { value: "offer", label: "Penawaran" },
  { value: "delivery", label: "Pengiriman" },
  { value: "sale", label: "Penjualan & Stok" },
  { value: "settlement", label: "Settlement" },
  { value: "product", label: "Produk" },
  { value: "profile", label: "Profil" },
];

const dateRanges = [
  { value: "all", label: "Semua tanggal" },
  { value: "7", label: "7 hari terakhir" },
  { value: "30", label: "30 hari terakhir" },
  { value: "90", label: "90 hari terakhir" },
];

export function HistoryView({ role }: { role: Role }) {
  const business = useCurrentBusiness();
  const data = useDemoData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [range, setRange] = useState("all");

  const scoped = useMemo(
    () =>
      data.activities.filter((activity) =>
        role === "producer"
          ? activity.producerId === business?.id
          : activity.shopId === business?.id,
      ),
    [data.activities, role, business?.id],
  );

  const searched = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const cutoff =
      range === "all"
        ? null
        : subDays(new Date(), Number(range)).toISOString();
    return scoped.filter((activity) => {
      const matchesCategory =
        category === "all" || categoryByType[activity.type] === category;
      const matchesRange = !cutoff || activity.timestamp >= cutoff;
      const matchesQuery =
        !needle ||
        activity.title.toLowerCase().includes(needle) ||
        activity.description.toLowerCase().includes(needle) ||
        activity.actor.toLowerCase().includes(needle);
      return matchesCategory && matchesRange && matchesQuery;
    });
  }, [scoped, query, category, range]);

  const options = categories.map((item) => ({
    ...item,
    count:
      item.value === "all"
        ? scoped.length
        : scoped.filter(
            (activity) => categoryByType[activity.type] === item.value,
          ).length,
  }));

  const grouped = useMemo(() => {
    const map = new Map<string, typeof searched>();
    searched.forEach((activity) => {
      const key = formatDate(activity.timestamp, "yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(activity);
      map.set(key, list);
    });
    return Array.from(map.entries());
  }, [searched]);

  if (!business) return null;

  return (
    <div>
      <PageHeader
        eyebrow="Jejak audit"
        title="Riwayat aktivitas"
        description={`Seluruh perubahan pada data ${business.businessName}, dari penawaran sampai settlement, tercatat di sini.`}
      />

      <div className="mb-4 space-y-3">
        <SegmentedFilter
          options={options}
          value={category}
          onChange={setCategory}
          ariaLabel="Filter jenis aktivitas"
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted">
              <CalendarDays className="size-3.5" />
              Rentang
            </span>
            <SegmentedFilter
              options={dateRanges}
              value={range}
              onChange={setRange}
              ariaLabel="Filter rentang tanggal aktivitas"
            />
          </div>
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Cari aktivitas, produk, atau pelaku…"
            className="sm:w-64"
          />
        </div>
      </div>

      {grouped.length === 0 ? (
        <EmptyState
          icon={History}
          title="Tidak ada aktivitas"
          description={
            query || category !== "all" || range !== "all"
              ? "Coba ubah kata kunci, filter kategori, atau rentang tanggal."
              : "Aktivitas akan muncul setelah ada penawaran, pengiriman, atau transaksi."
          }
        />
      ) : (
        <div className="space-y-5">
          {grouped.map(([key, items]) => (
            <Card key={key} className="overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-line bg-mist/40 px-4 py-2.5">
                <p className="text-xs font-bold text-ink">
                  {formatDate(items[0].timestamp, "EEEE, d MMMM yyyy")}
                </p>
                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-muted ring-1 ring-line">
                  {items.length} aktivitas
                </span>
              </div>
              <div className="divide-y divide-line">
                {items.map((activity) => {
                  const meta = getActivityMeta(activity.type);
                  const Icon = meta.icon;
                  return (
                    <div
                      key={activity.id}
                      className="flex gap-3 px-4 py-3 transition-colors hover:bg-mist/30"
                    >
                      <span
                        className={cn(
                          "mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg ring-1",
                          meta.tone,
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-start justify-between gap-1.5">
                          <p className="text-sm font-semibold leading-snug text-ink">
                            {activity.title}
                          </p>
                          <span
                            className="shrink-0 text-[11px] font-medium text-muted"
                            title={formatDate(activity.timestamp, "d MMMM yyyy HH:mm")}
                          >
                            {formatDate(activity.timestamp, "HH:mm")}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted">
                          {activity.description}
                        </p>
                        <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[10px]">
                          <span className="rounded-full bg-mist px-2 py-0.5 font-semibold text-muted">
                            {meta.label}
                          </span>
                          <span className="text-muted">
                            oleh {activity.actor} ·{" "}
                            {activity.actorRole === "system"
                              ? "Sistem"
                              : activity.actorRole === "producer"
                                ? "Produsen"
                                : "Warung"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
