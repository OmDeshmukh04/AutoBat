import { createHmac, timingSafeEqual } from "node:crypto";

// Minimal dependency-free JWT (HS256). Enough for first-party auth in this app;
// swap for @nestjs/jwt or a managed provider later without changing callers.

const SECRET = process.env.JWT_ACCESS_SECRET ?? "dev-secret-change-me";
const ALG = { alg: "HS256", typ: "JWT" };

function b64url(input: Buffer | string): string {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function b64urlJson(obj: unknown): string {
  return b64url(JSON.stringify(obj));
}

function sign(data: string): string {
  return b64url(createHmac("sha256", SECRET).update(data).digest());
}

export type JwtPayload = {
  sub: string;
  role: string;
  orgId: string | null;
  exp: number;
};

export function signToken(
  payload: Omit<JwtPayload, "exp">,
  ttlSeconds = 60 * 60 * 24 * 7
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const body = b64urlJson({ ...payload, exp });
  const header = b64urlJson(ALG);
  const data = `${header}.${body}`;
  return `${data}.${sign(data)}`;
}

export function verifyToken(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  const [header, body, sig] = parts;
  const expected = sign(`${header}.${body}`);
  const a = Buffer.from(sig!);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;

  try {
    const payload = JSON.parse(
      Buffer.from(body!, "base64").toString("utf8")
    ) as JwtPayload;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}
