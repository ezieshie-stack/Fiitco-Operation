import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  categories: defineTable({
    categoryId: v.string(),
    name: v.string(),
    colorCode: v.string(),
    emoji: v.string(),
    description: v.string(),
    active: v.boolean(),
  }).index("by_categoryId", ["categoryId"]),

  subcategories: defineTable({
    subcategoryId: v.string(),
    categoryId: v.string(),
    categoryName: v.string(),
    name: v.string(),
    description: v.string(),
    active: v.boolean(),
  }).index("by_categoryId", ["categoryId"]),

  classes: defineTable({
    classId: v.string(),
    categoryId: v.string(),
    categoryName: v.string(),
    subcategoryName: v.optional(v.string()),
    name: v.string(),
    tier: v.string(),
    durationMinutes: v.number(),
    description: v.string(),
    active: v.boolean(),
  }).index("by_categoryId", ["categoryId"]),

  instructors: defineTable({
    instructorId: v.string(),
    fullName: v.string(),
    displayName: v.string(),
    specialisations: v.array(v.string()),
    certifications: v.array(v.string()),
    email: v.string(),
    phone: v.string(),
    status: v.string(),
    joinDate: v.string(),
    notes: v.optional(v.string()),
  }).index("by_status", ["status"]),

  tiers: defineTable({
    tierId: v.string(),
    name: v.string(),
    description: v.string(),
    recommendedFor: v.string(),
    colorCode: v.string(),
  }),

  equipment: defineTable({
    equipmentId: v.string(),
    name: v.string(),
    category: v.string(),
    quantityAvailable: v.number(),
    location: v.string(),
    notes: v.optional(v.string()),
    active: v.boolean(),
  }),

  pathways: defineTable({
    pathwayId: v.string(),
    title: v.string(),
    category: v.string(),
    targetTier: v.string(),
    durationWeeks: v.number(),
    goal: v.string(),
    description: v.string(),
    active: v.boolean(),
  }),

  exercises: defineTable({
    exerciseId: v.string(),
    name: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    tier: v.optional(v.string()),
    description: v.string(),
    equipment: v.array(v.string()),
    active: v.boolean(),
  }).index("by_category", ["category"]),

  weeklySchedule: defineTable({
    date: v.string(),
    dayOfWeek: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    classId: v.string(),
    className: v.string(),
    categoryName: v.string(),
    instructorId: v.string(),
    instructorName: v.string(),
    capacity: v.number(),
    status: v.string(),
    bufferViolation: v.boolean(),
    bufferOverrideAcknowledged: v.boolean(),
  }).index("by_date", ["date"]),

  classPrograms: defineTable({
    classId: v.string(),
    className: v.string(),
    instructorId: v.string(),
    instructorName: v.string(),
    weekOf: v.string(),
    blocks: v.array(v.object({
      blockType: v.string(),
      exerciseName: v.optional(v.string()),
      durationMinutes: v.number(),
      description: v.string(),
      equipment: v.array(v.string()),
      instructions: v.string(),
    })),
    status: v.string(),
    submittedAt: v.optional(v.string()),
    approvedAt: v.optional(v.string()),
    approvedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_instructorId", ["instructorId"])
    .index("by_status", ["status"]),

  deliveryLog: defineTable({
    date: v.string(),
    classId: v.string(),
    className: v.string(),
    categoryName: v.string(),
    instructorId: v.string(),
    instructorName: v.string(),
    wasPlanned: v.boolean(),
    actualAttendance: v.number(),
    maxCapacity: v.number(),
    programFollowed: v.boolean(),
    variationsMade: v.optional(v.string()),
    notes: v.optional(v.string()),
  }).index("by_date", ["date"]),

  clientJourneys: defineTable({
    journeyId: v.string(),
    title: v.string(),
    goalType: v.string(),
    pathwayId: v.string(),
    weeks: v.array(v.object({
      weekNumber: v.number(),
      classId: v.string(),
      className: v.string(),
      focus: v.string(),
      notes: v.optional(v.string()),
    })),
    active: v.boolean(),
  }),

  availability: defineTable({
    instructorId: v.string(),
    instructorName: v.string(),
    dayOfWeek: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    available: v.boolean(),
    notes: v.optional(v.string()),
  }).index("by_instructorId", ["instructorId"]),

  // Date-specific overrides on top of the recurring `availability` default.
  // `type = "unavailable"` removes a window (or the whole day if no time given).
  // `type = "available"` adds a window that the standing default does not cover
  // (e.g. picking up a sub shift).
  availabilityExceptions: defineTable({
    instructorId: v.string(),
    instructorName: v.string(),
    date: v.string(),              // YYYY-MM-DD, single calendar date
    type: v.string(),              // "unavailable" | "available"
    startTime: v.optional(v.string()),  // HH:MM; omitted = whole day
    endTime: v.optional(v.string()),
    reason: v.optional(v.string()),
    createdAt: v.string(),
  })
    .index("by_instructorId", ["instructorId"])
    .index("by_date", ["date"]),

  pendingChanges: defineTable({
    tableName: v.string(),        // e.g. "weeklySchedule", "classes", "exercises"
    action: v.string(),           // "add" | "update" | "delete"
    entityId: v.optional(v.string()), // Convex _id as string (for update/delete)
    payload: v.any(),             // the full data object
    submittedBy: v.string(),      // user id
    submittedByName: v.string(),  // display name
    submittedAt: v.string(),      // ISO string
    status: v.string(),           // "pending" | "approved" | "denied"
    reviewedBy: v.optional(v.string()),
    reviewedAt: v.optional(v.string()),
    reviewNote: v.optional(v.string()),
    description: v.string(),      // human-readable description
  }).index("by_status", ["status"]),

  users: defineTable({
    email: v.string(),
    password: v.string(),           // base64-encoded (demo only)
    fullName: v.string(),
    displayName: v.string(),
    role: v.string(),               // "admin" | "instructor"
    instructorId: v.optional(v.string()), // links to instructors table
    status: v.string(),             // "active" | "pending" | "inactive"
    securityQuestion: v.string(),
    securityAnswer: v.string(),     // stored lowercase trimmed
    createdAt: v.string(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),
});
