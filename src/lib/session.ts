const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const SESSION_COOKIE = "admin_session";
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionPayload = {
  sub: string;
  exp: number;
};

function getSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || process.env.ADMIN_PASSWORD || "";
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlToBytes(value: string): Uint8Array {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function hmac(data: string, secret: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(data));
  return new Uint8Array(signature);
}

export async function constantTimeEqual(
  a: string,
  b: string
): Promise<boolean> {
  const [digestA, digestB] = await Promise.all([
    crypto.subtle.digest("SHA-256", encoder.encode(a)),
    crypto.subtle.digest("SHA-256", encoder.encode(b)),
  ]);
  const x = new Uint8Array(digestA);
  const y = new Uint8Array(digestB);
  let diff = 0;
  for (let i = 0; i < x.length; i++) {
    diff |= x[i] ^ y[i];
  }
  return diff === 0;
}

export async function createSession(): Promise<string> {
  const secret = getSecret();
  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }
  const payload: SessionPayload = {
    sub: "admin",
    exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000,
  };
  const encoded = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = bytesToBase64Url(await hmac(encoded, secret));
  return `${encoded}.${signature}`;
}

export async function verifySession(
  token: string | undefined | null
): Promise<boolean> {
  if (!token) return false;
  const secret = getSecret();
  if (!secret) return false;

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return false;

  const expected = bytesToBase64Url(await hmac(encoded, secret));
  if (!(await constantTimeEqual(signature, expected))) return false;

  try {
    const payload = JSON.parse(
      decoder.decode(base64UrlToBytes(encoded))
    ) as SessionPayload;
    return typeof payload.exp === "number" && payload.exp > Date.now();
  } catch {
    return false;
  }
}
