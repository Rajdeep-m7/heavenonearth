import type { NextRequest } from "next/server";

/**
 * In-memory sliding window.
 *
 * Be clear about what this is: on serverless the map lives per container, so a
 * determined attacker hitting many cold containers gets more than `limit`
 * attempts. It stops casual spam, and the honeypot plus manual approval means
 * nothing reaches the site unreviewed either way.
 *
 * If real abuse shows up, swap the body of `rateLimit` for an Upstash Redis
 * call — the signature is designed not to change.
 */

type Entry = { hits: number[]; };

const globalStore = globalThis as typeof globalThis & {
  _hoeRateLimit?: Map<string, Entry>;
};

const store = (globalStore._hoeRateLimit ??= new Map<string, Entry>());

const MAX_KEYS = 5000;

export function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export function rateLimit(
  key: string,
  { limit, windowMs }: { limit: number; windowMs: number },
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const now = Date.now();
  const entry = store.get(key) ?? { hits: [] };

  entry.hits = entry.hits.filter((time) => now - time < windowMs);

  if (entry.hits.length >= limit) {
    const oldest = entry.hits[0];
    store.set(key, entry);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((windowMs - (now - oldest)) / 1000),
    };
  }

  entry.hits.push(now);
  store.set(key, entry);

  // Crude bound so a long-lived container cannot grow the map without limit.
  if (store.size > MAX_KEYS) {
    const cutoff = store.size - MAX_KEYS;
    let removed = 0;
    for (const mapKey of store.keys()) {
      if (removed++ >= cutoff) break;
      store.delete(mapKey);
    }
  }

  return {
    allowed: true,
    remaining: limit - entry.hits.length,
    retryAfterSeconds: 0,
  };
}
