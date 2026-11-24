"use client";

import { createBrowserClient } from "@supabase/ssr";
import { assertSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

type BrowserClient = ReturnType<typeof createBrowserClient>;

let browserClient: BrowserClient | null = null;

/** Client Supabase untuk komponen client. Tidak memakai service role key. */
export function getSupabaseBrowserClient(): BrowserClient {
  assertSupabaseConfigured();
  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return browserClient;
}
