"use client";

import { useEffect, useSyncExternalStore } from "react";
import { useDemoStore } from "@/lib/store";

function subscribe(onStoreChange: () => void) {
  return useDemoStore.persist.onFinishHydration(onStoreChange);
}

function getSnapshot() {
  return useDemoStore.persist.hasHydrated();
}

function getServerSnapshot() {
  return false;
}

export function useHydrated() {
  const hydrated = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (!useDemoStore.persist.hasHydrated()) {
      void useDemoStore.persist.rehydrate();
    }
  }, []);

  return hydrated;
}
