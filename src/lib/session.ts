const COOKIE_NAME = "team_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? process.env.TEAM_PASSWORD;
  if (!secret) {
    throw new Error("AUTH_SECRET or TEAM_PASSWORD must be set");
  }
  return secret;
}

async function hmac(value: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(value));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export async function createSessionToken() {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${expiresAt}`;
  const signature = await hmac(payload);
  return `${payload}.${signature}`;
}

export async function isValidSessionToken(token: string | undefined | null) {
  if (!token) return false;
  const [payload, signature] = token.split(".");
  if (!payload || !signature) return false;
  const expected = await hmac(payload);
  if (expected !== signature) return false;
  const expiresAt = Number(payload);
  if (!Number.isFinite(expiresAt) || Date.now() > expiresAt) return false;
  return true;
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
