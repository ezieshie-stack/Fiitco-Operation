// ────────────────────────────────────────────────────────────────────────────
// Generic email-based password reset
// ────────────────────────────────────────────────────────────────────────────
// Flow:
//   1. User types their email on the "Forgot password" screen and clicks
//      Continue. Frontend calls requestPasswordReset(email).
//   2. If a user with that email exists, we generate a random 15-minute
//      single-use token, store it in passwordResetTokens, and schedule
//      sendResetEmail to deliver a link via Resend. If the email doesn't
//      match any user, we silently do nothing (to avoid enumeration).
//   3. Either way the mutation returns { sent: true } — the UI always shows
//      the neutral "if that email exists, check your inbox" message.
//   4. User clicks the link in the email → lands on /auth/reset-password?token=…
//   5. Frontend calls resetPasswordWithToken(token, newPassword) → server
//      validates the token, updates the user's password, marks the token
//      used. User is bounced back to /login to sign in with the new password.
//
// Env vars required on the Convex deployment (set with `npx convex env set`):
//   RESEND_API_KEY  — Resend API key (server-only, never exposed to clients)
//   APP_URL         — base URL of the deployed app (e.g. https://fiit-ops-kappa.vercel.app)
// ────────────────────────────────────────────────────────────────────────────

import { mutation, internalAction, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { checkAndIncrementRateLimit, hashPassword } from "./authHelpers";

const TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes

// ── Public: request a reset link ─────────────────────────────────────────────

export const requestPasswordReset = mutation({
  args: { email: v.string() },
  handler: async (ctx, { email }) => {
    const normalisedEmail = email.toLowerCase().trim();

    // Throttle by email so a single account can't be flooded with reset
    // emails (which would also hammer Resend quota).
    const rl = await checkAndIncrementRateLimit(
      ctx,
      `pwReset:${normalisedEmail}`,
      5
    );
    if (!rl.allowed) {
      // Same neutral response as below — never reveal throttling state.
      return { sent: true as const };
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalisedEmail))
      .first();

    // Only do real work if the email matches a user. For unknown emails we
    // still return `sent: true` so the UI reveals nothing.
    if (user && user.status !== "inactive") {
      const token =
        (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
      const now = Date.now();
      await ctx.db.insert("passwordResetTokens", {
        token,
        userId: user._id,
        expiresAt: now + TOKEN_TTL_MS,
        used: false,
        createdAt: now,
      });

      await ctx.scheduler.runAfter(0, internal.passwordReset.sendResetEmail, {
        token,
        to: user.email,
        displayName: user.displayName ?? user.fullName,
      });
    }

    return { sent: true as const };
  },
});

// ── Public: consume a reset token, set a new password ───────────────────────

export const resetPasswordWithToken = mutation({
  args: { token: v.string(), newPassword: v.string() },
  handler: async (ctx, { token, newPassword }) => {
    if (newPassword.length < 6) {
      return {
        success: false as const,
        message: "Password must be at least 6 characters.",
      };
    }

    const row = await ctx.db
      .query("passwordResetTokens")
      .withIndex("by_token", (q) => q.eq("token", token))
      .first();
    if (!row) {
      return { success: false as const, message: "Invalid or expired link." };
    }
    if (row.used) {
      return {
        success: false as const,
        message: "This link has already been used. Request a new one.",
      };
    }
    if (row.expiresAt < Date.now()) {
      return {
        success: false as const,
        message: "This link has expired. Request a new one.",
      };
    }

    const user = await ctx.db.get(row.userId);
    if (!user) {
      return { success: false as const, message: "Account no longer exists." };
    }

    await ctx.db.patch(user._id, { password: await hashPassword(newPassword) });
    await ctx.db.patch(row._id, { used: true });

    return { success: true as const };
  },
});

// ── Internal: send email via Resend ─────────────────────────────────────────

export const sendResetEmail = internalAction({
  args: {
    token: v.string(),
    to: v.string(),
    displayName: v.string(),
  },
  handler: async (_ctx, { token, to, displayName }) => {
    const apiKey = process.env.RESEND_API_KEY;
    const appUrl = (process.env.APP_URL ?? "").replace(/\/$/, "");

    if (!apiKey || !appUrl) {
      console.error("[passwordReset] missing env vars; cannot send email.", {
        hasApiKey: Boolean(apiKey),
        hasAppUrl: Boolean(appUrl),
      });
      return;
    }

    const link = `${appUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;
    const greeting = displayName?.split(" ")[0] ?? "there";

    const subject = "Reset your FIIT Ops password";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 520px; margin: 0 auto; padding: 32px 24px; color: #1E1812;">
        <h1 style="font-size: 22px; margin: 0 0 16px;">Reset your password</h1>
        <p style="font-size: 15px; line-height: 1.5; margin: 0 0 24px; color: #555;">
          Hi ${greeting} — click the button below to choose a new password. This link expires in 15 minutes and can only be used once.
        </p>
        <p style="margin: 0 0 32px;">
          <a href="${link}" style="display: inline-block; padding: 12px 24px; background: #D92B2B; color: #fff; text-decoration: none; border-radius: 8px; font-weight: 500;">
            Choose a new password
          </a>
        </p>
        <p style="font-size: 13px; color: #888; margin: 0 0 8px;">
          If the button doesn't work, copy and paste this URL into your browser:
        </p>
        <p style="font-size: 12px; color: #888; word-break: break-all; margin: 0 0 24px;">
          ${link}
        </p>
        <p style="font-size: 12px; color: #888; margin: 0;">
          If you didn't ask to reset your password, you can safely ignore this email.
        </p>
      </div>
    `;

    const resp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "onboarding@resend.dev", // Resend sandbox sender — works without domain verification
        to,
        subject,
        html,
      }),
    });

    if (!resp.ok) {
      const text = await resp.text().catch(() => "<no body>");
      console.error("[passwordReset] Resend send failed", resp.status, text);
      return;
    }
    console.log("[passwordReset] reset email dispatched to", to);
  },
});

// ── Internal: seed a hidden admin user ───────────────────────────────────────
//
// Invoked once per deployment via the Convex dashboard Functions panel, or
// temporarily via HTTP during setup (flip to `mutation` then back). Creates
// a user with a random throwaway password; finish by clicking "Forgot
// password" on /login to set the real password via email.
export const seedHiddenAdmin = internalMutation({
  args: {
    email: v.string(),
    fullName: v.string(),
    displayName: v.string(),
  },
  handler: async (ctx, { email, fullName, displayName }) => {
    const normalised = email.toLowerCase().trim();
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", normalised))
      .first();
    if (existing) {
      // Don't overwrite; just flip hidden + active if needed and return id.
      await ctx.db.patch(existing._id, {
        isHidden: true,
        role: "admin",
        status: "active",
      });
      return { userId: existing._id, created: false };
    }
    // Random throwaway password — user must reset via email before logging in.
    const throwaway =
      (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "");
    const userId = await ctx.db.insert("users", {
      email: normalised,
      password: await hashPassword(throwaway),
      fullName,
      displayName,
      role: "admin",
      status: "active",
      securityQuestion: "",
      securityAnswer: "",
      createdAt: new Date().toISOString(),
      isHidden: true,
    });
    return { userId, created: true };
  },
});

