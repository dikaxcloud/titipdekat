"use client";

import { useDemoStore } from "@/lib/store";
import type { DemoData } from "@/lib/calculations";
import type { Activity } from "@/types";

export function useDemoData(): DemoData & { activities: Activity[] } {
  const businesses = useDemoStore((state) => state.businesses);
  const products = useDemoStore((state) => state.products);
  const offers = useDemoStore((state) => state.offers);
  const deliveries = useDemoStore((state) => state.deliveries);
  const stockEvents = useDemoStore((state) => state.stockEvents);
  const settlements = useDemoStore((state) => state.settlements);
  const activities = useDemoStore((state) => state.activities);

  return {
    businesses,
    products,
    offers,
    deliveries,
    stockEvents,
    settlements,
    activities,
  };
}
