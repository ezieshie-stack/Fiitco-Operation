import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Mutations ────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    referrerFirstName: v.string(),
    referrerPhone:     v.string(),
    friendFirstName:   v.string(),
    friendPhone:       v.string(),
  },
  handler: async (ctx, args) => {
    // Check for duplicate (same referrer + same friend phone)
    const duplicate = await ctx.db
      .query("referrals")
      .withIndex("by_referrerPhone", (q) =>
        q.eq("referrerPhone", args.referrerPhone.trim())
      )
      .filter((q) => q.eq(q.field("friendPhone"), args.friendPhone.trim()))
      .first();

    if (duplicate) {
      return {
        success: false as const,
        message: "A referral for this friend has already been submitted.",
      };
    }

    await ctx.db.insert("referrals", {
      referrerFirstName: args.referrerFirstName.trim(),
      referrerPhone:     args.referrerPhone.trim(),
      friendFirstName:   args.friendFirstName.trim(),
      friendPhone:       args.friendPhone.trim(),
      status:            "pending",
      createdAt:         Date.now(),
    });

    return { success: true as const };
  },
});

export const markCompleted = mutation({
  args: { id: v.id("referrals"), notes: v.optional(v.string()) },
  handler: async (ctx, { id, notes }) => {
    await ctx.db.patch(id, {
      status:      "completed",
      completedAt: Date.now(),
      ...(notes ? { notes } : {}),
    });
    return { success: true as const };
  },
});

export const markRewarded = mutation({
  args: { id: v.id("referrals") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      status:     "rewarded",
      rewardedAt: Date.now(),
    });
    return { success: true as const };
  },
});

// ── Queries ──────────────────────────────────────────────────────────────────

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return ctx.db
        .query("referrals")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }
    return ctx.db.query("referrals").order("desc").collect();
  },
});

export const searchByReferrer = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    return ctx.db
      .query("referrals")
      .withIndex("by_referrerPhone", (q) => q.eq("referrerPhone", phone.trim()))
      .order("desc")
      .collect();
  },
});

export const searchByFriend = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    return ctx.db
      .query("referrals")
      .withIndex("by_friendPhone", (q) => q.eq("friendPhone", phone.trim()))
      .order("desc")
      .collect();
  },
});
