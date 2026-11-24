/**
 * Utility hanya untuk MOCK MODE.
 *
 * Production tidak memakai file ini: password ditangani sepenuhnya oleh
 * Supabase Auth. Di mock mode kita menyimpan digest SHA-256, bukan plaintext,
 * agar tidak ada kredensial terbaca di localStorage maupun activity events.
 *
 * Ini BUKAN pengganti Supabase Auth — hash sisi client tidak aman untuk
 * data sungguhan.
 */

const encoder = new TextEncoder();

export const DEMO_PASSWORD_HASH =
  "d3ad9315b7be5dd53b31a273b3b3aba5defe700808305aa16a3062b76658a791";

export async function hashPassword(value: string): Promise<string> {
  const digest = await globalThis.crypto.subtle.digest(
    "SHA-256",
    encoder.encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

/** Perbandingan konstan-waktu sederhana untuk mengurangi timing leak. */
function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

export async function verifyPassword(
  value: string,
  storedHash: string | undefined,
): Promise<boolean> {
  if (!storedHash) return false;
  return constantTimeEqual(await hashPassword(value), storedHash);
}
