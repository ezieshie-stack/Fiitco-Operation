import { query } from "./_generated/server";
import { v } from "convex/values";

export const getCategories    = query({ args: {}, handler: async (ctx) => ctx.db.query("categories").collect() });
export const getSubcategories = query({ args: {}, handler: async (ctx) => ctx.db.query("subcategories").collect() });
export const getClasses       = query({ args: {}, handler: async (ctx) => ctx.db.query("classes").collect() });
export const getInstructors   = query({ args: {}, handler: async (ctx) => ctx.db.query("instructors").collect() });
export const getTiers         = query({ args: {}, handler: async (ctx) => ctx.db.query("tiers").collect() });
export const getEquipment     = query({ args: {}, handler: async (ctx) => ctx.db.query("equipment").collect() });
export const getPathways      = query({ args: {}, handler: async (ctx) => ctx.db.query("pathways").collect() });
export const getExercises     = query({ args: {}, handler: async (ctx) => ctx.db.query("exercises").collect() });
export const getWeeklySchedule= query({ args: {}, handler: async (ctx) => ctx.db.query("weeklySchedule").collect() });
export const getClassPrograms = query({ args: {}, handler: async (ctx) => ctx.db.query("classPrograms").collect() });
export const getDeliveryLog   = query({ args: {}, handler: async (ctx) => ctx.db.query("deliveryLog").collect() });
export const getAvailability  = query({ args: {}, handler: async (ctx) => ctx.db.query("availability").collect() });
export const getAvailabilityExceptions = query({ args: {}, handler: async (ctx) => ctx.db.query("availabilityExceptions").collect() });
export const getClientJourneys= query({ args: {}, handler: async (ctx) => ctx.db.query("clientJourneys").collect() });

export const getScheduleByWeek = query({
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

export const getPendingChanges = query({
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

export const getPendingChangeCount = query({
  args: {},
  handler: async (ctx) => {
    const pending = await ctx.db.query("pendingChanges")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return pending.length;
  },
});

export const getMissingDeliveryLogs = query({
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
