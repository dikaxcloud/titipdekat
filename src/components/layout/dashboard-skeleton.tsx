import { LogoMark } from "@/components/brand/logo";
import { Skeleton } from "@/components/ui/skeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="hidden border-r border-line bg-white p-4 lg:block">
        <div className="flex items-center gap-2 px-2 py-3">
          <LogoMark />
          <Skeleton className="h-5 w-28" />
        </div>
        <Skeleton className="mt-4 h-20 w-full rounded-2xl" />
        <div className="mt-6 space-y-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </aside>
      <div>
        <div className="flex h-16 items-center justify-between border-b border-line px-6">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="size-10" />
            <Skeleton className="size-10" />
            <Skeleton className="size-10" />
          </div>
        </div>
        <div className="mx-auto max-w-[1400px] space-y-6 p-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32 rounded-2xl" />
            ))}
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
            <Skeleton className="h-80 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
