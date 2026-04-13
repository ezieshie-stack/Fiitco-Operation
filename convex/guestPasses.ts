import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const MONTHLY_LIMIT = 2;

// ── Mutations ────────────────────────────────────────────────────────────────

export const create = mutation({
  args: {
    memberFirstName: v.string(),
    memberPhone:     v.string(),
    guestFirstName:  v.string(),
    guestPhone:      v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const monthKey = new Date(now).toISOString().slice(0, 7); // "YYYY-MM"

    // Check monthly limit for this member
    const existing = await ctx.db
      .query("guestPasses")
      .withIndex("by_monthKey_memberPhone", (q) =>
        q.eq("monthKey", monthKey).eq("memberPhone", args.memberPhone)
      )
      .collect();

    if (existing.length >= MONTHLY_LIMIT) {
      return {
        success: false as const,
        message: `Monthly guest pass limit of ${MONTHLY_LIMIT} reached for this member.`,
      };
    }

    await ctx.db.insert("guestPasses", {
      memberFirstName: args.memberFirstName.trim(),
      memberPhone:     args.memberPhone.trim(),
      guestFirstName:  args.guestFirstName.trim(),
      guestPhone:      args.guestPhone.trim(),
      status:          "pending",
      createdAt:       now,
      monthKey,
      createdBy:       "website",
    });

    return { success: true as const };
  },
});

export const createWalkIn = mutation({
  args: {
    memberFirstName: v.string(),
    memberPhone:     v.string(),
    guestFirstName:  v.string(),
    guestPhone:      v.string(),
    staffName:       v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const monthKey = new Date(now).toISOString().slice(0, 7);

    await ctx.db.insert("guestPasses", {
      memberFirstName: args.memberFirstName.trim(),
      memberPhone:     args.memberPhone.trim(),
      guestFirstName:  args.guestFirstName.trim(),
      guestPhone:      args.guestPhone.trim(),
      status:          "pending",
      createdAt:       now,
      monthKey,
      createdBy:       "front-desk",
      redeemedBy:      args.staffName,
    });

    return { success: true as const };
  },
});

export const redeem = mutation({
  args: {
    id:          v.id("guestPasses"),
    staffName:   v.string(),
  },
  handler: async (ctx, { id, staffName }) => {
    const pass = await ctx.db.get(id);
    if (!pass) throw new Error("Guest pass not found.");
    if (pass.status === "redeemed") throw new Error("This pass has already been redeemed.");
    await ctx.db.patch(id, {
      status:      "redeemed",
      redeemedAt:  Date.now(),
      redeemedBy:  staffName,
    });
    return { success: true as const };
  },
});

export const expire = mutation({
  args: { id: v.id("guestPasses") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "expired" });
    return { success: true as const };
  },
});

// ── Queries ──────────────────────────────────────────────────────────────────

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    if (status) {
      return ctx.db
        .query("guestPasses")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .collect();
    }
    return ctx.db.query("guestPasses").order("desc").collect();
  },
});

export const searchByMember = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    return ctx.db
      .query("guestPasses")
      .withIndex("by_memberPhone", (q) => q.eq("memberPhone", phone.trim()))
      .order("desc")
      .collect();
  },
});

export const searchByGuest = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    return ctx.db
      .query("guestPasses")
      .withIndex("by_guestPhone", (q) => q.eq("guestPhone", phone.trim()))
      .order("desc")
      .collect();
  },
});
