"use client";

import { usePathname, useRouter } from "next/navigation";
import { Bell, Check, ChevronDown, LogOut, Menu, RotateCcw, UserRound } from "lucide-react";
import { toast } from "sonner";
import { getActivityMeta } from "@/components/shared/activity-meta";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCurrentBusiness } from "@/hooks/use-current-business";
import { getPageTitle } from "@/lib/navigation";
import { useDemoStore } from "@/lib/store";
import { cn, getInitials, relativeDayLabel } from "@/lib/utils";
import type { Role } from "@/types";

interface TopbarProps {
  role: Role;
  onOpenMenu: () => void;
  onResetDemo: () => void;
}

export function Topbar({ role, onOpenMenu, onResetDemo }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const business = useCurrentBusiness();
  const activities = useDemoStore((state) => state.activities);
  const loginAs = useDemoStore((state) => state.loginAs);
  const logout = useDemoStore((state) => state.logout);

  const scopedActivities = activities
    .filter((activity) =>
      role === "producer"
        ? activity.producerId === business?.id
        : activity.shopId === business?.id,
    )
    .slice(0, 6);

  const switchRole = (target: Role) => {
    if (target === role) return;
    const result = loginAs(target);
    if (!result.ok) {
      toast.error(result.error ?? "Gagal berganti role demo.");
      return;
    }
    toast.success(
      target === "producer"
        ? "Masuk sebagai Produsen (demo)"
        : "Masuk sebagai Pemilik Warung (demo)",
    );
    router.push(`/${target}/dashboard`);
  };

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMenu}
          className="flex size-10 items-center justify-center rounded-xl border border-line bg-white text-ink shadow-sm lg:hidden"
          aria-label="Buka menu navigasi"
        >
          <Menu className="size-5" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-base font-bold text-ink sm:text-lg">
            {getPageTitle(pathname)}
          </p>
          <p className="hidden truncate text-xs text-muted sm:block">
            {business?.businessName ?? "TitipDekat"} ·{" "}
            {role === "producer" ? "Akun Produsen" : "Akun Warung"}
          </p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="hidden items-center gap-2 rounded-xl border border-line bg-white px-3 py-2 text-xs font-semibold text-ink shadow-sm transition-colors hover:bg-mist sm:flex"
            >
              <span className="size-2 rounded-full bg-brand-500" />
              Mode Demo
              <ChevronDown className="size-3.5 text-muted" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Ganti role demo</DropdownMenuLabel>
            <DropdownMenuItem onSelect={() => switchRole("producer")}>
              <span className="flex size-8 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
                <UserRound className="size-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">Produsen</span>
                <span className="block text-[11px] text-muted">
                  Dapur Bu Sari
                </span>
              </span>
              {role === "producer" && <Check className="size-4 text-brand-600" />}
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => switchRole("shop")}>
              <span className="flex size-8 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                <UserRound className="size-4" />
              </span>
              <span className="flex-1">
                <span className="block text-sm font-semibold">Pemilik Warung</span>
                <span className="block text-[11px] text-muted">
                  Warung Berkah Jaya
                </span>
              </span>
              {role === "shop" && <Check className="size-4 text-brand-600" />}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onResetDemo}>
              <RotateCcw className="size-4" />
              Reset data demo
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="relative flex size-10 items-center justify-center rounded-xl border border-line bg-white text-ink shadow-sm transition-colors hover:bg-mist"
              aria-label="Notifikasi aktivitas"
            >
              <Bell className="size-[18px]" />
              {scopedActivities.length > 0 && (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-brand-500 ring-2 ring-white" />
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[320px] p-0">
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-bold text-ink">Aktivitas terbaru</p>
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-bold text-brand-700">
                {scopedActivities.length}
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto p-1.5">
              {scopedActivities.length === 0 && (
                <p className="px-3 py-6 text-center text-sm text-muted">
                  Belum ada aktivitas.
                </p>
              )}
              {scopedActivities.map((activity) => {
                const meta = getActivityMeta(activity.type);
                const Icon = meta.icon;
                return (
                  <DropdownMenuItem
                    key={activity.id}
                    className="items-start gap-3 py-2.5"
                    onSelect={() => router.push(`/${role}/history`)}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg ring-1",
                        meta.tone,
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-xs font-semibold text-ink">
                        {activity.title}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-muted">
                        {relativeDayLabel(activity.timestamp)}
                      </span>
                    </span>
                  </DropdownMenuItem>
                );
              })}
            </div>
            <div className="border-t border-line p-1.5">
              <DropdownMenuItem
                className="justify-center text-xs font-semibold text-brand-700"
                onSelect={() => router.push(`/${role}/history`)}
              >
                Lihat semua riwayat
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex size-10 items-center justify-center rounded-xl bg-brand-600 text-xs font-bold text-white shadow-sm transition-colors hover:bg-brand-700"
              aria-label="Menu akun"
            >
              {getInitials(business?.businessName ?? "TD")}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel className="normal-case tracking-normal">
              <span className="block text-sm font-bold text-ink">
                {business?.businessName}
              </span>
              <span className="block text-[11px] font-medium text-muted">
                {business?.email}
              </span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onSelect={() => router.push(`/${role}/profile`)}
            >
              <UserRound className="size-4" />
              Profil usaha
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={onResetDemo}>
              <RotateCcw className="size-4" />
              Reset data demo
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
              onSelect={() => {
                logout();
                toast.success("Anda telah keluar");
                router.push("/login");
              }}
            >
              <LogOut className="size-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
