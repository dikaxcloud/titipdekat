import type { Role } from "@/types";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Server-side authorization untuk operasi sensitif.
 *
 * Identitas selalu berasal dari Supabase Auth yang tervalidasi di server.
 * Role dan businessId DIBACA dari tabel profiles di database, bukan dari
 * body request, localStorage, atau JWT metadata yang dikirim client.
 */

export interface AuthenticatedIdentity {
  userId: string;
  businessId: string;
  role: Role;
}

export async function getAuthenticatedIdentity(): Promise<AuthenticatedIdentity | null> {
  const supabase = await getSupabaseServerClient();
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) return null;

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (profileError || !profile) return null;
  if (profile.role !== "producer" && profile.role !== "shop") return null;

  return {
    userId: authData.user.id,
    businessId: profile.id,
    role: profile.role,
  };
}

export async function requireAuthenticated(): Promise<AuthenticatedIdentity> {
  const identity = await getAuthenticatedIdentity();
  if (!identity) throw new Error("Sesi tidak valid. Silakan masuk kembali.");
  return identity;
}

export async function requireRole(role: Role): Promise<AuthenticatedIdentity> {
  const identity = await requireAuthenticated();
  if (identity.role !== role) {
    throw new Error("Anda tidak memiliki hak untuk operasi ini.");
  }
  return identity;
}

/**
 * Memastikan identitas yang tervalidasi adalah pemilik data yang disentuh.
 * Jangan pernah menerima businessId/role dari client untuk operasi sensitif.
 */
export async function assertOwnsBusiness(
  businessIdFromRequest: string,
): Promise<AuthenticatedIdentity> {
  const identity = await requireAuthenticated();
  if (identity.businessId !== businessIdFromRequest) {
    throw new Error("Akses ditolak: data bukan milik akun Anda.");
  }
  return identity;
}
