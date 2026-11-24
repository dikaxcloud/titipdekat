"use client";

import { useDemoStore } from "@/lib/store";

export function useCurrentBusiness() {
  const session = useDemoStore((state) => state.session);
  const businesses = useDemoStore((state) => state.businesses);

  if (!session) return null;
  return businesses.find((business) => business.id === session.businessId) ?? null;
}

export function useCurrentRole() {
  return useDemoStore((state) => state.session?.role ?? null);
}
