import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { assertSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "./config";

/** Client Supabase untuk Server Component / Route Handler. */
export async function getSupabaseServerClient() {
  assertSupabaseConfigured();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Server Component tidak boleh menulis cookie; refresh dilakukan
          // middleware (akan ditambahkan saat integrasi aktif).
        }
      },
    },
  });
}
