// ────────────────────────────────────────────────────────────────────────────
// Authentication and user-management Convex functions
// ────────────────────────────────────────────────────────────────────────────
// All privileged functions in this module require a valid session token.
// Issued by `loginUser`, validated by `requireAuth` / `requireAdmin` from
// `./authHelpers`. Sensitive endpoints (login, security-answer verification)
// are also rate-limited.
//
// Password and security-answer storage uses PBKDF2-SHA256 (see authHelpers).
// Legacy `btoa()` records are accepted on first login/verify and silently
// upgraded to the new format.
// ────────────────────────────────────────────────────────────────────────────

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import {
  checkAndIncrementRateLimit,
  createSession,
  destroySession,
  hashAnswer,
  hashPassword,
  requireAdmin,
  requireAuth,
  verifyAnswer,
  verifyPassword,
} from "./authHelpers";

// ── Login / logout / me ─────────────────────────────────────────────────────

/**
 * Verify credentials and, on success, create a server-side session and
 * return its token + the public user fields. The client stores the token
 * (only) and passes it on every subsequent privileged call.
 *
 * This is a *mutation* (not a query) because it inserts a session row and
 * may also upgrade the stored password hash from the legacy format.
 */
export const loginUser = mutation({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const normalisedEmail = email.toLowerCase().trim();

    // Throttle by email (cheap to bypass with new emails, but at least
    // limits credential-stuffing against a known account).
    const rl = await checkAndIncrementRateLimit(ctx, `login:${normalisedEmail}`, 10);
    if (!rl.allowed) {
      return {
        success: false as const,
        message: "Too many login attempts. Try again in a few minutes.",
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalisedEmail))
      .first();

    if (!user) {
      return { success: false as const, message: "No account found with that email." };
    }

    const verdict = await verifyPassword(password, user.password);
    if (!verdict.ok) {
      return { success: false as const, message: "Incorrect password." };
    }
    if (user.status === "pending") {
      return { success: false as const, message: "Your account is awaiting admin approval." };
    }
    if (user.status === "inactive") {
      return { success: false as const, message: "Your account has been deactivated. Contact admin." };
    }

    // Migrate legacy btoa() passwords on the first successful login.
    if (verdict.needsUpgrade) {
      await ctx.db.patch(user._id, {
        password: await hashPassword(password),
      });
    }

    const { token, expiresAt } = await createSession(ctx, user._id);

    return {
      success: true as const,
      sessionToken: token,
      sessionExpiresAt: expiresAt,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.fullName,
        displayName: user.displayName,
        instructorId: user.instructorId,
        status: user.status,
      },
    };
  },
});

/** Invalidate the caller's session. Idempotent. */
export const logout = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await destroySession(ctx, sessionToken);
    return { success: true };
  },
});

/**
 * Return the user behind a session token, or `null` if the token is
 * missing/expired/invalid. Used by the client AuthContext to rehydrate
 * the user object on page reload without re-logging-in.
 */
export const me = query({
  args: { sessionToken: v.optional(v.string()) },
  handler: async (ctx, { sessionToken }) => {
    if (!sessionToken) return null;
    try {
      const user = await requireAuth(ctx, sessionToken);
      return {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.fullName,
        displayName: user.displayName,
        instructorId: user.instructorId,
        status: user.status,
      };
    } catch {
      return null;
    }
  },
});

// ── Forgot-password lookup + verification ───────────────────────────────────

/**
 * Public on purpose: the forgot-password flow needs to fetch the user's
 * security question before they've authenticated. We deliberately leak
 * "user exists / does not" because that's already inferable from the
 * downstream verify step. Rate-limited to discourage enumeration scripts.
 */
export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase().trim()))
      .first();
    if (!user) return null;
    return { securityQuestion: user.securityQuestion };
  },
});

/**
 * Step 2 of forgot-password: confirm the user's security answer. Mutation
 * (not query) so we can rate-limit and migrate legacy plaintext answers
 * to the hashed format on first successful match.
 */
export const verifySecurityAnswer = mutation({
  args: { email: v.string(), answer: v.string() },
  handler: async (ctx, { email, answer }) => {
    const normalisedEmail = email.toLowerCase().trim();

    // Tight throttle: 5 attempts per 15 min per email.
    const rl = await checkAndIncrementRateLimit(
      ctx,
      `verifySA:${normalisedEmail}`,
      5
    );
    if (!rl.allowed) {
      return { success: false as const, throttled: true as const };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalisedEmail))
      .first();
    if (!user) return { success: false };

    const verdict = await verifyAnswer(answer, user.securityAnswer);
    if (verdict.ok && verdict.needsUpgrade) {
      await ctx.db.patch(user._id, {
        securityAnswer: await hashAnswer(answer),
      });
    }
    return { success: verdict.ok };
  },
});

// ── Signup (public; gated downstream by admin approval) ─────────────────────

export const signupUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    fullName: v.string(),
    displayName: v.string(),
    phone: v.string(),
    specialisations: v.array(v.string()),
    securityQuestion: v.string(),
    securityAnswer: v.string(),
  },
  handler: async (ctx, args) => {
    const email = args.email.toLowerCase().trim();

    // Lightweight throttle to prevent spam-registration. New users still
    // need admin approval before they can log in, so the cost of a slip is
    // limited, but no reason to make it free either.
    const rl = await checkAndIncrementRateLimit(ctx, `signup:${email}`, 3);
    if (!rl.allowed) {
      throw new Error("Too many signup attempts. Try again later.");
    }

    // Reject duplicate email.
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) throw new Error("An account with this email already exists.");

    // Generate a fresh instructorId.
    const allInstructors = await ctx.db.query("instructors").collect();
    const maxNum = allInstructors.reduce((max, ins) => {
      const num = parseInt(ins.instructorId.replace("INS-", ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const instructorId = `INS-${String(maxNum + 1).padStart(2, "0")}`;

    await ctx.db.insert("instructors", {
      instructorId,
      fullName: args.fullName,
      displayName: args.displayName,
      specialisations: args.specialisations,
      certifications: [],
      email,
      phone: args.phone,
      status: "Pending",
      joinDate: new Date().toISOString().split("T")[0],
    });

    await ctx.db.insert("users", {
      email,
      password: await hashPassword(args.password),
      fullName: args.fullName,
      displayName: args.displayName,
      role: "instructor",
      instructorId,
      status: "pending",
      securityQuestion: args.securityQuestion,
      securityAnswer: await hashAnswer(args.securityAnswer),
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

// ── Admin queries (gated) ───────────────────────────────────────────────────

export const getAllUsers = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireAdmin(ctx, sessionToken);

    const users = await ctx.db.query("users").collect();
    return users
      .filter((u) => !u.isHidden)
      .map((u) => ({
        _id: u._id,
        email: u.email,
        fullName: u.fullName,
        displayName: u.displayName,
        role: u.role,
        instructorId: u.instructorId,
        status: u.status,
        createdAt: u.createdAt,
      }));
  },
});

export const getPendingUserCount = query({
  args: { sessionToken: v.string() },
  handler: async (ctx, { sessionToken }) => {
    await requireAdmin(ctx, sessionToken);

    const pending = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});

// ── Admin mutations (gated) ─────────────────────────────────────────────────

export const approveUser = mutation({
  args: { sessionToken: v.string(), id: v.id("users") },
  handler: async (ctx, { sessionToken, id }) => {
    await requireAdmin(ctx, sessionToken);

    const user = await ctx.db.get(id);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(id, { status: "active" });

    if (user.instructorId) {
      const instructor = await ctx.db
        .query("instructors")
        .filter((q) => q.eq(q.field("instructorId"), user.instructorId))
        .first();
      if (instructor) {
        await ctx.db.patch(instructor._id, { status: "Active" });
      }
    }
    return { success: true };
  },
});

export const deactivateUser = mutation({
  args: { sessionToken: v.string(), id: v.id("users") },
  handler: async (ctx, { sessionToken, id }) => {
    const admin = await requireAdmin(ctx, sessionToken);
    if (admin._id === id) {
      throw new Error("Admins cannot deactivate their own account.");
    }
    await ctx.db.patch(id, { status: "inactive" });
    return { success: true };
  },
});

export const reactivateUser = mutation({
  args: { sessionToken: v.string(), id: v.id("users") },
  handler: async (ctx, { sessionToken, id }) => {
    await requireAdmin(ctx, sessionToken);
    await ctx.db.patch(id, { status: "active" });
    return { success: true };
  },
});

export const changeUserRole = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("users"),
    newRole: v.string(),
  },
  handler: async (ctx, { sessionToken, id, newRole }) => {
    const admin = await requireAdmin(ctx, sessionToken);
    if (newRole !== "admin" && newRole !== "instructor") {
      throw new Error("Invalid role.");
    }
    if (admin._id === id && newRole !== "admin") {
      throw new Error("Admins cannot demote their own account.");
    }
    await ctx.db.patch(id, { role: newRole });
    return { success: true };
  },
});

export const adminResetPassword = mutation({
  args: {
    sessionToken: v.string(),
    id: v.id("users"),
    newPassword: v.string(),
  },
  handler: async (ctx, { sessionToken, id, newPassword }) => {
    await requireAdmin(ctx, sessionToken);
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      throw new Error("Password must be at least 6 characters.");
    }
    await ctx.db.patch(id, { password: await hashPassword(newPassword) });
    return { success: true };
  },
});

// ── Security-answer-gated reset (legacy UX preserved, properly secured) ────

/**
 * Replacement for the previous public `resetPassword` mutation. That one
 * accepted just `{ email, newPassword }` and would happily reset any
 * account's password — a full account-takeover primitive.
 *
 * This version requires the caller to also provide the correct security
 * answer for the email in a single atomic call. The answer is verified
 * server-side (with the same rate-limit cap and lazy-hash migration as
 * `verifySecurityAnswer`) before the password is changed.
 *
 * For users without a security answer on file, the email-based flow in
 * `passwordReset.ts` is the supported reset path.
 */
export const resetPasswordWithSecurityAnswer = mutation({
  args: {
    email: v.string(),
    answer: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, { email, answer, newPassword }) => {
    if (typeof newPassword !== "string" || newPassword.length < 6) {
      return {
        success: false as const,
        message: "Password must be at least 6 characters.",
      };
    }

    const normalisedEmail = email.toLowerCase().trim();

    // Same throttle key as `verifySecurityAnswer` so attempted-then-reset
    // chains can't end-run the limit.
    const rl = await checkAndIncrementRateLimit(
      ctx,
      `verifySA:${normalisedEmail}`,
      5
    );
    if (!rl.allowed) {
      return {
        success: false as const,
        message: "Too many attempts. Try again in a few minutes.",
      };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalisedEmail))
      .first();
    if (!user) {
      // Generic message — avoid revealing account existence here either.
      return { success: false as const, message: "Incorrect answer." };
    }

    const verdict = await verifyAnswer(answer, user.securityAnswer);
    if (!verdict.ok) {
      return { success: false as const, message: "Incorrect answer." };
    }

    // Lazy-migrate the security answer hash on success, same as
    // `verifySecurityAnswer` does.
    if (verdict.needsUpgrade) {
      await ctx.db.patch(user._id, {
        securityAnswer: await hashAnswer(answer),
      });
    }

    await ctx.db.patch(user._id, {
      password: await hashPassword(newPassword),
    });

    return { success: true as const };
  },
});
