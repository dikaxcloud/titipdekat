/**
 * Konfigurasi Supabase.
 *
 * .env.example menjelaskan mengapa NEXT_PUBLIC_* dipakai di Next.js dan
 * VITE_* hanya menjadi fallback. Tidak ada secret yang boleh dibaca di sini.
 */
export const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";

export const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
  process.env.VITE_SUPABASE_ANON_KEY ??
  "";

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export type BackendMode = "mock" | "live";

export const backendMode: BackendMode =
  process.env.NEXT_PUBLIC_BACKEND_MODE === "live" && isSupabaseConfigured
    ? "live"
    : "mock";

export function assertSupabaseConfigured(): void {
  const exposedKey = [
    "NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY",
    "VITE_SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_SERVICE_ROLE_KEY",
    "VITE_SERVICE_ROLE_KEY",
  ].find((name) => Boolean(process.env[name]));
  if (exposedKey) {
    throw new Error(
      `Service role key tidak boleh berada di variabel ${exposedKey}. ` +
        "Hapus dari environment frontend.",
    );
  }
  if (!isSupabaseConfigured) {
    throw new Error(
      "Supabase belum dikonfigurasi. Isi NEXT_PUBLIC_SUPABASE_URL dan " +
        "NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local (lihat .env.example).",
    );
  }
}
