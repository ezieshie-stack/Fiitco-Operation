import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const normalizePhone = (raw: string) => raw.replace(/\D/g, "");

/**
 * Public: submitted from the customer website modal OR from the front desk.
 * Prevents obvious duplicates (same referrer+friend phone pair, still pending).
 */
export const create = mutation({
  args: {
    referrerFirstName: v.string(),
    referrerPhone: v.string(),
    friendFirstName: v.string(),
    friendPhone: v.string(),
    createdBy: v.optional(v.string()), // defaults to "website"
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const referrerFirstName = args.referrerFirstName.trim();
    const friendFirstName = args.friendFirstName.trim();
    const referrerPhone = normalizePhone(args.referrerPhone);
    const friendPhone = normalizePhone(args.friendPhone);

    if (!referrerFirstName || !friendFirstName) {
      throw new Error("Please include both first names.");
    }
    if (referrerPhone.length < 7 || friendPhone.length < 7) {
      throw new Error("Please include valid phone numbers for both people.");
    }

    // Duplicate check — same pair, still pending
    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_friendPhone", (q) => q.eq("friendPhone", friendPhone))
      .collect();
    const dupe = existing.find(
      (r) => r.referrerPhone === referrerPhone && r.status === "pending",
    );
    if (dupe) {
      throw new Error(
        "You already referred this friend. We'll be in touch as soon as they sign up.",
      );
    }

    return await ctx.db.insert("referrals", {
      referrerFirstName,
      referrerPhone,
      friendFirstName,
      friendPhone,
      status: "pending",
      createdAt: Date.now(),
      createdBy: args.createdBy ?? "website",
      notes: args.notes,
    });
  },
});

export const markCompleted = mutation({
  args: { id: v.id("referrals") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      status: "completed",
      completedAt: Date.now(),
    });
  },
});

export const markRewarded = mutation({
  args: { id: v.id("referrals") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      status: "rewarded",
      rewardedAt: Date.now(),
    });
  },
});

export const updateNotes = mutation({
  args: { id: v.id("referrals"), notes: v.string() },
  handler: async (ctx, { id, notes }) => {
    await ctx.db.patch(id, { notes });
  },
});

export const remove = mutation({
  args: { id: v.id("referrals") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    const all = await ctx.db.query("referrals").collect();
    const filtered = status ? all.filter((r) => r.status === status) : all;
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const searchByReferrer = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    const normalized = normalizePhone(phone);
    return await ctx.db
      .query("referrals")
      .withIndex("by_referrerPhone", (q) => q.eq("referrerPhone", normalized))
      .collect();
  },
});

export const searchByFriend = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    const normalized = normalizePhone(phone);
    return await ctx.db
      .query("referrals")
      .withIndex("by_friendPhone", (q) => q.eq("friendPhone", normalized))
      .collect();
  },
});
