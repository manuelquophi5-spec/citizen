import { cookies } from "next/headers";
import type { UserRole } from "@/types/database";

export const SESSION_COOKIE_NAME = "tcp_session";

export interface SessionData {
  userId: string;
  name: string;
  email: string;
  role: UserRole;
  electoralArea?: string | null;
  skills?: string[] | null;
  exp?: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSecretKey(): string {
  return (
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "tcp-south-tongu-district-auth-secret-key-2026"
  );
}

function toBase64Url(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(str: string): Uint8Array {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function getHmacCryptoKey(secret: string): Promise<CryptoKey> {
  return await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically signed HMAC-SHA256 session token.
 */
export async function signSessionToken(payload: SessionData): Promise<string> {
  const secret = getSecretKey();
  const sessionWithExp: SessionData = {
    ...payload,
    exp: payload.exp || Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  };
  const jsonStr = JSON.stringify(sessionWithExp);
  const dataBytes = encoder.encode(jsonStr);
  const key = await getHmacCryptoKey(secret);
  const sigBuffer = await crypto.subtle.sign("HMAC", key, dataBytes);
  return `${toBase64Url(dataBytes)}.${toBase64Url(sigBuffer)}`;
}

/**
 * Verifies the cryptographic HMAC-SHA256 signature and expiration of a session token.
 * Returns null if the signature is invalid, tampered, or expired.
 */
export async function verifySessionToken(token: string): Promise<SessionData | null> {
  if (!token || typeof token !== "string") return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  try {
    const [b64Data, b64Sig] = parts;
    const secret = getSecretKey();
    const dataBytes = fromBase64Url(b64Data);
    const sigBytes = fromBase64Url(b64Sig);

    const key = await getHmacCryptoKey(secret);
    const isValid = await crypto.subtle.verify("HMAC", key, sigBytes, dataBytes);
    if (!isValid) return null;

    const jsonStr = decoder.decode(dataBytes);
    const payload = JSON.parse(jsonStr) as SessionData;

    // Reject expired sessions
    if (payload.exp && Date.now() > payload.exp) {
      return null;
    }

    // Ensure valid role invariant
    if (!["admin", "citizen", "volunteer"].includes(payload.role)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Retrieves the current authenticated session from HTTP cookies (Server-side).
 */
export async function getServerSession(): Promise<SessionData | null> {
  try {
    const cookieStore = cookies();
    const raw = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!raw) return null;
    return await verifySessionToken(raw);
  } catch {
    return null;
  }
}

/**
 * Requires an active session with the 'admin' role. Throws an error or returns the session.
 */
export async function requireAdminSession(): Promise<SessionData> {
  const session = await getServerSession();
  if (!session || session.role !== "admin") {
    throw new Error("Unauthorized: Official Administrator privileges required.");
  }
  return session;
}
