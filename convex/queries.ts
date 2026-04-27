import { v } from "convex/values";
import { authedQuery } from "./authHelpers";

// Every query in this module reads internal operational data (categories,
// classes, instructors, schedules, exercise library, delivery log, etc.)
// that should never be exposed to anonymous callers. They all require an
// authenticated session via `authedQuery`. Any active user (instructor or
// admin) can read; the React layer additionally hides admin-only views by
// inspecting `currentUser.role`.

export const getCategories    = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("categories").collect() });
export const getSubcategories = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("subcategories").collect() });
export const getClasses       = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("classes").collect() });
export const getInstructors   = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("instructors").collect() });
export const getTiers         = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("tiers").collect() });
export const getEquipment     = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("equipment").collect() });
export const getPathways      = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("pathways").collect() });
export const getExercises     = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("exercises").collect() });
export const getWeeklySchedule= authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("weeklySchedule").collect() });
export const getClassPrograms = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("classPrograms").collect() });
export const getDeliveryLog   = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("deliveryLog").collect() });
export const getAvailability  = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("availability").collect() });
export const getAvailabilityExceptions = authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("availabilityExceptions").collect() });
export const getClientJourneys= authedQuery({ args: {}, handler: async (ctx) => ctx.db.query("clientJourneys").collect() });

export const getScheduleByWeek = authedQuery({
  args: { weekDates: v.array(v.string()) },
  handler: async (ctx, args) => {
    const results = [];
    for (const date of args.weekDates) {
      const slots = await ctx.db
        .query("weeklySchedule")
        .withIndex("by_date", (q) => q.eq("date", date))
        .collect();
      results.push(...slots);
    }
    return results;
  },
});

export const getPendingChanges = authedQuery({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return ctx.db.query("pendingChanges")
        .withIndex("by_status", (q) => q.eq("status", args.status!))
        .order("desc")
        .collect();
    }
    return ctx.db.query("pendingChanges").order("desc").collect();
  },
});

export const getPendingChangeCount = authedQuery({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db.query("pendingChanges")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});

export const getMissingDeliveryLogs = authedQuery({
  args: {},
  handler: async (ctx) => {
    const today = new Date().toISOString().split("T")[0];
    const allSlots = await ctx.db.query("weeklySchedule").collect();
    const pastSlots = allSlots.filter(s => s.date < today && s.status !== "Cancelled");

    const allLogs = await ctx.db.query("deliveryLog").collect();
    // A log matches a slot by date + classId + instructorId
    const logKeys = new Set(allLogs.map(l => `${l.date}|${l.classId}|${l.instructorId}`));

    return pastSlots.filter(s => !logKeys.has(`${s.date}|${s.classId}|${s.instructorId}`));
  },
});
