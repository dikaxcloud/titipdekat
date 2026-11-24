import { backendMode } from "@/lib/supabase/config";
import { mockAdapter } from "./mock-adapter";
import { supabaseAdapter } from "./supabase-adapter";
import type { DataService } from "./types";

/**
 * Titik pilihan adapter. Komponen mengimpor `dataService`, bukan adapter
 * langsung, sehingga perpindahan mock → live tidak mengubah UI.
 */
export const dataService: DataService =
  backendMode === "live" ? supabaseAdapter : mockAdapter;

export type { DataService } from "./types";
