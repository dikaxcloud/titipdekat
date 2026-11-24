"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { DashboardSkeleton } from "@/components/layout/dashboard-skeleton";
import { MobileSidebar } from "@/components/layout/mobile-sidebar";
import { ResetDemoDialog } from "@/components/layout/reset-demo-dialog";
import { SidebarContent } from "@/components/layout/sidebar-content";
import { Topbar } from "@/components/layout/topbar";
import { useHydrated } from "@/hooks/use-hydrated";
import { getNavItems } from "@/lib/navigation";
import { useDemoStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

interface DashboardShellProps {
  role: Role;
  children: React.ReactNode;
}

export function DashboardShell({ role, children }: DashboardShellProps) {
  const hydrated = useHydrated();
  const session = useDemoStore((state) => state.session);
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    if (!session) {
      router.replace("/login");
      return;
    }
    if (session.role !== role) {
      router.replace(`/${session.role}/dashboard`);
    }
  }, [hydrated, session, role, router]);

  if (!hydrated || !session || session.role !== role) {
    return <DashboardSkeleton />;
  }

  const bottomNav = getNavItems(role).slice(0, 4);

  return (
    <div className="min-h-dvh bg-canvas lg:grid lg:grid-cols-[272px_1fr]">
      <aside className="sticky top-0 hidden h-dvh border-r border-line bg-white lg:block">
        <SidebarContent
          role={role}
          onResetDemo={() => setResetOpen(true)}
        />
      </aside>

      <div className="min-w-0">
        <Topbar
          role={role}
          onOpenMenu={() => setDrawerOpen(true)}
          onResetDemo={() => setResetOpen(true)}
        />
        <main className="mx-auto w-full max-w-[1400px] px-4 py-6 pb-28 sm:px-6 lg:px-8 lg:py-8 lg:pb-12">
          {children}
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden"
        aria-label="Navigasi bawah"
      >
        <div className="grid grid-cols-5">
          {bottomNav.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== `/${role}/dashboard` &&
                pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold transition-colors",
                  isActive ? "text-brand-700" : "text-muted",
                )}
              >
                <item.icon className="size-5" />
                {item.shortLabel}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-center gap-1 py-2.5 text-[10px] font-semibold text-muted"
          >
            <Menu className="size-5" />
            Menu
          </button>
        </div>
      </nav>

      <MobileSidebar
        role={role}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onResetDemo={() => setResetOpen(true)}
      />
      <ResetDemoDialog open={resetOpen} onOpenChange={setResetOpen} />
    </div>
  );
}
