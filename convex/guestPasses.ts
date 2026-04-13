import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

const MONTHLY_LIMIT = 2;

function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export const create = mutation({
  args: {
    memberFirstName: v.string(),
    memberPhone: v.string(),
    guestFirstName: v.string(),
    guestPhone: v.string(),
  },
  handler: async (ctx, args) => {
    const monthKey = currentMonthKey();

    const existing = await ctx.db
      .query("guestPasses")
      .withIndex("by_monthKey_memberPhone", (q) =>
        q.eq("monthKey", monthKey).eq("memberPhone", args.memberPhone)
      )
      .collect();

    if (existing.length >= MONTHLY_LIMIT) {
      throw new Error(
        `Monthly limit reached (${MONTHLY_LIMIT} passes per member). Contact the studio if you need an exception.`
      );
    }

    const id = await ctx.db.insert("guestPasses", {
      memberFirstName: args.memberFirstName.trim(),
      memberPhone: args.memberPhone.trim(),
      guestFirstName: args.guestFirstName.trim(),
      guestPhone: args.guestPhone.trim(),
      status: "pending",
      createdAt: Date.now(),
      monthKey,
      createdBy: "website",
    });

    return { id, remaining: MONTHLY_LIMIT - existing.length - 1 };
  },
});

export const createWalkIn = mutation({
  args: {
    memberFirstName: v.string(),
    memberPhone: v.string(),
    guestFirstName: v.string(),
    guestPhone: v.string(),
    createdBy: v.string(),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("guestPasses", {
      memberFirstName: args.memberFirstName.trim(),
      memberPhone: args.memberPhone.trim(),
      guestFirstName: args.guestFirstName.trim(),
      guestPhone: args.guestPhone.trim(),
      status: "pending",
      createdAt: Date.now(),
      monthKey: currentMonthKey(),
      createdBy: args.createdBy,
    });
    return { id };
  },
});

export const redeem = mutation({
  args: { id: v.id("guestPasses"), redeemedBy: v.string() },
  handler: async (ctx, args) => {
    const pass = await ctx.db.get(args.id);
    if (!pass) throw new Error("Guest pass not found");
    if (pass.status !== "pending") throw new Error(`Pass already ${pass.status}`);
    await ctx.db.patch(args.id, {
      status: "redeemed",
      redeemedAt: Date.now(),
      redeemedBy: args.redeemedBy,
    });
  },
});

export const expire = mutation({
  args: { id: v.id("guestPasses") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: "expired" });
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("guestPasses").order("desc").collect();
  },
});

export const searchByMember = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guestPasses")
      .withIndex("by_memberPhone", (q) => q.eq("memberPhone", args.phone.trim()))
      .order("desc")
      .collect();
  },
});

export const searchByGuest = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("guestPasses")
      .withIndex("by_guestPhone", (q) => q.eq("guestPhone", args.phone.trim()))
      .order("desc")
      .collect();
  },
});
