import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getActivityMeta } from "@/components/shared/activity-meta";
import { EmptyState } from "@/components/ui/empty-state";
import { cn, relativeDayLabel } from "@/lib/utils";
import type { Activity } from "@/types";
import { History } from "lucide-react";

interface ActivityFeedProps {
  activities: Activity[];
  limit?: number;
  viewAllHref?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

export function ActivityFeed({
  activities,
  limit = 5,
  viewAllHref,
  emptyTitle = "Belum ada aktivitas",
  emptyDescription = "Aktivitas penawaran, pengiriman, dan penjualan akan muncul di sini.",
  className,
}: ActivityFeedProps) {
  const items = activities.slice(0, limit);

  if (items.length === 0) {
    return (
      <EmptyState
        icon={History}
        title={emptyTitle}
        description={emptyDescription}
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-1", className)}>
      {items.map((activity) => {
        const meta = getActivityMeta(activity.type);
        const Icon = meta.icon;
        return (
          <div
            key={activity.id}
            className="flex gap-3 rounded-xl px-1 py-2.5 transition-colors hover:bg-mist/60"
          >
            <span
              className={cn(
                "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1",
                meta.tone,
              )}
            >
              <Icon className="size-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <p className="text-sm font-semibold leading-snug text-ink">
                  {activity.title}
                </p>
                <span className="shrink-0 text-[11px] font-medium text-muted">
                  {relativeDayLabel(activity.timestamp)}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted">
                {activity.description}
              </p>
            </div>
          </div>
        );
      })}
      {viewAllHref && (
        <Link
          href={viewAllHref}
          className="mt-2 inline-flex items-center gap-1 px-1 text-xs font-semibold text-brand-700 hover:text-brand-800"
        >
          Lihat semua aktivitas
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </div>
  );
}
