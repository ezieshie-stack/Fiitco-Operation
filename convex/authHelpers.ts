// ────────────────────────────────────────────────────────────────────────────
// Server-side auth + crypto helpers
// ────────────────────────────────────────────────────────────────────────────
// Single source of truth for:
//   - requireAuth / requireAdmin → session-token gate every privileged
//     query/mutation calls before doing anything sensitive
//   - hashPassword / verifyPassword → PBKDF2 via WebCrypto (Convex runtime
//     supports crypto.subtle natively, no extra dependency)
//   - hashAnswer / verifyAnswer → same hashing applied to security answers
//   - checkAndIncrementRateLimit → rolling-window throttle for brute-force
//     prone endpoints
//
// Storage formats:
//   PBKDF2 hashes are stored as `pbkdf2:<salt_hex>:<hash_hex>` so we can
//   tell them apart from legacy `btoa()` values during the migration window.
//   Functions transparently accept either format and re-hash on success.
// ────────────────────────────────────────────────────────────────────────────

import { Doc, Id } from "./_generated/dataModel";
import {
  MutationCtx,
  QueryCtx,
  mutation,
  query,
} from "./_generated/server";
import { Infer, v, Validator } from "convex/values";

// ── Wrappers used by every gated function in this codebase ─────────────────
// `authedMutation` / `authedQuery` add a `sessionToken` arg to the function's
// validator and resolve it to the calling user before the handler runs.
// `adminMutation` / `adminQuery` are the same but reject non-admin callers.
//
// The wrapped handler receives an extra `user: Doc<"users">` parameter so
// callers can branch on identity without re-querying the DB.
//
// All four pass the original args dictionary through unchanged (with
// `sessionToken` stripped) so existing destructuring patterns inside
// handlers keep working with a single edit at the call site.

const SESSION_TTL_MS = 14 * 24 * 60 * 60 * 1000; // 14 days
const PBKDF2_ITERATIONS = 600_000;
const PBKDF2_SALT_BYTES = 16;
const PBKDF2_HASH_BYTES = 32;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 min rolling window
const RATE_LIMIT_MAX_BY_KEY = 10;            // default ceiling

// ── Session validation ──────────────────────────────────────────────────────

/**
 * Validate a session token and return the underlying user. Throws on any
 * failure (no token, expired, user missing, account disabled, role mismatch).
 *
 * Read-only callers (queries) should pass a QueryCtx; mutation callers pass
 * MutationCtx. Mutations also bump `lastSeenAt` so we can audit activity.
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | undefined,
  opts?: { requiredRole?: "admin" | "instructor" }
): Promise<Doc<"users">> {
  if (!sessionToken || typeof sessionToken !== "string") {
    throw new Error("Not authenticated");
  }

  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .first();

  if (!session) throw new Error("Not authenticated");
  if (session.expiresAt < Date.now()) throw new Error("Session expired");

  const user = await ctx.db.get(session.userId);
  if (!user) throw new Error("User not found");
  if (user.status !== "active") throw new Error("Account not active");

  if (opts?.requiredRole && user.role !== opts.requiredRole) {
    throw new Error("Forbidden: insufficient permissions");
  }

  // Best-effort lastSeenAt bump — only when the caller is a mutation, since
  // queries are read-only.
  if ("patch" in ctx.db) {
    try {
      await (ctx.db as MutationCtx["db"]).patch(session._id, {
        lastSeenAt: Date.now(),
      });
    } catch {
      // Non-fatal: a failed audit bump should not block a legitimate caller.
    }
  }

  return user;
}

/** Shorthand for routes that must be admin-only. */
export async function requireAdmin(
  ctx: QueryCtx | MutationCtx,
  sessionToken: string | undefined
): Promise<Doc<"users">> {
  return requireAuth(ctx, sessionToken, { requiredRole: "admin" });
}

// ── Session lifecycle ───────────────────────────────────────────────────────

/** Generate a 32-byte random hex token. Returned to the client at login. */
export function generateSessionToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

/** Insert a new session row and return its token + expiry. */
export async function createSession(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<{ token: string; expiresAt: number }> {
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;
  const token = generateSessionToken();

  await ctx.db.insert("sessions", {
    token,
    userId,
    createdAt: now,
    expiresAt,
    lastSeenAt: now,
  });

  return { token, expiresAt };
}

/** Delete a session by its token. No-op if it doesn't exist. */
export async function destroySession(
  ctx: MutationCtx,
  sessionToken: string
): Promise<void> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", sessionToken))
    .first();
  if (session) {
    await ctx.db.delete(session._id);
  }
}

// ── Password hashing (PBKDF2 via WebCrypto) ─────────────────────────────────

/**
 * Hash a plaintext password with PBKDF2-SHA256. Returns a self-contained
 * string `pbkdf2:<salt_hex>:<hash_hex>` suitable for direct storage.
 */
export async function hashPassword(plain: string): Promise<string> {
  const salt = new Uint8Array(PBKDF2_SALT_BYTES);
  crypto.getRandomValues(salt);
  const hash = await pbkdf2(plain, salt);
  return `pbkdf2:${bytesToHex(salt)}:${bytesToHex(hash)}`;
}

/**
 * Verify a password against either a new-format `pbkdf2:` hash or a legacy
 * `btoa()` value. Returns:
 *   - `{ ok: true,  needsUpgrade: false }`  for a valid PBKDF2 match
 *   - `{ ok: true,  needsUpgrade: true  }`  for a valid legacy match (caller
 *      should re-hash and patch the user record)
 *   - `{ ok: false, needsUpgrade: false }`  for any mismatch
 */
export async function verifyPassword(
  plain: string,
  stored: string
): Promise<{ ok: boolean; needsUpgrade: boolean }> {
  if (stored.startsWith("pbkdf2:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return { ok: false, needsUpgrade: false };
    const salt = hexToBytes(parts[1]);
    const expected = parts[2];
    const actual = bytesToHex(await pbkdf2(plain, salt));
    return { ok: timingSafeEqualHex(actual, expected), needsUpgrade: false };
  }
  // Legacy btoa() path — used for accounts created before the upgrade.
  // Constant-time comparison still applies, even though the legacy format is
  // not cryptographically secure.
  let legacy: string;
  try {
    legacy = btoa(plain);
  } catch {
    return { ok: false, needsUpgrade: false };
  }
  return {
    ok: timingSafeEqualHex(legacy, stored),
    needsUpgrade: true,
  };
}

// ── Security-answer hashing (reuse the password pipeline) ───────────────────

/**
 * Normalize a security answer to a comparable form (lowercase + trim) and
 * hash it. Stored answers should always be hashed; the legacy plaintext
 * value is migrated on first successful verification.
 */
export async function hashAnswer(plain: string): Promise<string> {
  return hashPassword(plain.toLowerCase().trim());
}

/**
 * Verify a security answer. Accepts either a `pbkdf2:` hash or a legacy
 * lowercase-plaintext value (the format used before this migration).
 */
export async function verifyAnswer(
  plain: string,
  stored: string
): Promise<{ ok: boolean; needsUpgrade: boolean }> {
  const normalized = plain.toLowerCase().trim();
  if (stored.startsWith("pbkdf2:")) {
    const parts = stored.split(":");
    if (parts.length !== 3) return { ok: false, needsUpgrade: false };
    const salt = hexToBytes(parts[1]);
    const expected = parts[2];
    const actual = bytesToHex(await pbkdf2(normalized, salt));
    return { ok: timingSafeEqualHex(actual, expected), needsUpgrade: false };
  }
  return {
    ok: timingSafeEqualHex(normalized, stored),
    needsUpgrade: true,
  };
}

// ── Rate limiting (rolling window) ──────────────────────────────────────────

/**
 * Check-and-increment a rolling-window counter for a given key. Returns
 * `{ allowed: false }` if the caller has exceeded `max` attempts in the last
 * `RATE_LIMIT_WINDOW_MS`. Otherwise increments and returns `{ allowed: true,
 * remaining }`.
 *
 * Designed for low-volume sensitive endpoints — login, security-answer
 * verification, password-reset requests. Not a substitute for a real
 * upstream rate limiter at the edge, just a guardrail.
 */
export async function checkAndIncrementRateLimit(
  ctx: MutationCtx,
  key: string,
  max: number = RATE_LIMIT_MAX_BY_KEY
): Promise<{ allowed: boolean; remaining: number }> {
  const now = Date.now();
  const existing = await ctx.db
    .query("rateLimits")
    .withIndex("by_key", (q) => q.eq("key", key))
    .first();

  if (!existing) {
    await ctx.db.insert("rateLimits", {
      key,
      windowStart: now,
      count: 1,
    });
    return { allowed: true, remaining: max - 1 };
  }

  // Window expired → reset and start fresh.
  if (now - existing.windowStart > RATE_LIMIT_WINDOW_MS) {
    await ctx.db.patch(existing._id, { windowStart: now, count: 1 });
    return { allowed: true, remaining: max - 1 };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0 };
  }

  await ctx.db.patch(existing._id, { count: existing.count + 1 });
  return { allowed: true, remaining: max - existing.count - 1 };
}

// ── Internal crypto utilities ───────────────────────────────────────────────

async function pbkdf2(plain: string, salt: Uint8Array): Promise<Uint8Array> {
  const passKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(plain),
    { name: "PBKDF2" },
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt as unknown as ArrayBuffer,
      iterations: PBKDF2_ITERATIONS,
      hash: "SHA-256",
    },
    passKey,
    PBKDF2_HASH_BYTES * 8
  );
  return new Uint8Array(derived);
}

function bytesToHex(bytes: Uint8Array): string {
  let out = "";
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, "0");
  }
  return out;
}

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.substr(i * 2, 2), 16);
  }
  return out;
}

/** Constant-time string equality. Inputs must be the same length; we pad
 *  the shorter one to make comparisons take the same time regardless of
 *  where they diverge. */
function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) {
    // Still walk a fixed number of characters to avoid leaking length info
    // through timing on the failure branch.
    let diff = 1;
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
    }
    return diff === 0;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

// ── Function wrappers ───────────────────────────────────────────────────────

// Convert a `{ name: v.string() }` validator dict into a `{ name: string }`
// args type — same machinery Convex's own `mutation()` uses internally.
type ArgsValidatorMap = Record<string, Validator<any, any, any>>;
type ArgsTypeOf<V extends ArgsValidatorMap> = {
  [K in keyof V]: Infer<V[K]>;
};

interface AuthedMutationOpts<A extends ArgsValidatorMap, R> {
  args: A;
  handler: (
    ctx: MutationCtx,
    args: ArgsTypeOf<A>,
    user: Doc<"users">
  ) => R | Promise<R>;
}

interface AuthedQueryOpts<A extends ArgsValidatorMap, R> {
  args: A;
  handler: (
    ctx: QueryCtx,
    args: ArgsTypeOf<A>,
    user: Doc<"users">
  ) => R | Promise<R>;
}

/**
 * `mutation()` wrapper that requires any authenticated user. The handler
 * receives `(ctx, args, user)` where `args` is the original validator
 * dictionary minus `sessionToken`. Args type is preserved end-to-end via
 * `Infer<V>`.
 */
export function authedMutation<A extends ArgsValidatorMap, R>(
  opts: AuthedMutationOpts<A, R>
) {
  return mutation({
    args: { ...opts.args, sessionToken: v.string() },
    handler: async (ctx, rawArgs) => {
      const { sessionToken, ...rest } = rawArgs as ArgsTypeOf<A> & {
        sessionToken: string;
      };
      const user = await requireAuth(ctx, sessionToken);
      return opts.handler(ctx, rest as unknown as ArgsTypeOf<A>, user);
    },
  });
}

/** Same as `authedMutation` but rejects non-admin callers. */
export function adminMutation<A extends ArgsValidatorMap, R>(
  opts: AuthedMutationOpts<A, R>
) {
  return mutation({
    args: { ...opts.args, sessionToken: v.string() },
    handler: async (ctx, rawArgs) => {
      const { sessionToken, ...rest } = rawArgs as ArgsTypeOf<A> & {
        sessionToken: string;
      };
      const user = await requireAdmin(ctx, sessionToken);
      return opts.handler(ctx, rest as unknown as ArgsTypeOf<A>, user);
    },
  });
}

/** `query()` wrapper that requires any authenticated user. */
export function authedQuery<A extends ArgsValidatorMap, R>(
  opts: AuthedQueryOpts<A, R>
) {
  return query({
    args: { ...opts.args, sessionToken: v.string() },
    handler: async (ctx, rawArgs) => {
      const { sessionToken, ...rest } = rawArgs as ArgsTypeOf<A> & {
        sessionToken: string;
      };
      const user = await requireAuth(ctx, sessionToken);
      return opts.handler(ctx, rest as unknown as ArgsTypeOf<A>, user);
    },
  });
}

/** Same as `authedQuery` but rejects non-admin callers. */
export function adminQuery<A extends ArgsValidatorMap, R>(
  opts: AuthedQueryOpts<A, R>
) {
  return query({
    args: { ...opts.args, sessionToken: v.string() },
    handler: async (ctx, rawArgs) => {
      const { sessionToken, ...rest } = rawArgs as ArgsTypeOf<A> & {
        sessionToken: string;
      };
      const user = await requireAdmin(ctx, sessionToken);
      return opts.handler(ctx, rest as unknown as ArgsTypeOf<A>, user);
    },
  });
}
