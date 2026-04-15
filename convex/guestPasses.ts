import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Hardcoded for now — every active member gets this many guest passes per
// calendar month. Change here if FIIT Co decides to differentiate by tier.
const MONTHLY_LIMIT = 2;

const normalizePhone = (raw: string) => raw.replace(/\D/g, "");

const currentMonthKey = () => {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${yyyy}-${mm}`;
};

/**
 * Public: submitted from the customer website OR created on the spot at the
 * front desk. Enforces MONTHLY_LIMIT per member phone per calendar month.
 */
export const create = mutation({
  args: {
    memberFirstName: v.string(),
    memberPhone: v.string(),
    guestFirstName: v.string(),
    guestPhone: v.string(),
    createdBy: v.optional(v.string()), // defaults to "website"
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const memberFirstName = args.memberFirstName.trim();
    const guestFirstName = args.guestFirstName.trim();
    const memberPhone = normalizePhone(args.memberPhone);
    const guestPhone = normalizePhone(args.guestPhone);

    if (!memberFirstName || !guestFirstName) {
      throw new Error("Please include both first names.");
    }
    if (memberPhone.length < 7 || guestPhone.length < 7) {
      throw new Error("Please include valid phone numbers for both people.");
    }

    const monthKey = currentMonthKey();

    // Monthly cap check — count all passes this member has issued this month
    // regardless of status (pending + redeemed both count against the cap).
    const thisMonth = await ctx.db
      .query("guestPasses")
      .withIndex("by_monthKey_memberPhone", (q) =>
        q.eq("monthKey", monthKey).eq("memberPhone", memberPhone),
      )
      .collect();

    const active = thisMonth.filter((p) => p.status !== "expired");
    if (active.length >= MONTHLY_LIMIT) {
      throw new Error(
        `You've used all ${MONTHLY_LIMIT} of your guest passes for this month. They reset on the 1st.`,
      );
    }

    return await ctx.db.insert("guestPasses", {
      memberFirstName,
      memberPhone,
      guestFirstName,
      guestPhone,
      status: "pending",
      createdAt: Date.now(),
      monthKey,
      createdBy: args.createdBy ?? "website",
      notes: args.notes,
    });
  },
});

/**
 * Front-desk walk-in: same rules as `create`, but the staff member is the
 * createdBy source so we can tell them apart in the dashboard.
 */
export const createWalkIn = mutation({
  args: {
    memberFirstName: v.string(),
    memberPhone: v.string(),
    guestFirstName: v.string(),
    guestPhone: v.string(),
    staffName: v.string(),
  },
  handler: async (ctx, args) => {
    const memberFirstName = args.memberFirstName.trim();
    const guestFirstName = args.guestFirstName.trim();
    const memberPhone = normalizePhone(args.memberPhone);
    const guestPhone = normalizePhone(args.guestPhone);

    if (!memberFirstName || !guestFirstName) {
      throw new Error("Please include both first names.");
    }
    if (memberPhone.length < 7 || guestPhone.length < 7) {
      throw new Error("Please include valid phone numbers for both people.");
    }

    const monthKey = currentMonthKey();
    const thisMonth = await ctx.db
      .query("guestPasses")
      .withIndex("by_monthKey_memberPhone", (q) =>
        q.eq("monthKey", monthKey).eq("memberPhone", memberPhone),
      )
      .collect();
    const active = thisMonth.filter((p) => p.status !== "expired");
    if (active.length >= MONTHLY_LIMIT) {
      throw new Error(
        `This member has already used all ${MONTHLY_LIMIT} guest passes for ${monthKey}.`,
      );
    }

    return await ctx.db.insert("guestPasses", {
      memberFirstName,
      memberPhone,
      guestFirstName,
      guestPhone,
      status: "pending",
      createdAt: Date.now(),
      monthKey,
      createdBy: `front-desk:${args.staffName}`,
    });
  },
});

export const redeem = mutation({
  args: { id: v.id("guestPasses"), staffName: v.string() },
  handler: async (ctx, { id, staffName }) => {
    const pass = await ctx.db.get(id);
    if (!pass) throw new Error("Guest pass not found.");
    if (pass.status === "redeemed") {
      throw new Error("This pass has already been redeemed.");
    }
    if (pass.status === "expired") {
      throw new Error("This pass is expired.");
    }
    await ctx.db.patch(id, {
      status: "redeemed",
      redeemedAt: Date.now(),
      redeemedBy: staffName,
    });
  },
});

export const expire = mutation({
  args: { id: v.id("guestPasses") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "expired" });
  },
});

export const remove = mutation({
  args: { id: v.id("guestPasses") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
  },
});

export const list = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, { status }) => {
    const all = await ctx.db.query("guestPasses").collect();
    const filtered = status ? all.filter((p) => p.status === status) : all;
    return filtered.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const searchByMember = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    const normalized = normalizePhone(phone);
    return await ctx.db
      .query("guestPasses")
      .withIndex("by_memberPhone", (q) => q.eq("memberPhone", normalized))
      .collect();
  },
});

export const searchByGuest = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    const normalized = normalizePhone(phone);
    return await ctx.db
      .query("guestPasses")
      .withIndex("by_guestPhone", (q) => q.eq("guestPhone", normalized))
      .collect();
  },
});

/**
 * Monthly usage for a given member (used by the website/front desk to show
 * "1 of 2 used" before they submit).
 */
export const monthlyUsage = query({
  args: { phone: v.string() },
  handler: async (ctx, { phone }) => {
    const memberPhone = normalizePhone(phone);
    const monthKey = currentMonthKey();
    const passes = await ctx.db
      .query("guestPasses")
      .withIndex("by_monthKey_memberPhone", (q) =>
        q.eq("monthKey", monthKey).eq("memberPhone", memberPhone),
      )
      .collect();
    const used = passes.filter((p) => p.status !== "expired").length;
    return { monthKey, used, limit: MONTHLY_LIMIT, remaining: Math.max(0, MONTHLY_LIMIT - used) };
  },
});
