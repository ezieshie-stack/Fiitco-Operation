import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    referrerFirstName: v.string(),
    referrerPhone: v.string(),
    friendFirstName: v.string(),
    friendPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const referrer = args.referrerPhone.trim();
    const friend = args.friendPhone.trim();

    const existing = await ctx.db
      .query("referrals")
      .withIndex("by_referrerPhone", (q) => q.eq("referrerPhone", referrer))
      .collect();

    if (existing.some((r) => r.friendPhone === friend)) {
      throw new Error("You've already referred this person.");
    }

    const id = await ctx.db.insert("referrals", {
      referrerFirstName: args.referrerFirstName.trim(),
      referrerPhone: referrer,
      friendFirstName: args.friendFirstName.trim(),
      friendPhone: friend,
      status: "pending",
      createdAt: Date.now(),
    });

    return { id };
  },
});

export const markCompleted = mutation({
  args: { id: v.id("referrals"), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "completed",
      completedAt: Date.now(),
      notes: args.notes,
    });
  },
});

export const markRewarded = mutation({
  args: { id: v.id("referrals"), notes: v.optional(v.string()) },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: "rewarded",
      rewardedAt: Date.now(),
      notes: args.notes,
    });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("referrals").order("desc").collect();
  },
});

export const searchByReferrer = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referrals")
      .withIndex("by_referrerPhone", (q) => q.eq("referrerPhone", args.phone.trim()))
      .order("desc")
      .collect();
  },
});

export const searchByFriend = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("referrals")
      .withIndex("by_friendPhone", (q) => q.eq("friendPhone", args.phone.trim()))
      .order("desc")
      .collect();
  },
});
