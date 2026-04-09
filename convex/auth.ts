import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── Password helpers (DEMO ONLY — not cryptographically secure) ──────────────
function encodePassword(plain: string): string {
  return btoa(plain);
}
function checkPassword(plain: string, encoded: string): boolean {
  return btoa(plain) === encoded;
}

// ── Queries ──────────────────────────────────────────────────────────────────

export const loginUser = query({
  args: { email: v.string(), password: v.string() },
  handler: async (ctx, { email, password }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase().trim()))
      .first();

    if (!user) return { success: false as const, message: "No account found with that email." };
    if (!checkPassword(password, user.password)) return { success: false as const, message: "Incorrect password." };
    if (user.status === "pending") return { success: false as const, message: "Your account is awaiting admin approval." };
    if (user.status === "inactive") return { success: false as const, message: "Your account has been deactivated. Contact admin." };

    // Return user without password
    return {
      success: true as const,
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

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => ({
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
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db
      .query("users")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});

// ── Mutations ────────────────────────────────────────────────────────────────

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

    // Check duplicate
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();
    if (existing) throw new Error("An account with this email already exists.");

    // Generate instructorId
    const allInstructors = await ctx.db.query("instructors").collect();
    const maxNum = allInstructors.reduce((max, ins) => {
      const num = parseInt(ins.instructorId.replace("INS-", ""), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);
    const instructorId = `INS-${String(maxNum + 1).padStart(2, "0")}`;

    // Create instructor record
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

    // Create user record
    await ctx.db.insert("users", {
      email,
      password: encodePassword(args.password),
      fullName: args.fullName,
      displayName: args.displayName,
      role: "instructor",
      instructorId,
      status: "pending",
      securityQuestion: args.securityQuestion,
      securityAnswer: args.securityAnswer.toLowerCase().trim(),
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  },
});

export const verifySecurityAnswer = query({
  args: { email: v.string(), answer: v.string() },
  handler: async (ctx, { email, answer }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase().trim()))
      .first();
    if (!user) return { success: false };
    return {
      success: user.securityAnswer === answer.toLowerCase().trim(),
    };
  },
});

export const resetPassword = mutation({
  args: { email: v.string(), newPassword: v.string() },
  handler: async (ctx, { email, newPassword }) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email.toLowerCase().trim()))
      .first();
    if (!user) throw new Error("User not found");
    await ctx.db.patch(user._id, { password: encodePassword(newPassword) });
    return { success: true };
  },
});

export const approveUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    const user = await ctx.db.get(id);
    if (!user) throw new Error("User not found");
    await ctx.db.patch(id, { status: "active" });

    // Also activate the linked instructor record
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
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "inactive" });
    return { success: true };
  },
});

export const reactivateUser = mutation({
  args: { id: v.id("users") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { status: "active" });
    return { success: true };
  },
});

export const changeUserRole = mutation({
  args: { id: v.id("users"), newRole: v.string() },
  handler: async (ctx, { id, newRole }) => {
    await ctx.db.patch(id, { role: newRole });
    return { success: true };
  },
});

export const adminResetPassword = mutation({
  args: { id: v.id("users"), newPassword: v.string() },
  handler: async (ctx, { id, newPassword }) => {
    await ctx.db.patch(id, { password: encodePassword(newPassword) });
    return { success: true };
  },
});
