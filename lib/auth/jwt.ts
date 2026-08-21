import { SignJWT, jwtVerify } from "jose";

/**
 * `jose` is Web Crypto based, so this module works in both the Node.js route
 * handlers and the Edge middleware. `jsonwebtoken` would not.
 */

export const SESSION_COOKIE = "hoe_session";
export const SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours — one working day

export type SessionPayload = {
  sub: string;
  email: string;
  role: "owner" | "editor";
  name: string;
};

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) {
    throw new Error("JWT_SECRET is missing or shorter than 32 characters");
  }
  return new TextEncoder().encode(value);
};

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(secret());
}

export async function verifySession(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return {
      sub: String(payload.sub),
      email: String(payload.email),
      role: payload.role === "owner" ? "owner" : "editor",
      name: String(payload.name ?? ""),
    };
  } catch {
    // Expired, tampered, or signed with a rotated secret — all the same to us.
    return null;
  }
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
