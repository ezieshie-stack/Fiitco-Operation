import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    const existingCats = await ctx.db.query("categories").collect();
    if (existingCats.length > 0) return { message: "Already seeded" };

    const categories = [
      { categoryId: "CAT-01", name: "Strength & Conditioning", colorCode: "D6E8F5", emoji: "💪", description: "Focused resistance and weight training to build strength and muscle", active: true },
      { categoryId: "CAT-02", name: "Boxing", colorCode: "FDDBD5", emoji: "🥊", description: "Technique-based boxing training including bag work, combinations, and footwork", active: true },
      { categoryId: "CAT-03", name: "Hybrid", colorCode: "EDE7F6", emoji: "🔀", description: "Half boxing bag work and half full body conditioning circuit training", active: true },
      { categoryId: "CAT-04", name: "Pilates", colorCode: "FCE4EC", emoji: "🧘", description: "Core-focused movement and flexibility training using Pilates principles", active: true },
      { categoryId: "CAT-05", name: "Yoga", colorCode: "E0F2F1", emoji: "🌿", description: "Mindfulness, flexibility, and recovery-focused yoga sessions", active: true },
    ];
    for (const c of categories) await ctx.db.insert("categories", c);

    const tiers = [
      { tierId: "TIR-01", name: "Beginner", description: "Entry level — foundational movements, lower intensity, focus on form", recommendedFor: "New members or returning after a break", colorCode: "D6EED6" },
      { tierId: "TIR-02", name: "Intermediate", description: "Moderate intensity — assumes basic technique", recommendedFor: "Members with 2–3 months consistent training", colorCode: "FFF3CD" },
      { tierId: "TIR-03", name: "Advanced", description: "High intensity — complex movements, heavier load", recommendedFor: "Members with 6+ months consistent training", colorCode: "FFD6D6" },
      { tierId: "TIR-04", name: "All Levels", description: "Open to everyone — instructor scales movements", recommendedFor: "Any member", colorCode: "E3F2FD" },
    ];
    for (const t of tiers) await ctx.db.insert("tiers", t);

    const instructors = [
      { instructorId: "INS-01", fullName: "Jason Villanueva", displayName: "Jason V.", specialisations: ["Boxing", "Strength & Conditioning"], certifications: ["Boxing Coach Level 2", "CPT"], email: "jason@fiitco.ca", phone: "416-555-0101", status: "Active", joinDate: "2024-01-15", notes: "Senior instructor" },
      { instructorId: "INS-02", fullName: "Maya Rodriguez", displayName: "Maya R.", specialisations: ["Pilates", "Yoga"], certifications: ["Pilates Instructor Cert", "RYT-200"], email: "maya@fiitco.ca", phone: "416-555-0102", status: "Active", joinDate: "2024-03-01" },
      { instructorId: "INS-03", fullName: "Diego Fernandez", displayName: "Diego F.", specialisations: ["Boxing", "Hybrid"], certifications: ["Boxing Coach Level 1", "CPT"], email: "diego@fiitco.ca", phone: "416-555-0103", status: "Active", joinDate: "2024-06-01" },
      { instructorId: "INS-04", fullName: "Priya Kapoor", displayName: "Priya K.", specialisations: ["Strength & Conditioning", "Hybrid"], certifications: ["CPT", "CSCS"], email: "priya@fiitco.ca", phone: "416-555-0104", status: "Active", joinDate: "2024-08-01" },
      { instructorId: "INS-05", fullName: "Marcus Thompson", displayName: "Marcus T.", specialisations: ["Yoga", "Pilates"], certifications: ["RYT-500", "Pilates Instructor Cert"], email: "marcus@fiitco.ca", phone: "416-555-0105", status: "Active", joinDate: "2024-10-01" },
    ];
    for (const i of instructors) await ctx.db.insert("instructors", i);

    const classes = [
      { classId: "CLS-01", categoryId: "CAT-01", categoryName: "Strength & Conditioning", subcategoryName: "Upper Body", name: "Upper Body Lift", tier: "Intermediate", durationMinutes: 60, description: "Upper body resistance training focusing on push/pull movements", active: true },
      { classId: "CLS-02", categoryId: "CAT-01", categoryName: "Strength & Conditioning", subcategoryName: "Lower Body", name: "Lower Body Burn", tier: "Intermediate", durationMinutes: 60, description: "Lower body resistance and explosive movements", active: true },
      { classId: "CLS-03", categoryId: "CAT-01", categoryName: "Strength & Conditioning", subcategoryName: "Full Body", name: "Butts & Guts", tier: "Beginner", durationMinutes: 45, description: "Full body conditioning with emphasis on glutes and core", active: true },
      { classId: "CLS-04", categoryId: "CAT-02", categoryName: "Boxing", subcategoryName: "Beginner Boxing", name: "Boxing Fundamentals", tier: "Beginner", durationMinutes: 60, description: "Introduction to boxing stance, guard, jab-cross combinations", active: true },
      { classId: "CLS-05", categoryId: "CAT-02", categoryName: "Boxing", subcategoryName: "Advanced Boxing", name: "Power Boxing", tier: "Advanced", durationMinutes: 60, description: "Advanced combinations, heavy bag power training, footwork drills", active: true },
      { classId: "CLS-06", categoryId: "CAT-03", categoryName: "Hybrid", subcategoryName: "Hybrid Standard", name: "Hybrid Circuit", tier: "All Levels", durationMinutes: 60, description: "30 min bag work + 30 min full body conditioning circuit", active: true },
      { classId: "CLS-07", categoryId: "CAT-04", categoryName: "Pilates", subcategoryName: "Mat Pilates", name: "Core Pilates", tier: "All Levels", durationMinutes: 45, description: "Mat-based Pilates targeting deep core stabilisers", active: true },
      { classId: "CLS-08", categoryId: "CAT-05", categoryName: "Yoga", subcategoryName: "Flow Yoga", name: "Yoga Flow", tier: "All Levels", durationMinutes: 60, description: "Dynamic vinyasa yoga to improve flexibility and recovery", active: true },
    ];
    for (const c of classes) await ctx.db.insert("classes", c);

    // ── Users (seed if empty) ──────────────────────────────────
    const existingUsers = await ctx.db.query("users").collect();
    let usersSeeded = 0;
    if (existingUsers.length === 0) {
      const seedUsers = [
        { email: "arden@fiitco.ca", password: btoa("fiitco2024"), fullName: "Arden Hamilton", displayName: "Arden (Admin)", role: "admin", status: "active", securityQuestion: "What city were you born in?", securityAnswer: "toronto", createdAt: "2024-01-01T00:00:00.000Z" },
        { email: "jason@fiitco.ca", password: btoa("fiitco2024"), fullName: "Jason Villanueva", displayName: "Jason V.", role: "instructor", instructorId: "INS-01", status: "active", securityQuestion: "What is your favourite fitness exercise?", securityAnswer: "boxing", createdAt: "2024-01-15T00:00:00.000Z" },
        { email: "maya@fiitco.ca", password: btoa("fiitco2024"), fullName: "Maya Rodriguez", displayName: "Maya R.", role: "instructor", instructorId: "INS-02", status: "active", securityQuestion: "What is your pet's name?", securityAnswer: "luna", createdAt: "2024-03-01T00:00:00.000Z" },
        { email: "diego@fiitco.ca", password: btoa("fiitco2024"), fullName: "Diego Fernandez", displayName: "Diego F.", role: "instructor", instructorId: "INS-03", status: "active", securityQuestion: "What city were you born in?", securityAnswer: "bogota", createdAt: "2024-06-01T00:00:00.000Z" },
        { email: "priya@fiitco.ca", password: btoa("fiitco2024"), fullName: "Priya Kapoor", displayName: "Priya K.", role: "instructor", instructorId: "INS-04", status: "active", securityQuestion: "What was your first school?", securityAnswer: "maple leaf", createdAt: "2024-08-01T00:00:00.000Z" },
        { email: "marcus@fiitco.ca", password: btoa("fiitco2024"), fullName: "Marcus Thompson", displayName: "Marcus T.", role: "instructor", instructorId: "INS-05", status: "active", securityQuestion: "What is your favourite fitness exercise?", securityAnswer: "yoga", createdAt: "2024-10-01T00:00:00.000Z" },
      ];
      for (const u of seedUsers) await ctx.db.insert("users", u);
      usersSeeded = seedUsers.length;
    }

    return { message: "Seed complete", counts: { categories: categories.length, tiers: tiers.length, instructors: instructors.length, classes: classes.length, users: usersSeeded } };
  },
});

export const addClass = mutation({
  args: {
    classId: v.string(), categoryId: v.string(), categoryName: v.string(),
    subcategoryName: v.optional(v.string()), name: v.string(), tier: v.string(),
    durationMinutes: v.number(), description: v.string(),
  },
  handler: async (ctx, args) => ctx.db.insert("classes", { ...args, active: true }),
});

export const addInstructor = mutation({
  args: {
    instructorId: v.string(), fullName: v.string(), displayName: v.string(),
    specialisations: v.array(v.string()), certifications: v.array(v.string()),
    email: v.string(), phone: v.string(), joinDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("instructors", { ...args, status: "Active" }),
});

export const addScheduleSlot = mutation({
  args: {
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
    bufferOverrideAcknowledged: v.boolean(),
  },
  handler: async (ctx, args) => {
    // Check for buffer violations on the same date
    const slotsOnDay = await ctx.db
      .query("weeklySchedule")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();

    const newStart = timeToMinutes(args.startTime);
    const newEnd = timeToMinutes(args.endTime);
    let bufferViolation = false;

    for (const slot of slotsOnDay) {
      const slotStart = timeToMinutes(slot.startTime);
      const slotEnd = timeToMinutes(slot.endTime);
      // Check gap between new slot and existing slot
      const gapBefore = newStart - slotEnd;
      const gapAfter = slotStart - newEnd;
      if ((gapBefore >= 0 && gapBefore < 10) || (gapAfter >= 0 && gapAfter < 10)) {
        bufferViolation = true;
        break;
      }
      // Check overlap
      if (newStart < slotEnd && newEnd > slotStart) {
        bufferViolation = true;
        break;
      }
    }

    return ctx.db.insert("weeklySchedule", {
      ...args,
      status: "Scheduled",
      bufferViolation,
    });
  },
});

export const deleteScheduleSlot = mutation({
  args: { id: v.id("weeklySchedule") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

export const acknowledgeBufferOverride = mutation({
  args: { id: v.id("weeklySchedule") },
  handler: async (ctx, args) =>
    ctx.db.patch(args.id, { bufferOverrideAcknowledged: true }),
});

export const addEquipment = mutation({
  args: {
    equipmentId: v.string(),
    name: v.string(),
    category: v.string(),
    quantityAvailable: v.number(),
    location: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("equipment", { ...args, active: true }),
});

export const deleteEquipment = mutation({
  args: { id: v.id("equipment") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

export const addCategory = mutation({
  args: {
    categoryId: v.string(),
    name: v.string(),
    colorCode: v.string(),
    emoji: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => ctx.db.insert("categories", { ...args, active: true }),
});

export const updateCategory = mutation({
  args: {
    id: v.id("categories"),
    name: v.string(),
    colorCode: v.string(),
    emoji: v.string(),
    description: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const oldCat = await ctx.db.get(id);
    await ctx.db.patch(id, fields);

    // Cascade name change across all dependent tables
    if (oldCat && oldCat.name !== fields.name) {
      const oldName = oldCat.name;
      const newName = fields.name;
      const oldCatId = oldCat.categoryId;

      const classes = await ctx.db.query("classes").withIndex("by_categoryId", (q) => q.eq("categoryId", oldCatId)).collect();
      for (const c of classes) await ctx.db.patch(c._id, { categoryName: newName });

      const subs = await ctx.db.query("subcategories").withIndex("by_categoryId", (q) => q.eq("categoryId", oldCatId)).collect();
      for (const s of subs) await ctx.db.patch(s._id, { categoryName: newName });

      const slots = await ctx.db.query("weeklySchedule").collect();
      for (const s of slots) { if (s.categoryName === oldName) await ctx.db.patch(s._id, { categoryName: newName }); }

      const logs = await ctx.db.query("deliveryLog").collect();
      for (const l of logs) { if (l.categoryName === oldName) await ctx.db.patch(l._id, { categoryName: newName }); }

      const exercises = await ctx.db.query("exercises").collect();
      for (const e of exercises) { if (e.category === oldName) await ctx.db.patch(e._id, { category: newName }); }

      const pathways = await ctx.db.query("pathways").collect();
      for (const p of pathways) { if (p.category === oldName) await ctx.db.patch(p._id, { category: newName }); }
    }
  },
});

export const deleteCategory = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, args) => {
    const cat = await ctx.db.get(args.id);
    await ctx.db.delete(args.id);

    // Cascade delete — remove orphaned references
    if (cat) {
      const catName = cat.name;
      const catId = cat.categoryId;

      // Deactivate related classes (don't delete — preserve history)
      const classes = await ctx.db.query("classes").withIndex("by_categoryId", (q) => q.eq("categoryId", catId)).collect();
      for (const c of classes) await ctx.db.patch(c._id, { active: false, categoryName: `${catName} (deleted)` });

      // Update subcategories
      const subs = await ctx.db.query("subcategories").withIndex("by_categoryId", (q) => q.eq("categoryId", catId)).collect();
      for (const s of subs) await ctx.db.patch(s._id, { active: false, categoryName: `${catName} (deleted)` });

      // Mark schedule slots
      const slots = await ctx.db.query("weeklySchedule").collect();
      for (const s of slots) { if (s.categoryName === catName) await ctx.db.patch(s._id, { categoryName: `${catName} (deleted)` }); }

      // Mark delivery logs
      const logs = await ctx.db.query("deliveryLog").collect();
      for (const l of logs) { if (l.categoryName === catName) await ctx.db.patch(l._id, { categoryName: `${catName} (deleted)` }); }

      // Mark exercises
      const exercises = await ctx.db.query("exercises").collect();
      for (const e of exercises) { if (e.category === catName) await ctx.db.patch(e._id, { category: `${catName} (deleted)`, active: false }); }

      // Mark pathways
      const pathways = await ctx.db.query("pathways").collect();
      for (const p of pathways) { if (p.category === catName) await ctx.db.patch(p._id, { category: `${catName} (deleted)`, active: false }); }
    }
  },
});

// ── Equipment ──────────────────────────────────────────────────────────────
export const updateEquipment = mutation({
  args: {
    id: v.id("equipment"),
    name: v.string(),
    category: v.string(),
    quantityAvailable: v.number(),
    location: v.string(),
    notes: v.optional(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, fields);
  },
});

// ── Schedule ────────────────────────────────────────────────────────────────
export const updateScheduleSlot = mutation({
  args: {
    id: v.id("weeklySchedule"),
    startTime: v.string(),
    endTime: v.string(),
    className: v.string(),
    categoryName: v.string(),
    instructorId: v.string(),
    instructorName: v.string(),
    capacity: v.number(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    // re-check buffer violation for updated time
    const allSlots = await ctx.db.query("weeklySchedule").collect();
    const slot = await ctx.db.get(id);
    if (!slot) return;
    const sameDay = allSlots.filter(s => s._id !== id && s.date === slot.date);
    const newStart = timeToMinutes(fields.startTime);
    const newEnd   = timeToMinutes(fields.endTime);
    let bufferViolation = false;
    for (const other of sameDay) {
      const os = timeToMinutes(other.startTime);
      const oe = timeToMinutes(other.endTime);
      if (Math.abs(newStart - oe) < 10 || Math.abs(os - newEnd) < 10) {
        bufferViolation = true;
        break;
      }
    }
    return ctx.db.patch(id, { ...fields, bufferViolation, bufferOverrideAcknowledged: false });
  },
});

// ── Classes ─────────────────────────────────────────────────────────────────
export const updateClass = mutation({
  args: {
    id: v.id("classes"),
    name: v.string(),
    categoryId: v.string(),
    categoryName: v.string(),
    subcategoryName: v.optional(v.string()),
    tier: v.string(),
    durationMinutes: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, fields);
  },
});

export const deleteClass = mutation({
  args: { id: v.id("classes") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

// ── Lesson Plans (Class Programs) ──────────────────────────────────────────
export const addClassProgram = mutation({
  args: {
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("classPrograms", {
    ...args,
    submittedAt: args.status === "Submitted" ? new Date().toISOString() : undefined,
    approvedAt: undefined,
    approvedBy: undefined,
  }),
});

export const updateClassProgram = mutation({
  args: {
    id: v.id("classPrograms"),
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    const existing = await ctx.db.get(id);
    if (!existing) return;
    const submittedAt = fields.status === "Submitted" && !existing.submittedAt
      ? new Date().toISOString() : existing.submittedAt;
    return ctx.db.patch(id, { ...fields, submittedAt });
  },
});

export const deleteClassProgram = mutation({
  args: { id: v.id("classPrograms") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

export const approveClassProgram = mutation({
  args: { id: v.id("classPrograms"), approvedBy: v.string() },
  handler: async (ctx, args) =>
    ctx.db.patch(args.id, { status: "Approved", approvedAt: new Date().toISOString(), approvedBy: args.approvedBy }),
});

// ── Delivery Log ────────────────────────────────────────────────────────────
export const addDeliveryLog = mutation({
  args: {
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
  },
  handler: async (ctx, args) => ctx.db.insert("deliveryLog", args),
});

export const updateDeliveryLog = mutation({
  args: {
    id: v.id("deliveryLog"),
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
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, fields);
  },
});

export const deleteDeliveryLog = mutation({
  args: { id: v.id("deliveryLog") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

// ── Pathways ────────────────────────────────────────────────────────────────
export const addPathway = mutation({
  args: {
    pathwayId: v.string(),
    title: v.string(),
    category: v.string(),
    targetTier: v.string(),
    durationWeeks: v.number(),
    goal: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => ctx.db.insert("pathways", { ...args, active: true }),
});

export const updatePathway = mutation({
  args: {
    id: v.id("pathways"),
    title: v.string(),
    category: v.string(),
    targetTier: v.string(),
    durationWeeks: v.number(),
    goal: v.string(),
    description: v.string(),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, fields);
  },
});

export const deletePathway = mutation({
  args: { id: v.id("pathways") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

// ── Exercises ───────────────────────────────────────────────────────────────
export const addExercise = mutation({
  args: {
    exerciseId: v.string(),
    name: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    tier: v.optional(v.string()),
    description: v.string(),
    equipment: v.array(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("exercises", { ...args, active: true }),
});

export const updateExercise = mutation({
  args: {
    id: v.id("exercises"),
    name: v.string(),
    category: v.string(),
    subcategory: v.optional(v.string()),
    tier: v.optional(v.string()),
    description: v.string(),
    equipment: v.array(v.string()),
    active: v.boolean(),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, fields);
  },
});

export const deleteExercise = mutation({
  args: { id: v.id("exercises") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

// ── Instructors ─────────────────────────────────────────────────────────────
export const updateInstructor = mutation({
  args: {
    id: v.id("instructors"),
    fullName: v.string(),
    displayName: v.string(),
    specialisations: v.array(v.string()),
    certifications: v.array(v.string()),
    email: v.string(),
    phone: v.string(),
    status: v.string(),
    joinDate: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, fields);
  },
});

export const deleteInstructor = mutation({
  args: { id: v.id("instructors") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

// ── Availability ─────────────────────────────────────────────────────────────
export const addAvailability = mutation({
  args: {
    instructorId: v.string(),
    instructorName: v.string(),
    dayOfWeek: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    available: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => ctx.db.insert("availability", args),
});

export const updateAvailability = mutation({
  args: {
    id: v.id("availability"),
    instructorId: v.string(),
    instructorName: v.string(),
    dayOfWeek: v.string(),
    startTime: v.string(),
    endTime: v.string(),
    available: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, fields);
  },
});

export const deleteAvailability = mutation({
  args: { id: v.id("availability") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});

// ── Force Reseed — clears all data and loads full Excel v4 dataset ─────────
export const forceReseed = mutation({
  args: {},
  handler: async (ctx) => {
    // Clear all tables
    for (const table of [
      "categories", "subcategories", "classes", "instructors", "tiers",
      "equipment", "pathways", "exercises", "weeklySchedule",
      "classPrograms", "deliveryLog", "clientJourneys", "availability",
    ] as const) {
      const rows = await ctx.db.query(table).collect();
      for (const r of rows) await ctx.db.delete(r._id);
    }

    // ── Categories ────────────────────────────────────────────────────────
    const categories = [
      { categoryId: "CAT-01", name: "Strength & Conditioning", colorCode: "D6E8F5", emoji: "💪", description: "Focused resistance and weight training to build strength and muscle", active: true },
      { categoryId: "CAT-02", name: "Boxing",                  colorCode: "FDDBD5", emoji: "🥊", description: "Technique-based boxing training including bag work, combinations, and footwork", active: true },
      { categoryId: "CAT-03", name: "Hybrid",                  colorCode: "EDE7F6", emoji: "🔀", description: "Half boxing bag work and half full body conditioning circuit training", active: true },
      { categoryId: "CAT-04", name: "Pilates",                 colorCode: "FCE4EC", emoji: "🧘", description: "Core-focused movement and flexibility training using Pilates principles", active: true },
      { categoryId: "CAT-05", name: "Yoga",                    colorCode: "E0F2F1", emoji: "🌿", description: "Mindfulness, flexibility, and recovery-focused yoga sessions", active: true },
    ];
    for (const c of categories) await ctx.db.insert("categories", c);

    // ── Subcategories (14 — mapped from Arden's programming data) ────────
    const subcategories = [
      { subcategoryId: "SUB-01", categoryId: "CAT-01", categoryName: "Strength & Conditioning", name: "Lower Body",       description: "Quads, hamstrings, glutes, calves focus", active: true },
      { subcategoryId: "SUB-02", categoryId: "CAT-01", categoryName: "Strength & Conditioning", name: "Upper Body",       description: "Chest, back, shoulders, arms focus", active: true },
      { subcategoryId: "SUB-03", categoryId: "CAT-01", categoryName: "Strength & Conditioning", name: "Core",             description: "Abdominal, oblique, lower back focus", active: true },
      { subcategoryId: "SUB-04", categoryId: "CAT-01", categoryName: "Strength & Conditioning", name: "Full Body Lift",   description: "Compound movements targeting full body", active: true },
      { subcategoryId: "SUB-05", categoryId: "CAT-01", categoryName: "Strength & Conditioning", name: "Glute Isolation",  description: "Targeted glute activation and isolation work", active: true },
      { subcategoryId: "SUB-06", categoryId: "CAT-02", categoryName: "Boxing",                  name: "Technique",        description: "Boxing combinations, defensive moves, power shots", active: true },
      { subcategoryId: "SUB-07", categoryId: "CAT-02", categoryName: "Boxing",                  name: "Beginner Boxing",  description: "Fundamentals: stance, guard, basic combinations", active: true },
      { subcategoryId: "SUB-08", categoryId: "CAT-02", categoryName: "Boxing",                  name: "Advanced Boxing",  description: "Advanced combinations, footwork, sparring drills", active: true },
      { subcategoryId: "SUB-09", categoryId: "CAT-03", categoryName: "Hybrid",                  name: "Conditioning",     description: "Mixed conditioning circuit exercises", active: true },
      { subcategoryId: "SUB-10", categoryId: "CAT-03", categoryName: "Hybrid",                  name: "Explosive Cardio", description: "High-intensity cardio and plyometric movements", active: true },
      { subcategoryId: "SUB-11", categoryId: "CAT-03", categoryName: "Hybrid",                  name: "Hybrid Standard",  description: "Standard 50/50 split: bag work + conditioning circuit", active: true },
      { subcategoryId: "SUB-12", categoryId: "CAT-04", categoryName: "Pilates",                 name: "Mat Pilates",      description: "Floor-based Pilates using bodyweight and mat", active: true },
      { subcategoryId: "SUB-13", categoryId: "CAT-05", categoryName: "Yoga",                    name: "Flow Yoga",        description: "Dynamic vinyasa-style yoga flow", active: true },
      { subcategoryId: "SUB-14", categoryId: "CAT-05", categoryName: "Yoga",                    name: "Restorative Yoga", description: "Slow, recovery-focused yoga with holds", active: true },
    ];
    for (const s of subcategories) await ctx.db.insert("subcategories", s);

    // ── Tiers ─────────────────────────────────────────────────────────────
    const tiers = [
      { tierId: "TIR-01", name: "Beginner",     description: "Entry level — foundational movements, lower intensity, focus on form",                           recommendedFor: "New members or returning after a break",          colorCode: "D6EED6" },
      { tierId: "TIR-02", name: "Intermediate", description: "Moderate intensity — assumes basic technique, introduces combinations and load",                 recommendedFor: "Members with 2–3 months consistent training",     colorCode: "FFF3CD" },
      { tierId: "TIR-03", name: "Advanced",     description: "High intensity — complex movements, heavier load, competition-level demand",                     recommendedFor: "Members with 6+ months consistent training",      colorCode: "FFD6D6" },
      { tierId: "TIR-04", name: "All Levels",   description: "Open to everyone — instructor scales movements to each member's ability",                        recommendedFor: "Any member",                                      colorCode: "E3F2FD" },
    ];
    for (const t of tiers) await ctx.db.insert("tiers", t);

    // ── Instructors ───────────────────────────────────────────────────────
    const instructors = [
      { instructorId: "INS-01", fullName: "Jason Villanueva", displayName: "Jason V.", specialisations: ["Boxing", "Strength & Conditioning"], certifications: ["Boxing Coach Level 2", "CPT"],               email: "jason@fiitco.ca",  phone: "416-555-0101", status: "Active", joinDate: "2024-01-15", notes: "Senior instructor" },
      { instructorId: "INS-02", fullName: "Maya Rodriguez",   displayName: "Maya R.",  specialisations: ["Pilates", "Yoga"],                   certifications: ["Pilates Instructor Cert", "RYT-200"],          email: "maya@fiitco.ca",   phone: "416-555-0102", status: "Active", joinDate: "2024-03-01" },
      { instructorId: "INS-03", fullName: "Diego Fernandez",  displayName: "Diego F.", specialisations: ["Boxing", "Hybrid"],                  certifications: ["Boxing Coach Level 1", "CPT"],                 email: "diego@fiitco.ca",  phone: "416-555-0103", status: "Active", joinDate: "2024-06-01" },
      { instructorId: "INS-04", fullName: "Priya Kapoor",     displayName: "Priya K.", specialisations: ["Strength & Conditioning", "Hybrid"], certifications: ["CPT", "CSCS"],                                 email: "priya@fiitco.ca",  phone: "416-555-0104", status: "Active", joinDate: "2024-08-01" },
      { instructorId: "INS-05", fullName: "Marcus Thompson",  displayName: "Marcus T.",specialisations: ["Yoga", "Pilates"],                   certifications: ["RYT-500", "Pilates Instructor Cert"],           email: "marcus@fiitco.ca", phone: "416-555-0105", status: "Active", joinDate: "2024-10-01" },
    ];
    for (const i of instructors) await ctx.db.insert("instructors", i);

    // ── Classes ───────────────────────────────────────────────────────────
    const classes = [
      { classId: "CLS-01", categoryId: "CAT-01", categoryName: "Strength & Conditioning", subcategoryName: "Upper Body",      name: "Upper Body Lift",      tier: "Intermediate", durationMinutes: 60, description: "Upper body resistance training focusing on push/pull movements", active: true },
      { classId: "CLS-02", categoryId: "CAT-01", categoryName: "Strength & Conditioning", subcategoryName: "Lower Body",      name: "Lower Body Burn",      tier: "Intermediate", durationMinutes: 60, description: "Lower body resistance and explosive movements", active: true },
      { classId: "CLS-03", categoryId: "CAT-01", categoryName: "Strength & Conditioning", subcategoryName: "Full Body Lift",  name: "Butts & Guts",         tier: "Beginner",     durationMinutes: 45, description: "Full body conditioning with emphasis on glutes and core", active: true },
      { classId: "CLS-04", categoryId: "CAT-02", categoryName: "Boxing",                  subcategoryName: "Beginner Boxing", name: "Boxing Fundamentals",  tier: "Beginner",     durationMinutes: 60, description: "Introduction to boxing stance, guard, jab-cross combinations", active: true },
      { classId: "CLS-05", categoryId: "CAT-02", categoryName: "Boxing",                  subcategoryName: "Advanced Boxing", name: "Power Boxing",         tier: "Advanced",     durationMinutes: 60, description: "Advanced combinations, heavy bag power training, footwork drills", active: true },
      { classId: "CLS-06", categoryId: "CAT-03", categoryName: "Hybrid",                  subcategoryName: "Hybrid Standard", name: "Hybrid Circuit",       tier: "All Levels",   durationMinutes: 60, description: "30 min bag work + 30 min full body conditioning circuit", active: true },
      { classId: "CLS-07", categoryId: "CAT-04", categoryName: "Pilates",                 subcategoryName: "Mat Pilates",     name: "Core Pilates",         tier: "All Levels",   durationMinutes: 45, description: "Mat-based Pilates targeting deep core stabilisers", active: true },
      { classId: "CLS-08", categoryId: "CAT-05", categoryName: "Yoga",                    subcategoryName: "Flow Yoga",       name: "Yoga Flow",            tier: "All Levels",   durationMinutes: 60, description: "Dynamic vinyasa yoga to improve flexibility and recovery", active: true },
    ];
    for (const c of classes) await ctx.db.insert("classes", c);

    // ── Equipment ─────────────────────────────────────────────────────────
    const equipment = [
      { equipmentId: "EQP-01", name: "Boxing Gloves",     category: "Boxing",      quantityAvailable: 20, location: "Main Floor",  notes: "Multiple sizes available", active: true },
      { equipmentId: "EQP-02", name: "Heavy Bag",         category: "Boxing",      quantityAvailable: 8,  location: "Bag Area",    notes: "Wall-mounted",             active: true },
      { equipmentId: "EQP-03", name: "Speed Bag",         category: "Boxing",      quantityAvailable: 4,  location: "Bag Area",    active: true },
      { equipmentId: "EQP-04", name: "Jump Rope",         category: "Cardio",      quantityAvailable: 15, location: "Storage",     active: true },
      { equipmentId: "EQP-05", name: "Dumbbells (set)",   category: "Weights",     quantityAvailable: 6,  location: "Weight Area", notes: "5 lb to 50 lb",            active: true },
      { equipmentId: "EQP-06", name: "Barbell + Plates",  category: "Weights",     quantityAvailable: 4,  location: "Weight Area", active: true },
      { equipmentId: "EQP-07", name: "Kettlebells (set)", category: "Weights",     quantityAvailable: 3,  location: "Weight Area", notes: "10 lb, 25 lb, 35 lb",      active: true },
      { equipmentId: "EQP-08", name: "Resistance Bands",  category: "Mats & Props",quantityAvailable: 20, location: "Storage",     notes: "Light, medium, heavy",     active: true },
      { equipmentId: "EQP-09", name: "Yoga Mat",          category: "Mats & Props",quantityAvailable: 25, location: "Storage",     active: true },
      { equipmentId: "EQP-10", name: "Foam Roller",       category: "Mats & Props",quantityAvailable: 10, location: "Storage",     active: true },
      { equipmentId: "EQP-11", name: "Medicine Ball",     category: "Weights",     quantityAvailable: 8,  location: "Main Floor",  notes: "10 lb, 15 lb, 20 lb",      active: true },
      { equipmentId: "EQP-12", name: "Pull-Up Bar",       category: "Weights",     quantityAvailable: 3,  location: "Main Floor",  notes: "Wall-mounted",             active: true },
    ];
    for (const e of equipment) await ctx.db.insert("equipment", e);

    // ── Pathways ──────────────────────────────────────────────────────────
    const pathways = [
      { pathwayId: "PTH-01", title: "Beginner Boxing Journey",   category: "Boxing",                  targetTier: "Beginner",     durationWeeks: 6,  goal: "Learn boxing fundamentals",     description: "A structured 6-week introduction to boxing technique, footwork, and bag work", active: true },
      { pathwayId: "PTH-02", title: "Strength Builder",          category: "Strength & Conditioning", targetTier: "Intermediate", durationWeeks: 8,  goal: "Build functional strength",      description: "Progressive overload 8-week plan across upper, lower, and full body sessions", active: true },
      { pathwayId: "PTH-03", title: "Hybrid Conditioning",       category: "Hybrid",                  targetTier: "All Levels",   durationWeeks: 6,  goal: "Improve overall fitness",        description: "6-week hybrid programme combining bag work and conditioning circuits", active: true },
      { pathwayId: "PTH-04", title: "Flexibility & Recovery",    category: "Yoga",                    targetTier: "All Levels",   durationWeeks: 4,  goal: "Improve mobility and recovery",  description: "4-week rotation of yoga and Pilates sessions for flexibility and injury prevention", active: true },
      { pathwayId: "PTH-05", title: "Fight Prep",                category: "Boxing",                  targetTier: "Advanced",     durationWeeks: 12, goal: "Prepare for competition",        description: "12-week progressive fight preparation programme", active: true },
    ];
    for (const p of pathways) await ctx.db.insert("pathways", p);

    // ── Exercises (115 — extracted from Arden's FIIT CLASSES .xlsx) ──────
    const exercises = [
      // ── S&C — Lower Body (14) ──
      { exerciseId: "EXC-001", name: "Squats", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "All Levels", description: "Standard bodyweight or weighted squat", equipment: [], active: true },
      { exerciseId: "EXC-002", name: "Goblet Squats", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Beginner+", description: "Squat holding dumbbell at chest", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-003", name: "Figure 8 Squats", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate", description: "Squat with dumbbell figure-8 pass between legs", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-004", name: "Drop Squats", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Beginner+", description: "Quick drop into deep squat position", equipment: [], active: true },
      { exerciseId: "EXC-005", name: "Squat Thrusters", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate", description: "Squat + overhead press in one movement", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-006", name: "Back Lunges", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "All Levels", description: "Reverse lunge stepping backwards", equipment: [], active: true },
      { exerciseId: "EXC-007", name: "Curtsy Lunge + Curl", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate", description: "Curtsy lunge with bicep curl at bottom", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-008", name: "Bulgarian Split Squats", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate+", description: "Rear foot elevated single-leg squat", equipment: [], active: true },
      { exerciseId: "EXC-009", name: "One Leg Dead Lift", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate", description: "Single leg Romanian deadlift — hinge at hip", equipment: [], active: true },
      { exerciseId: "EXC-010", name: "Deadlift", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate+", description: "Standard hip-hinge deadlift", equipment: ["Barbell + Plates"], active: true },
      { exerciseId: "EXC-011", name: "Horse Stance", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Beginner", description: "Wide stance isometric hold (martial arts base)", equipment: [], active: true },
      { exerciseId: "EXC-012", name: "Goblet Squat Alt Lunge", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate", description: "Goblet squat alternating with lunges", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-013", name: "Weighted Hip Thrust", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate+", description: "Hip thrust with barbell or plate on lap", equipment: ["Barbell + Plates"], active: true },
      { exerciseId: "EXC-014", name: "BB Split Squat", category: "Strength & Conditioning", subcategory: "Lower Body", tier: "Intermediate+", description: "Barbell-loaded split squat", equipment: ["Barbell + Plates"], active: true },
      // ── S&C — Upper Body (13) ──
      { exerciseId: "EXC-015", name: "Bent Over Rows", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate", description: "Hinge forward, pull dumbbells/barbell to ribcage", equipment: ["Barbell + Plates"], active: true },
      { exerciseId: "EXC-016", name: "Renegade Rows", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate+", description: "Plank position, alternating rows with dumbbells", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-017", name: "Gorilla Rows", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate", description: "Wide stance, alternating explosive dumbbell rows", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-018", name: "One Arm Rows", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Beginner+", description: "Single-arm dumbbell row", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-019", name: "Double Bear Rows", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate+", description: "Bear crawl position, row both dumbbells", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-020", name: "Good Mornings", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate", description: "Standing hip hinge with bar on back — posterior chain", equipment: ["Barbell + Plates"], active: true },
      { exerciseId: "EXC-021", name: "Barbell Reverse Body Weight Row", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Beginner+", description: "Inverted row under barbell (like TRX row)", equipment: ["Barbell + Plates"], active: true },
      { exerciseId: "EXC-022", name: "Push Ups", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "All Levels", description: "Standard push-up — chest, shoulders, triceps", equipment: [], active: true },
      { exerciseId: "EXC-023", name: "Tap Push Ups", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate", description: "Push-up with hand tap at top of each rep", equipment: [], active: true },
      { exerciseId: "EXC-024", name: "Bench Press", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate+", description: "Flat bench barbell press", equipment: ["Barbell + Plates"], active: true },
      { exerciseId: "EXC-025", name: "Arnold Press", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate", description: "Standing/seated rotational dumbbell press", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-026", name: "Squat Rack Squats", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Intermediate+", description: "Barbell back squat on squat rack", equipment: ["Barbell + Plates"], active: true },
      { exerciseId: "EXC-027", name: "TRX Pull Ups", category: "Strength & Conditioning", subcategory: "Upper Body", tier: "Beginner+", description: "Pull-ups using TRX straps (angle-adjustable)", equipment: ["Resistance Bands"], active: true },
      // ── S&C — Core (19) ──
      { exerciseId: "EXC-028", name: "Core Twists", category: "Strength & Conditioning", subcategory: "Core", tier: "All Levels", description: "Seated or standing rotational twist with weight", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-029", name: "Weighted Banana", category: "Strength & Conditioning", subcategory: "Core", tier: "Intermediate", description: "Lying face up, hold weight, extend into banana shape", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-030", name: "Triangles", category: "Strength & Conditioning", subcategory: "Core", tier: "Intermediate", description: "Core exercise — triangle-pattern movement on mat", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-031", name: "Dumbbell In and Out", category: "Strength & Conditioning", subcategory: "Core", tier: "Intermediate", description: "Seated, legs extended, pull DBs in/out with crunch", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-032", name: "Dumbbell Windshield Wipers", category: "Strength & Conditioning", subcategory: "Core", tier: "Advanced", description: "Lying, legs up, rotate side to side holding DB", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-033", name: "Around the World Balance", category: "Strength & Conditioning", subcategory: "Core", tier: "Intermediate+", description: "Standing single-leg, circle weight around body", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-034", name: "Ab Thrusters", category: "Strength & Conditioning", subcategory: "Core", tier: "Intermediate", description: "Lying, thrust legs upward for lower abs", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-035", name: "V Sit + Curl", category: "Strength & Conditioning", subcategory: "Core", tier: "Advanced", description: "V-sit position holding bicep curl", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-036", name: "Knees In Out", category: "Strength & Conditioning", subcategory: "Core", tier: "Beginner+", description: "Seated, pull knees in and extend out", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-037", name: "Side Plank Dips", category: "Strength & Conditioning", subcategory: "Core", tier: "Intermediate", description: "Side plank, dip hip to floor and raise", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-038", name: "One Leg Dog", category: "Strength & Conditioning", subcategory: "Core", tier: "Beginner+", description: "Single-leg bird-dog variation on all fours", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-039", name: "Core Tucks", category: "Strength & Conditioning", subcategory: "Core", tier: "Beginner+", description: "Tuck knees to chest from lying/hanging position", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-040", name: "Super Pulses", category: "Strength & Conditioning", subcategory: "Core", tier: "Beginner", description: "Lying face down, pulse upper body and legs up", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-041", name: "Double Rainbows", category: "Strength & Conditioning", subcategory: "Core", tier: "Intermediate", description: "Seated, rotate weight in rainbow arc overhead", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-042", name: "Russian Twist", category: "Strength & Conditioning", subcategory: "Core", tier: "All Levels", description: "Seated, lean back 45 degrees, rotate side to side", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-043", name: "Toe Crunches", category: "Strength & Conditioning", subcategory: "Core", tier: "Beginner", description: "Lie flat, reach hands to toes in crunch", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-044", name: "Plank + Weight Cross Over", category: "Strength & Conditioning", subcategory: "Core", tier: "Intermediate+", description: "Plank position, pass weight under body side to side", equipment: ["Dumbbells (set)", "Yoga Mat"], active: true },
      { exerciseId: "EXC-045", name: "Toe Taps", category: "Strength & Conditioning", subcategory: "Core", tier: "Beginner", description: "Lying, alternating toe taps to floor", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-046", name: "Elbow Plank", category: "Strength & Conditioning", subcategory: "Core", tier: "All Levels", description: "Standard forearm plank hold", equipment: ["Yoga Mat"], active: true },
      // ── S&C — Full Body Lift (11) ──
      { exerciseId: "EXC-047", name: "Curl + Squat", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Beginner+", description: "Bicep curl combined with squat", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-048", name: "Curl + Squat + Press", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Intermediate", description: "Curl into squat into overhead press — full chain", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-049", name: "Lunge + Curl", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Beginner+", description: "Lunge with bicep curl at bottom", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-050", name: "Makers (Man Makers)", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Advanced", description: "Row-Row, push-up, clean, press from plank position", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-051", name: "Row-Row Push Up", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Intermediate+", description: "Renegade row each arm + push-up", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-052", name: "Burpee Thrusters", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Advanced", description: "Burpee + dumbbell thruster combination", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-053", name: "Devils Press", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Advanced", description: "Burpee with dumbbell snatch overhead", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-054", name: "Demon Crunches", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Intermediate+", description: "Explosive crunch variation — full body engagement", equipment: [], active: true },
      { exerciseId: "EXC-055", name: "Flighter Thrusters", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Intermediate", description: "Fighting-stance thruster with dumbbells", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-056", name: "One Arm Thrusters", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "Intermediate", description: "Single-arm squat + press", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-057", name: "Farmers Walk", category: "Strength & Conditioning", subcategory: "Full Body Lift", tier: "All Levels", description: "Walk carrying heavy dumbbells/kettlebells at sides", equipment: ["Dumbbells (set)"], active: true },
      // ── S&C — Glute Isolation (7) ──
      { exerciseId: "EXC-058", name: "Banded Sideways Squat Walk", category: "Strength & Conditioning", subcategory: "Glute Isolation", tier: "Beginner+", description: "Side-step squat walk with resistance band", equipment: ["Resistance Bands"], active: true },
      { exerciseId: "EXC-059", name: "Side Lying Leg Series", category: "Strength & Conditioning", subcategory: "Glute Isolation", tier: "Beginner", description: "Raises (10), circles forward/back (5/5), pulses (10)", equipment: ["Resistance Bands"], active: true },
      { exerciseId: "EXC-060", name: "Banded Back Kicks", category: "Strength & Conditioning", subcategory: "Glute Isolation", tier: "Beginner", description: "10 side-to-side straight leg kicks with band", equipment: ["Resistance Bands"], active: true },
      { exerciseId: "EXC-061", name: "Donkey Kicks", category: "Strength & Conditioning", subcategory: "Glute Isolation", tier: "Beginner", description: "All fours, kick one leg up behind — squeeze glutes", equipment: [], active: true },
      { exerciseId: "EXC-062", name: "Alternating Banded Knee Drives", category: "Strength & Conditioning", subcategory: "Glute Isolation", tier: "Intermediate", description: "Crunch + alternating banded knee drive x10", equipment: ["Resistance Bands"], active: true },
      { exerciseId: "EXC-063", name: "Side Kneeling Hip Dip + Shoulder Press", category: "Strength & Conditioning", subcategory: "Glute Isolation", tier: "Intermediate", description: "Kneeling lateral hip dip with overhead press", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-064", name: "3 Side Squat / Curtsy Lunge (Banded)", category: "Strength & Conditioning", subcategory: "Glute Isolation", tier: "Intermediate+", description: "3 lateral squats into curtsy lunge, banded + 25 lbs", equipment: ["Resistance Bands", "Dumbbells (set)"], active: true },
      // ── Boxing — Technique (20) ──
      { exerciseId: "EXC-065", name: "1-1-2 (Jab-Jab-Cross)", category: "Boxing", subcategory: "Technique", tier: "Beginner", description: "Basic double jab + cross — most fundamental combo", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-066", name: "3-4-3 (L.Hook-R.Hook-L.Hook)", category: "Boxing", subcategory: "Technique", tier: "Intermediate", description: "Hook combination — power rotation", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-067", name: "2-1-2 (Cross-Jab-Cross)", category: "Boxing", subcategory: "Technique", tier: "Intermediate", description: "Reverse combo — lead with power hand", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-068", name: "4-3-2 (R.Hook-L.Hook-Cross)", category: "Boxing", subcategory: "Technique", tier: "Intermediate", description: "Hook-Hook-Cross — power exit", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-069", name: "6-3-2 (R.Upper-L.Hook-Cross)", category: "Boxing", subcategory: "Technique", tier: "Intermediate+", description: "Uppercut into hook exit", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-070", name: "5-3-2 (L.Upper-L.Hook-Cross)", category: "Boxing", subcategory: "Technique", tier: "Intermediate+", description: "Lead upper into hook exit", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-071", name: "5-6-5-6 (Uppercut Flurry)", category: "Boxing", subcategory: "Technique", tier: "Intermediate", description: "Double uppercut combo — speed/power", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-072", name: "5-6-5-6 Cover Up", category: "Boxing", subcategory: "Technique", tier: "Intermediate+", description: "Uppercut flurry + defensive guard return", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-073", name: "1-2-1-2 (Jab-Cross Burnout)", category: "Boxing", subcategory: "Technique", tier: "All Levels", description: "Rapid jab-cross repeating — speed/endurance", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-074", name: "1-1-2-3 (Jab-Jab-Cross-Hook)", category: "Boxing", subcategory: "Technique", tier: "Beginner+", description: "Extended basic — add hook", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-075", name: "1-1-2-5-6 (Basic to Uppercuts)", category: "Boxing", subcategory: "Technique", tier: "Intermediate", description: "Jab-Jab-Cross then switch to uppercuts", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-076", name: "3-4-3-4-1-1 (Hook Heavy)", category: "Boxing", subcategory: "Technique", tier: "Advanced", description: "Hook-dominant combo finishing with jabs", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-077", name: "5-6-3-4-1-2 (Full Combo)", category: "Boxing", subcategory: "Technique", tier: "Advanced", description: "Uppercuts-Hooks-Jab-Cross — all 6 punch types", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-078", name: "1-2 Roll Left 3-2", category: "Boxing", subcategory: "Technique", tier: "Advanced", description: "Jab-Cross, defensive roll, Hook-Cross", equipment: ["Boxing Gloves"], active: true },
      { exerciseId: "EXC-079", name: "1-1-2 Rock Back 2-1-2", category: "Boxing", subcategory: "Technique", tier: "Advanced", description: "Jab-Jab-Cross, pull back, Cross-Jab-Cross", equipment: ["Boxing Gloves"], active: true },
      { exerciseId: "EXC-080", name: "1-2 Slip Right 2-3-2", category: "Boxing", subcategory: "Technique", tier: "Advanced", description: "Jab-Cross, defensive slip, Cross-Hook-Cross", equipment: ["Boxing Gloves"], active: true },
      { exerciseId: "EXC-081", name: "Bob Right - Bob Left 3-2", category: "Boxing", subcategory: "Technique", tier: "Advanced", description: "Defensive bob both sides, finish with Hook-Cross", equipment: ["Boxing Gloves"], active: true },
      { exerciseId: "EXC-082", name: "1-2 Elbow Block 2-1", category: "Boxing", subcategory: "Technique", tier: "Advanced", description: "Jab-Cross, elbow block, Cross-Jab (defensive drill)", equipment: ["Boxing Gloves"], active: true },
      { exerciseId: "EXC-083", name: "Power Hooks", category: "Boxing", subcategory: "Technique", tier: "Intermediate+", description: "Left and Right hooks — max power", equipment: ["Heavy Bag", "Boxing Gloves"], active: true },
      { exerciseId: "EXC-084", name: "Plank Hammer Punches", category: "Boxing", subcategory: "Technique", tier: "Intermediate", description: "Plank position, hammer fists on floor", equipment: [], active: true },
      // ── Hybrid — Conditioning (17) ──
      { exerciseId: "EXC-085", name: "Bear Crawl", category: "Hybrid", subcategory: "Conditioning", tier: "All Levels", description: "Forward/backward crawl in bear position", equipment: [], active: true },
      { exerciseId: "EXC-086", name: "Sumo Drop Squat Rise Pulses", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Wide stance drop squat, rise with pulses", equipment: [], active: true },
      { exerciseId: "EXC-087", name: "T Spine Rotations", category: "Hybrid", subcategory: "Conditioning", tier: "Beginner", description: "Thoracic spine rotation from plank/quadruped", equipment: [], active: true },
      { exerciseId: "EXC-088", name: "Squat Cross Over", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Squat with rotational cross-over movement", equipment: ["Dumbbells (set)"], active: true },
      { exerciseId: "EXC-089", name: "Fight From the Bottom", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Ground-to-standing fighting drill", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-090", name: "Chest Taps", category: "Hybrid", subcategory: "Conditioning", tier: "Beginner", description: "Plank position, alternating hand-to-chest taps", equipment: [], active: true },
      { exerciseId: "EXC-091", name: "Down-Down-Up-Up", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Plank to elbow plank and back — alternating", equipment: [], active: true },
      { exerciseId: "EXC-092", name: "Shuffle Hop Drop", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Lateral shuffle, hop, drop to squat", equipment: [], active: true },
      { exerciseId: "EXC-093", name: "Fighter Switch Stances", category: "Hybrid", subcategory: "Conditioning", tier: "Beginner", description: "Quick alternating fighting stance switches", equipment: [], active: true },
      { exerciseId: "EXC-094", name: "Fighter Squats (Hands Up)", category: "Hybrid", subcategory: "Conditioning", tier: "Beginner", description: "Squats maintaining boxing guard throughout", equipment: [], active: true },
      { exerciseId: "EXC-095", name: "Shuffle Punch (5-6-5-6)", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Lateral shuffle with uppercut punches", equipment: [], active: true },
      { exerciseId: "EXC-096", name: "Pilates Back Lunge Knee Raise", category: "Hybrid", subcategory: "Conditioning", tier: "Beginner+", description: "Reverse lunge into knee raise (Pilates form)", equipment: [], active: true },
      { exerciseId: "EXC-097", name: "Pilates Core Crunch Around World", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Crunch with rotational around the world motion", equipment: ["Yoga Mat"], active: true },
      { exerciseId: "EXC-098", name: "Frog Hop Land Bear Crawl", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate+", description: "Frog jump, land, transition into bear crawl", equipment: [], active: true },
      { exerciseId: "EXC-099", name: "Death Frogs (Back and Forth)", category: "Hybrid", subcategory: "Conditioning", tier: "Advanced", description: "Frog jumps forward and backward continuously", equipment: [], active: true },
      { exerciseId: "EXC-100", name: "Stationary Gorilla Lunges", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Heavy lunges in gorilla-style low position", equipment: [], active: true },
      { exerciseId: "EXC-101", name: "Barre Ball Round House Hip Conditioning", category: "Hybrid", subcategory: "Conditioning", tier: "Intermediate", description: "Barre ball with round house hip circles", equipment: [], active: true },
      // ── Hybrid — Explosive Cardio (14) ──
      { exerciseId: "EXC-102", name: "Skipping (Jump Rope)", category: "Hybrid", subcategory: "Explosive Cardio", tier: "All Levels", description: "Single unders, speed skip — timed rounds", equipment: ["Jump Rope"], active: true },
      { exerciseId: "EXC-103", name: "Sprints", category: "Hybrid", subcategory: "Explosive Cardio", tier: "All Levels", description: "Full-speed short sprints (30s-1 min)", equipment: [], active: true },
      { exerciseId: "EXC-104", name: "Mountain Climbers", category: "Hybrid", subcategory: "Explosive Cardio", tier: "All Levels", description: "Plank position, drive knees to chest alternating", equipment: [], active: true },
      { exerciseId: "EXC-105", name: "Assault Bike", category: "Hybrid", subcategory: "Explosive Cardio", tier: "All Levels", description: "All-out effort on assault/air bike", equipment: [], active: true },
      { exerciseId: "EXC-106", name: "Jump Squats", category: "Hybrid", subcategory: "Explosive Cardio", tier: "Intermediate", description: "Explosive squat with max height jump", equipment: [], active: true },
      { exerciseId: "EXC-107", name: "Kick Outs", category: "Hybrid", subcategory: "Explosive Cardio", tier: "Beginner+", description: "From seated, kick legs out and back in", equipment: [], active: true },
      { exerciseId: "EXC-108", name: "Jumping Jacks", category: "Hybrid", subcategory: "Explosive Cardio", tier: "Beginner", description: "Standard jumping jacks — full body warm-up/cardio", equipment: [], active: true },
      { exerciseId: "EXC-109", name: "Skater Lunges", category: "Hybrid", subcategory: "Explosive Cardio", tier: "Intermediate", description: "Lateral bounding from leg to leg — like a speed skater", equipment: [], active: true },
      { exerciseId: "EXC-110", name: "Side Shuffle", category: "Hybrid", subcategory: "Explosive Cardio", tier: "Beginner", description: "Lateral shuffles — athletic footwork drill", equipment: [], active: true },
      { exerciseId: "EXC-111", name: "Frog Jumps", category: "Hybrid", subcategory: "Explosive Cardio", tier: "Intermediate", description: "Deep squat explosive jumps forward", equipment: [], active: true },
      { exerciseId: "EXC-112", name: "Ski Erg", category: "Hybrid", subcategory: "Explosive Cardio", tier: "All Levels", description: "Full-body pull on ski erg machine", equipment: [], active: true },
      { exerciseId: "EXC-113", name: "Rower", category: "Hybrid", subcategory: "Explosive Cardio", tier: "All Levels", description: "Rowing machine — full body cardio", equipment: [], active: true },
      { exerciseId: "EXC-114", name: "Box Jumps", category: "Hybrid", subcategory: "Explosive Cardio", tier: "Intermediate+", description: "Jump onto plyo box, step down, repeat", equipment: [], active: true },
      { exerciseId: "EXC-115", name: "Burpee Sprawl", category: "Hybrid", subcategory: "Explosive Cardio", tier: "Intermediate+", description: "Burpee with wide-leg sprawl at bottom", equipment: [], active: true },
    ];
    for (const e of exercises) await ctx.db.insert("exercises", e);

    // ── Weekly Schedule — Week of March 30–April 5, 2026 ─────────────────
    // Today = Friday April 3, 2026 so this is the current live week
    const schedule = [
      // ── Monday March 30 ──
      { date: "2026-03-30", dayOfWeek: "Mon", startTime: "06:00", endTime: "07:00", className: "Boxing Basics",          categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  capacity: 20, classId: "CLS-04" },
      { date: "2026-03-30", dayOfWeek: "Mon", startTime: "07:00", endTime: "07:45", className: "Pilates Box",            categoryName: "Pilates",                 instructorId: "INS-04", instructorName: "Priya K.",  capacity: 22, classId: "CLS-07" },
      { date: "2026-03-30", dayOfWeek: "Mon", startTime: "08:00", endTime: "09:00", className: "Hybrid Crusher",         categoryName: "Hybrid",                  instructorId: "INS-04", instructorName: "Priya K.",  capacity: 20, classId: "CLS-06" },
      { date: "2026-03-30", dayOfWeek: "Mon", startTime: "12:00", endTime: "13:00", className: "Lunch Box",              categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  capacity: 18, classId: "CLS-04" },
      { date: "2026-03-30", dayOfWeek: "Mon", startTime: "17:00", endTime: "18:00", className: "Power Hour",             categoryName: "Strength & Conditioning", instructorId: "INS-02", instructorName: "Maya R.",   capacity: 16, classId: "CLS-01" },
      { date: "2026-03-30", dayOfWeek: "Mon", startTime: "18:00", endTime: "19:00", className: "Yoga & Box",             categoryName: "Hybrid",                  instructorId: "INS-02", instructorName: "Maya R.",   capacity: 20, classId: "CLS-06" },
      { date: "2026-03-30", dayOfWeek: "Mon", startTime: "19:00", endTime: "20:00", className: "Bag Work",               categoryName: "Boxing",                  instructorId: "INS-02", instructorName: "Maya R.",   capacity: 20, classId: "CLS-05" },
      // ── Tuesday March 31 ──
      { date: "2026-03-31", dayOfWeek: "Tue", startTime: "06:00", endTime: "07:00", className: "Yoga Circuit",           categoryName: "Yoga",                    instructorId: "INS-04", instructorName: "Priya K.",  capacity: 18, classId: "CLS-08" },
      { date: "2026-03-31", dayOfWeek: "Tue", startTime: "07:00", endTime: "08:00", className: "Strength & Conditioning",categoryName: "Strength & Conditioning", instructorId: "INS-01", instructorName: "Jason V.",  capacity: 16, classId: "CLS-01" },
      { date: "2026-03-31", dayOfWeek: "Tue", startTime: "17:00", endTime: "18:00", className: "Fight Night Prep",       categoryName: "Boxing",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 15, classId: "CLS-05" },
      { date: "2026-03-31", dayOfWeek: "Tue", startTime: "18:00", endTime: "19:00", className: "Advanced Boxing",        categoryName: "Boxing",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 14, classId: "CLS-05" },
      { date: "2026-03-31", dayOfWeek: "Tue", startTime: "19:00", endTime: "20:00", className: "Hybrid & Pilates",       categoryName: "Hybrid",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 18, classId: "CLS-06" },
      { date: "2026-03-31", dayOfWeek: "Tue", startTime: "20:00", endTime: "21:00", className: "Late Night HIT",         categoryName: "Hybrid",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 15, classId: "CLS-06" },
      // ── Wednesday April 1 ──
      { date: "2026-04-01", dayOfWeek: "Wed", startTime: "06:00", endTime: "07:00", className: "Boxing Basics",          categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  capacity: 20, classId: "CLS-04" },
      { date: "2026-04-01", dayOfWeek: "Wed", startTime: "07:00", endTime: "07:45", className: "Pilates Box",            categoryName: "Pilates",                 instructorId: "INS-04", instructorName: "Priya K.",  capacity: 22, classId: "CLS-07" },
      { date: "2026-04-01", dayOfWeek: "Wed", startTime: "08:00", endTime: "09:00", className: "Hybrid Crusher",         categoryName: "Hybrid",                  instructorId: "INS-04", instructorName: "Priya K.",  capacity: 20, classId: "CLS-06" },
      { date: "2026-04-01", dayOfWeek: "Wed", startTime: "12:00", endTime: "13:00", className: "Lunch Box",              categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  capacity: 18, classId: "CLS-04" },
      { date: "2026-04-01", dayOfWeek: "Wed", startTime: "17:00", endTime: "18:00", className: "Power Hour",             categoryName: "Strength & Conditioning", instructorId: "INS-02", instructorName: "Maya R.",   capacity: 16, classId: "CLS-01" },
      { date: "2026-04-01", dayOfWeek: "Wed", startTime: "18:00", endTime: "19:00", className: "Yoga & Box",             categoryName: "Hybrid",                  instructorId: "INS-02", instructorName: "Maya R.",   capacity: 20, classId: "CLS-06" },
      { date: "2026-04-01", dayOfWeek: "Wed", startTime: "19:00", endTime: "20:00", className: "Bag Work",               categoryName: "Boxing",                  instructorId: "INS-02", instructorName: "Maya R.",   capacity: 20, classId: "CLS-05" },
      // ── Thursday April 2 ──
      { date: "2026-04-02", dayOfWeek: "Thu", startTime: "06:00", endTime: "07:00", className: "Yoga Circuit",           categoryName: "Yoga",                    instructorId: "INS-04", instructorName: "Priya K.",  capacity: 18, classId: "CLS-08" },
      { date: "2026-04-02", dayOfWeek: "Thu", startTime: "07:00", endTime: "08:00", className: "Strength & Conditioning",categoryName: "Strength & Conditioning", instructorId: "INS-01", instructorName: "Jason V.",  capacity: 16, classId: "CLS-01" },
      { date: "2026-04-02", dayOfWeek: "Thu", startTime: "17:00", endTime: "18:00", className: "Fight Night Prep",       categoryName: "Boxing",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 15, classId: "CLS-05" },
      { date: "2026-04-02", dayOfWeek: "Thu", startTime: "18:00", endTime: "19:00", className: "Advanced Boxing",        categoryName: "Boxing",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 14, classId: "CLS-05" },
      { date: "2026-04-02", dayOfWeek: "Thu", startTime: "19:00", endTime: "20:00", className: "Hybrid & Pilates",       categoryName: "Hybrid",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 18, classId: "CLS-06" },
      { date: "2026-04-02", dayOfWeek: "Thu", startTime: "20:00", endTime: "21:00", className: "Late Night HIT",         categoryName: "Hybrid",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 15, classId: "CLS-06" },
      // ── Friday April 3 (TODAY) ──
      { date: "2026-04-03", dayOfWeek: "Fri", startTime: "06:00", endTime: "07:00", className: "Boxing Basics",          categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  capacity: 20, classId: "CLS-04" },
      { date: "2026-04-03", dayOfWeek: "Fri", startTime: "07:00", endTime: "07:45", className: "Pilates Box",            categoryName: "Pilates",                 instructorId: "INS-04", instructorName: "Priya K.",  capacity: 22, classId: "CLS-07" },
      { date: "2026-04-03", dayOfWeek: "Fri", startTime: "08:00", endTime: "09:00", className: "Hybrid Crusher",         categoryName: "Hybrid",                  instructorId: "INS-04", instructorName: "Priya K.",  capacity: 20, classId: "CLS-06" },
      { date: "2026-04-03", dayOfWeek: "Fri", startTime: "12:00", endTime: "13:00", className: "Lunch Box",              categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  capacity: 18, classId: "CLS-04" },
      { date: "2026-04-03", dayOfWeek: "Fri", startTime: "17:00", endTime: "18:00", className: "Power Hour",             categoryName: "Strength & Conditioning", instructorId: "INS-02", instructorName: "Maya R.",   capacity: 16, classId: "CLS-01" },
      { date: "2026-04-03", dayOfWeek: "Fri", startTime: "18:00", endTime: "19:00", className: "Yoga & Box",             categoryName: "Hybrid",                  instructorId: "INS-02", instructorName: "Maya R.",   capacity: 20, classId: "CLS-06" },
      // ── Saturday April 4 ──
      { date: "2026-04-04", dayOfWeek: "Sat", startTime: "09:00", endTime: "10:00", className: "Weekend Warriors",       categoryName: "Hybrid",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 25, classId: "CLS-06" },
      { date: "2026-04-04", dayOfWeek: "Sat", startTime: "10:00", endTime: "10:45", className: "Full Body Strength",     categoryName: "Strength & Conditioning", instructorId: "INS-05", instructorName: "Marcus T.", capacity: 18, classId: "CLS-03" },
      // ── Sunday April 5 ──
      { date: "2026-04-05", dayOfWeek: "Sun", startTime: "09:00", endTime: "10:00", className: "Sunday Sweat",           categoryName: "Strength & Conditioning", instructorId: "INS-05", instructorName: "Marcus T.", capacity: 20, classId: "CLS-02" },
      { date: "2026-04-05", dayOfWeek: "Sun", startTime: "10:00", endTime: "11:00", className: "Open Sparring",          categoryName: "Boxing",                  instructorId: "INS-03", instructorName: "Diego F.",  capacity: 12, classId: "CLS-05" },
    ];
    for (const s of schedule) {
      await ctx.db.insert("weeklySchedule", {
        ...s,
        status: "Scheduled",
        bufferViolation: false,
        bufferOverrideAcknowledged: false,
      });
    }

    // ── Availability ──────────────────────────────────────────────────────
    const availability = [
      // Jason V. — Mon/Wed/Fri mornings
      { instructorId: "INS-01", instructorName: "Jason V.", dayOfWeek: "Mon", startTime: "06:00", endTime: "14:00", available: true },
      { instructorId: "INS-01", instructorName: "Jason V.", dayOfWeek: "Wed", startTime: "06:00", endTime: "14:00", available: true },
      { instructorId: "INS-01", instructorName: "Jason V.", dayOfWeek: "Fri", startTime: "06:00", endTime: "14:00", available: true },
      { instructorId: "INS-01", instructorName: "Jason V.", dayOfWeek: "Tue", startTime: "07:00", endTime: "09:00", available: true },
      { instructorId: "INS-01", instructorName: "Jason V.", dayOfWeek: "Thu", startTime: "07:00", endTime: "09:00", available: true },
      // Maya R. — Mon/Wed/Fri evenings
      { instructorId: "INS-02", instructorName: "Maya R.",  dayOfWeek: "Mon", startTime: "17:00", endTime: "21:00", available: true },
      { instructorId: "INS-02", instructorName: "Maya R.",  dayOfWeek: "Wed", startTime: "17:00", endTime: "21:00", available: true },
      { instructorId: "INS-02", instructorName: "Maya R.",  dayOfWeek: "Fri", startTime: "17:00", endTime: "20:00", available: true },
      // Diego F. — Tue/Thu evenings + Sat/Sun
      { instructorId: "INS-03", instructorName: "Diego F.", dayOfWeek: "Tue", startTime: "17:00", endTime: "21:00", available: true },
      { instructorId: "INS-03", instructorName: "Diego F.", dayOfWeek: "Thu", startTime: "17:00", endTime: "21:00", available: true },
      { instructorId: "INS-03", instructorName: "Diego F.", dayOfWeek: "Sat", startTime: "09:00", endTime: "13:00", available: true },
      { instructorId: "INS-03", instructorName: "Diego F.", dayOfWeek: "Sun", startTime: "09:00", endTime: "13:00", available: true },
      // Priya K. — Mon–Thu mornings
      { instructorId: "INS-04", instructorName: "Priya K.", dayOfWeek: "Mon", startTime: "06:00", endTime: "10:00", available: true },
      { instructorId: "INS-04", instructorName: "Priya K.", dayOfWeek: "Tue", startTime: "06:00", endTime: "10:00", available: true },
      { instructorId: "INS-04", instructorName: "Priya K.", dayOfWeek: "Wed", startTime: "06:00", endTime: "10:00", available: true },
      { instructorId: "INS-04", instructorName: "Priya K.", dayOfWeek: "Thu", startTime: "06:00", endTime: "10:00", available: true },
      // Marcus T. — Wed–Sat (varies)
      { instructorId: "INS-05", instructorName: "Marcus T.",dayOfWeek: "Sat", startTime: "09:00", endTime: "14:00", available: true },
      { instructorId: "INS-05", instructorName: "Marcus T.",dayOfWeek: "Sun", startTime: "09:00", endTime: "13:00", available: true },
    ];
    for (const a of availability) await ctx.db.insert("availability", { ...a, notes: undefined });

    // ── Class Programs (Lesson Plans) ─────────────────────────────────────
    const classPrograms = [
      {
        classId: "CLS-04", className: "Boxing Basics",
        instructorId: "INS-01", instructorName: "Jason V.",
        weekOf: "2026-03-30", status: "Approved", submittedAt: "2026-03-28T10:00:00Z", approvedAt: "2026-03-29T09:00:00Z", approvedBy: "Arden",
        blocks: [
          { blockType: "Warm-Up",   durationMinutes: 10, description: "Dynamic warm-up",        equipment: [],              instructions: "High knees, arm circles, hip rotations x2 rounds", exerciseName: undefined },
          { blockType: "Technique", durationMinutes: 15, description: "Jab-Cross fundamentals", equipment: ["Boxing Gloves"],instructions: "Mirror work then partner shadow drill — 3×3 min rounds", exerciseName: "Shadow Boxing" },
          { blockType: "Main",      durationMinutes: 25, description: "Heavy bag combinations", equipment: ["Heavy Bag","Boxing Gloves"], instructions: "4×3 min rounds: Jab-Cross-Hook, finish with body shots", exerciseName: "Heavy Bag Rounds" },
          { blockType: "Cool-Down", durationMinutes: 10, description: "Stretch & breathwork",   equipment: [],              instructions: "Shoulder rolls, lats, hip flexors — hold 30s each", exerciseName: undefined },
        ],
      },
      {
        classId: "CLS-01", className: "Power Hour",
        instructorId: "INS-02", instructorName: "Maya R.",
        weekOf: "2026-03-30", status: "Approved", submittedAt: "2026-03-28T14:00:00Z", approvedAt: "2026-03-29T11:00:00Z", approvedBy: "Arden",
        blocks: [
          { blockType: "Warm-Up",   durationMinutes: 10, description: "Activation series",      equipment: [],                instructions: "Band walks, glute bridges, thoracic rotation x2 sets", exerciseName: undefined },
          { blockType: "Strength",  durationMinutes: 20, description: "Deadlift progression",   equipment: ["Barbell + Plates"], instructions: "4×5 @ 70–80% 1RM. Focus: hip hinge, neutral spine", exerciseName: "Barbell Deadlift" },
          { blockType: "Accessory", durationMinutes: 20, description: "Pull & shoulder work",   equipment: ["Pull-Up Bar","Dumbbells (set)"], instructions: "3×8 pull-ups + 3×12 DB shoulder press", exerciseName: "Dumbbell Shoulder Press" },
          { blockType: "Core",      durationMinutes: 5,  description: "Core finisher",          equipment: ["Yoga Mat"],       instructions: "Plank 3×45s, dead bug 3×10", exerciseName: "Plank Hold" },
          { blockType: "Cool-Down", durationMinutes: 5,  description: "Stretch",                equipment: [],                instructions: "Hip flexor, lat, hamstring stretches", exerciseName: undefined },
        ],
      },
      {
        classId: "CLS-06", className: "Hybrid Crusher",
        instructorId: "INS-04", instructorName: "Priya K.",
        weekOf: "2026-03-30", status: "Submitted", submittedAt: "2026-04-02T20:00:00Z",
        blocks: [
          { blockType: "Warm-Up",   durationMinutes: 8,  description: "Cardio activation",      equipment: ["Jump Rope"],      instructions: "5 min jump rope + 3 min dynamic stretch", exerciseName: "Jump Rope" },
          { blockType: "Boxing",    durationMinutes: 28, description: "Bag work circuit",        equipment: ["Heavy Bag","Boxing Gloves"], instructions: "6×3 min rounds on bag — varying combos each round", exerciseName: "Heavy Bag Rounds" },
          { blockType: "Circuit",   durationMinutes: 20, description: "Conditioning circuit",   equipment: ["Kettlebells (set)","Yoga Mat"], instructions: "4 rounds: 15 KB swings, 12 burpees, 20 mountain climbers", exerciseName: "KB Swings" },
          { blockType: "Cool-Down", durationMinutes: 4,  description: "Cooldown",               equipment: [],                instructions: "Full body stretch, 2 min breathwork", exerciseName: undefined },
        ],
      },
      {
        classId: "CLS-05", className: "Fight Night Prep",
        instructorId: "INS-03", instructorName: "Diego F.",
        weekOf: "2026-03-30", status: "Draft",
        blocks: [
          { blockType: "Warm-Up",   durationMinutes: 10, description: "Footwork drills",        equipment: [],                instructions: "Ladder + cone drills, shadow boxing", exerciseName: "Shadow Boxing" },
          { blockType: "Main",      durationMinutes: 35, description: "Combination sequences",  equipment: ["Boxing Gloves","Heavy Bag"], instructions: "Advanced combos: 1-2-3-2, slips, counters — TBD", exerciseName: "Counter-Attack Combo" },
          { blockType: "Cool-Down", durationMinutes: 15, description: "Recovery",               equipment: [],                instructions: "Ice bath optional, static stretching", exerciseName: undefined },
        ],
      },
    ];
    for (const p of classPrograms) await ctx.db.insert("classPrograms", {
      ...p,
      approvedAt: (p as { approvedAt?: string }).approvedAt,
      approvedBy: (p as { approvedBy?: string }).approvedBy,
      notes: undefined,
    });

    // ── Delivery Log ─────────────────────────────────────────────────────
    const deliveryLogs = [
      { date: "2026-03-30", classId: "CLS-04", className: "Boxing Basics",          categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  wasPlanned: true,  actualAttendance: 18, maxCapacity: 20, programFollowed: true,  variationsMade: undefined, notes: "Great energy in class today. Jab-cross technique improving week over week." },
      { date: "2026-03-30", classId: "CLS-07", className: "Pilates Box",             categoryName: "Pilates",                 instructorId: "INS-04", instructorName: "Priya K.",  wasPlanned: true,  actualAttendance: 20, maxCapacity: 22, programFollowed: true,  variationsMade: undefined, notes: undefined },
      { date: "2026-03-30", classId: "CLS-06", className: "Hybrid Crusher",          categoryName: "Hybrid",                  instructorId: "INS-04", instructorName: "Priya K.",  wasPlanned: true,  actualAttendance: 19, maxCapacity: 20, programFollowed: true,  variationsMade: "Subbed medicine ball slams for KB swings due to availability", notes: undefined },
      { date: "2026-03-30", classId: "CLS-04", className: "Lunch Box",               categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  wasPlanned: true,  actualAttendance: 14, maxCapacity: 18, programFollowed: true,  variationsMade: undefined, notes: undefined },
      { date: "2026-03-30", classId: "CLS-01", className: "Power Hour",              categoryName: "Strength & Conditioning", instructorId: "INS-02", instructorName: "Maya R.",   wasPlanned: true,  actualAttendance: 15, maxCapacity: 16, programFollowed: true,  variationsMade: undefined, notes: "Full class! Moved to 75% max on deadlifts for newer members." },
      { date: "2026-03-30", classId: "CLS-06", className: "Yoga & Box",              categoryName: "Hybrid",                  instructorId: "INS-02", instructorName: "Maya R.",   wasPlanned: false, actualAttendance: 12, maxCapacity: 20, programFollowed: false, variationsMade: "No program submitted — improvised session", notes: "Reminder sent to instructor." },
      { date: "2026-03-31", classId: "CLS-08", className: "Yoga Circuit",            categoryName: "Yoga",                    instructorId: "INS-04", instructorName: "Priya K.",  wasPlanned: true,  actualAttendance: 16, maxCapacity: 18, programFollowed: true,  variationsMade: undefined, notes: undefined },
      { date: "2026-03-31", classId: "CLS-01", className: "Strength & Conditioning", categoryName: "Strength & Conditioning", instructorId: "INS-01", instructorName: "Jason V.",  wasPlanned: true,  actualAttendance: 14, maxCapacity: 16, programFollowed: true,  variationsMade: undefined, notes: undefined },
      { date: "2026-04-01", classId: "CLS-04", className: "Boxing Basics",           categoryName: "Boxing",                  instructorId: "INS-01", instructorName: "Jason V.",  wasPlanned: true,  actualAttendance: 20, maxCapacity: 20, programFollowed: true,  variationsMade: undefined, notes: "Full house — best attendance this week!" },
      { date: "2026-04-01", classId: "CLS-07", className: "Pilates Box",             categoryName: "Pilates",                 instructorId: "INS-04", instructorName: "Priya K.",  wasPlanned: true,  actualAttendance: 18, maxCapacity: 22, programFollowed: true,  variationsMade: undefined, notes: undefined },
      { date: "2026-04-02", classId: "CLS-08", className: "Yoga Circuit",            categoryName: "Yoga",                    instructorId: "INS-04", instructorName: "Priya K.",  wasPlanned: true,  actualAttendance: 15, maxCapacity: 18, programFollowed: true,  variationsMade: undefined, notes: undefined },
      { date: "2026-04-02", classId: "CLS-05", className: "Fight Night Prep",        categoryName: "Boxing",                  instructorId: "INS-03", instructorName: "Diego F.",  wasPlanned: false, actualAttendance: 13, maxCapacity: 15, programFollowed: false, variationsMade: "Draft plan referenced, not finalised", notes: "Diego to submit plan by Fri." },
    ];
    for (const d of deliveryLogs) await ctx.db.insert("deliveryLog", {
      ...d,
      variationsMade: d.variationsMade,
      notes: d.notes,
    });

    // ── Client Journeys ──────────────────────────────────────────────────
    const clientJourneys = [
      {
        journeyId: "JRN-01", title: "New to Boxing — 6-Week Starter", goalType: "Skill Building", pathwayId: "PTH-01", active: true,
        weeks: [
          { weekNumber: 1, classId: "CLS-04", className: "Boxing Basics",    focus: "Stance & Guard",         notes: "Watch jab form closely" },
          { weekNumber: 2, classId: "CLS-04", className: "Boxing Basics",    focus: "Jab-Cross Combos",       notes: undefined },
          { weekNumber: 3, classId: "CLS-06", className: "Hybrid Crusher",   focus: "Cardio + Bag Work",      notes: "First bag session" },
          { weekNumber: 4, classId: "CLS-04", className: "Boxing Basics",    focus: "Hook & Body Shot",       notes: undefined },
          { weekNumber: 5, classId: "CLS-05", className: "Power Boxing",     focus: "Power Combos Intro",     notes: "Assess readiness for advanced" },
          { weekNumber: 6, classId: "CLS-05", className: "Power Boxing",     focus: "Review & Graduation",    notes: "Recommend Advanced pathway" },
        ],
      },
      {
        journeyId: "JRN-02", title: "8-Week Strength Builder", goalType: "Strength & Muscle", pathwayId: "PTH-02", active: true,
        weeks: [
          { weekNumber: 1, classId: "CLS-01", className: "Upper Body Lift",  focus: "Establish Baselines",    notes: "Test max reps at 60%" },
          { weekNumber: 2, classId: "CLS-02", className: "Lower Body Burn",  focus: "Hinge & Squat Patterns", notes: undefined },
          { weekNumber: 3, classId: "CLS-01", className: "Upper Body Lift",  focus: "Progressive Overload",   notes: "+5% load week over week" },
          { weekNumber: 4, classId: "CLS-03", className: "Butts & Guts",     focus: "Active Recovery Week",   notes: "De-load week — lighter weights" },
          { weekNumber: 5, classId: "CLS-01", className: "Upper Body Lift",  focus: "Max Strength Phase",     notes: undefined },
          { weekNumber: 6, classId: "CLS-02", className: "Lower Body Burn",  focus: "Max Strength Phase",     notes: undefined },
          { weekNumber: 7, classId: "CLS-03", className: "Butts & Guts",     focus: "Hypertrophy Phase",      notes: undefined },
          { weekNumber: 8, classId: "CLS-01", className: "Upper Body Lift",  focus: "Final Test & Retest",    notes: "Compare to Week 1 baselines" },
        ],
      },
      {
        journeyId: "JRN-03", title: "Mobility & Recovery Path", goalType: "Flexibility & Recovery", pathwayId: "PTH-04", active: true,
        weeks: [
          { weekNumber: 1, classId: "CLS-08", className: "Yoga Flow",        focus: "Spinal Mobility",        notes: undefined },
          { weekNumber: 2, classId: "CLS-07", className: "Core Pilates",     focus: "Core Activation",        notes: undefined },
          { weekNumber: 3, classId: "CLS-08", className: "Yoga Flow",        focus: "Hip Flexibility",        notes: undefined },
          { weekNumber: 4, classId: "CLS-07", className: "Core Pilates",     focus: "Full Integration",       notes: "Reassess range of motion" },
        ],
      },
    ];
    for (const j of clientJourneys) await ctx.db.insert("clientJourneys", {
      ...j,
      weeks: j.weeks.map(w => ({ ...w, notes: w.notes ?? undefined })),
    });

    // ── Users (only seed if table is empty — preserve signups) ──
    const existingUsers = await ctx.db.query("users").collect();
    let usersSeededCount = 0;
    if (existingUsers.length === 0) {
      const seedUsers = [
        { email: "arden@fiitco.ca", password: btoa("fiitco2024"), fullName: "Arden Hamilton", displayName: "Arden (Admin)", role: "admin", status: "active", securityQuestion: "What city were you born in?", securityAnswer: "toronto", createdAt: "2024-01-01T00:00:00.000Z" },
        { email: "jason@fiitco.ca", password: btoa("fiitco2024"), fullName: "Jason Villanueva", displayName: "Jason V.", role: "instructor", instructorId: "INS-01", status: "active", securityQuestion: "What is your favourite fitness exercise?", securityAnswer: "boxing", createdAt: "2024-01-15T00:00:00.000Z" },
        { email: "maya@fiitco.ca", password: btoa("fiitco2024"), fullName: "Maya Rodriguez", displayName: "Maya R.", role: "instructor", instructorId: "INS-02", status: "active", securityQuestion: "What is your pet's name?", securityAnswer: "luna", createdAt: "2024-03-01T00:00:00.000Z" },
        { email: "diego@fiitco.ca", password: btoa("fiitco2024"), fullName: "Diego Fernandez", displayName: "Diego F.", role: "instructor", instructorId: "INS-03", status: "active", securityQuestion: "What city were you born in?", securityAnswer: "bogota", createdAt: "2024-06-01T00:00:00.000Z" },
        { email: "priya@fiitco.ca", password: btoa("fiitco2024"), fullName: "Priya Kapoor", displayName: "Priya K.", role: "instructor", instructorId: "INS-04", status: "active", securityQuestion: "What was your first school?", securityAnswer: "maple leaf", createdAt: "2024-08-01T00:00:00.000Z" },
        { email: "marcus@fiitco.ca", password: btoa("fiitco2024"), fullName: "Marcus Thompson", displayName: "Marcus T.", role: "instructor", instructorId: "INS-05", status: "active", securityQuestion: "What is your favourite fitness exercise?", securityAnswer: "yoga", createdAt: "2024-10-01T00:00:00.000Z" },
      ];
      for (const u of seedUsers) await ctx.db.insert("users", u);
      usersSeededCount = seedUsers.length;
    }

    return {
      message: "Force reseed complete",
      counts: {
        categories: categories.length,
        subcategories: subcategories.length,
        tiers: tiers.length,
        instructors: instructors.length,
        classes: classes.length,
        equipment: equipment.length,
        pathways: pathways.length,
        exercises: exercises.length,
        schedule: schedule.length,
        availability: availability.length,
        classPrograms: classPrograms.length,
        deliveryLogs: deliveryLogs.length,
        clientJourneys: clientJourneys.length,
        users: usersSeededCount,
      },
    };
  },
});

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

// ── Pending Changes / Approval Workflow ──────────────────────────────────────

export const submitPendingChange = mutation({
  args: {
    tableName: v.string(),
    action: v.string(),
    entityId: v.optional(v.string()),
    payload: v.any(),
    submittedBy: v.string(),
    submittedByName: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("pendingChanges", {
      ...args,
      submittedAt: new Date().toISOString(),
      status: "pending",
    });
  },
});

export const approvePendingChange = mutation({
  args: { id: v.id("pendingChanges"), reviewedBy: v.string() },
  handler: async (ctx, args) => {
    const change = await ctx.db.get(args.id);
    if (!change || change.status !== "pending") throw new Error("Change not found or already reviewed");

    const { tableName, action, entityId, payload } = change;
    const db = ctx.db as any;

    // ── Category changes: cascade name updates across all dependent tables ──
    if (tableName === "categories" && action === "update" && entityId) {
      const oldCat = await db.get(entityId);
      await db.patch(entityId, payload);

      if (oldCat && payload.name && oldCat.name !== payload.name) {
        const oldName = oldCat.name as string;
        const newName = payload.name as string;
        const oldCatId = oldCat.categoryId as string;

        // Classes (indexed by categoryId)
        const classes = await ctx.db.query("classes")
          .withIndex("by_categoryId", (q: any) => q.eq("categoryId", oldCatId))
          .collect();
        for (const c of classes) await ctx.db.patch(c._id, { categoryName: newName });

        // Subcategories (indexed by categoryId)
        const subs = await ctx.db.query("subcategories")
          .withIndex("by_categoryId", (q: any) => q.eq("categoryId", oldCatId))
          .collect();
        for (const s of subs) await ctx.db.patch(s._id, { categoryName: newName });

        // Weekly schedule (scan — no category index)
        const slots = await ctx.db.query("weeklySchedule").collect();
        for (const s of slots) {
          if (s.categoryName === oldName) await ctx.db.patch(s._id, { categoryName: newName });
        }

        // Delivery logs
        const logs = await ctx.db.query("deliveryLog").collect();
        for (const l of logs) {
          if (l.categoryName === oldName) await ctx.db.patch(l._id, { categoryName: newName });
        }

        // Exercises (store category as a name string)
        const exercises = await ctx.db.query("exercises").collect();
        for (const e of exercises) {
          if (e.category === oldName) await ctx.db.patch(e._id, { category: newName });
        }

        // Pathways (store category as a name string)
        const pathways = await ctx.db.query("pathways").collect();
        for (const p of pathways) {
          if (p.category === oldName) await ctx.db.patch(p._id, { category: newName });
        }
      }
    } else if (action === "add") {
      await db.insert(tableName, payload);
    } else if (action === "update" && entityId) {
      await db.patch(entityId, payload);
    } else if (action === "delete" && entityId) {
      await db.delete(entityId);
    }

    await ctx.db.patch(args.id, {
      status: "approved",
      reviewedBy: args.reviewedBy,
      reviewedAt: new Date().toISOString(),
    });
  },
});

export const denyPendingChange = mutation({
  args: { id: v.id("pendingChanges"), reviewedBy: v.string(), reviewNote: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const change = await ctx.db.get(args.id);
    if (!change || change.status !== "pending") throw new Error("Change not found or already reviewed");

    await ctx.db.patch(args.id, {
      status: "denied",
      reviewedBy: args.reviewedBy,
      reviewedAt: new Date().toISOString(),
      reviewNote: args.reviewNote,
    });
  },
});

// ── Client Journeys ────────────────────────────────────────────────────────
export const addClientJourney = mutation({
  args: {
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
  },
  handler: async (ctx, args) => ctx.db.insert("clientJourneys", { ...args, active: true }),
});

export const updateClientJourney = mutation({
  args: {
    id: v.id("clientJourneys"),
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
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    return ctx.db.patch(id, fields);
  },
});

export const deleteClientJourney = mutation({
  args: { id: v.id("clientJourneys") },
  handler: async (ctx, args) => ctx.db.delete(args.id),
});
