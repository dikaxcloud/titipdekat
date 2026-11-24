"use client";

import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Role } from "@/types";

/**
 * Autentikasi Sungguhan. Masih belum dipanggil UI sampai mode live aktif.
 * Semua kredensial berasal dari Supabase Auth; tidak ada password lokal.
 */

export interface AuthRegistrationInput {
  email: string;
  password: string;
  businessName: string;
  ownerName: string;
  businessType: string;
  phone: string;
  address: string;
  city: string;
  role: Role;
  locationLabel?: string;
  latitude?: number;
  longitude?: number;
}

export async function signInWithPassword(email: string, password: string) {
  const client = getSupabaseBrowserClient();
  return client.auth.signInWithPassword({ email, password });
}

export async function signUpWithPassword(input: AuthRegistrationInput) {
  const client = getSupabaseBrowserClient();
  const { data, error } = await client.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        business_name: input.businessName,
        owner_name: input.ownerName,
        business_type: input.businessType,
        phone: input.phone,
        address: input.address,
        city: input.city,
        role: input.role,
        location_label: input.locationLabel ?? null,
        latitude: input.latitude ?? null,
        longitude: input.longitude ?? null,
      },
    },
  });
  return { data, error };
}

/** Google OAuth diarahkan lewat provider Supabase Auth, bukan OAuth manual. */
export async function signInWithGoogle(nextPath = "/") {
  const client = getSupabaseBrowserClient();
  return client.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}` },
  });
}

export async function signOut() {
  const client = getSupabaseBrowserClient();
  return client.auth.signOut();
}

export async function getSession() {
  const client = getSupabaseBrowserClient();
  const { data, error } = await client.auth.getSession();
  return { session: data.session, error };
}

/**
 * Catatan: pembuatan baris `public.profiles` dilakukan oleh trigger
 * `on_auth_user_created` (0001_schema.sql), bukan oleh client, agar role
 * tidak bisa disunting pengguna.
 */
