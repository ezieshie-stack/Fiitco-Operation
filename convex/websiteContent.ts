/**
 * Website content — queries + mutations for the CMS tables that drive the
 * customer-facing fiit-website.
 *
 * Pattern for each module:
 *   - list*          → admin view, returns everything including inactive
 *   - listActive*    → website view, returns only active, sorted
 *   - get*           → single record by _id
 *   - create*        → insert + set updatedAt + default active: true
 *   - update*        → patch + bump updatedAt
 *   - delete*        → soft delete (sets active: false) — preserves record
 *   - hardDelete*    → permanent removal (escape hatch, destructive)
 *   - reorder*       → bulk-update displayOrder for drag-sort
 *
 * File uploads follow Convex's standard flow:
 *   1. client calls generateUploadUrl() → returns signed POST URL
 *   2. client POSTs the file to that URL → gets back a storageId
 *   3. client passes storageId into the create/update mutation
 *   4. server resolves storageId → permanent URL and stores it
 */

import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { adminMutation, adminQuery } from "./authHelpers";

// ──────────────────────────────────────────────────────────────────────────
// DIAGNOSTIC — leftover from Session 1, delete after CMS ships
// ──────────────────────────────────────────────────────────────────────────

export const healthCheck = query({
  args: {},
  handler: async (ctx) => {
    const [
      trainers, collaborators, classFormats, pricingPlans, blogPosts,
      locations, testimonials, faqEntries, promoVideos,
      weeklySchedule, referrals, guestPasses, instructors,
    ] = await Promise.all([
      ctx.db.query("trainers").collect(),
      ctx.db.query("collaborators").collect(),
      ctx.db.query("classFormats").collect(),
      ctx.db.query("pricingPlans").collect(),
      ctx.db.query("blogPosts").collect(),
      ctx.db.query("locations").collect(),
      ctx.db.query("testimonials").collect(),
      ctx.db.query("faqEntries").collect(),
      ctx.db.query("promoVideos").collect(),
      ctx.db.query("weeklySchedule").collect(),
      ctx.db.query("referrals").collect(),
      ctx.db.query("guestPasses").collect(),
      ctx.db.query("instructors").collect(),
    ]);
    return {
      newCmsTables: {
        trainers: trainers.length, collaborators: collaborators.length,
        classFormats: classFormats.length, pricingPlans: pricingPlans.length,
        blogPosts: blogPosts.length, locations: locations.length,
        testimonials: testimonials.length, faqEntries: faqEntries.length,
        promoVideos: promoVideos.length,
      },
      existingTables: {
        weeklySchedule: weeklySchedule.length, referrals: referrals.length,
        guestPasses: guestPasses.length, instructors: instructors.length,
      },
    };
  },
});

// ──────────────────────────────────────────────────────────────────────────
// SHARED FILE UPLOAD — used by every module that has a photo/image field
// ──────────────────────────────────────────────────────────────────────────

/**
 * Returns a signed upload URL. Admin UI POSTs a file to this URL, gets back
 * a storageId, then calls the relevant create/update mutation with that id.
 * One function serves all content types — no need for per-table uploaders.
 */
export const generateUploadUrl = adminMutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// ──────────────────────────────────────────────────────────────────────────
// TRAINERS — /website-trainers admin page in ops, drives team showcase
//            on homepage + detailed bios on /about
// ──────────────────────────────────────────────────────────────────────────

/** Admin list: everything, including inactive. Sorted by displayOrder. */
export const listTrainers = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("trainers").collect();
    return [...all].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

/** Website list: active only, sorted. This is what the public site calls. */
export const listActiveTrainers = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("trainers")
      .withIndex("by_active_displayOrder", (q) => q.eq("active", true))
      .collect();
    return [...active].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const getTrainer = adminQuery({
  args: { id: v.id("trainers") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

/**
 * Create a new trainer. If photoStorageId is provided we resolve it to a
 * URL at write time and cache it on the record (simpler reads on the
 * website — no per-read storage lookup).
 */
export const createTrainer = adminMutation({
  args: {
    slug: v.string(),
    name: v.string(),
    role: v.string(),
    category: v.string(),                 // "fiit" | "academy"
    bio: v.string(),
    fullBio: v.array(v.string()),
    tags: v.array(v.string()),
    // Either/or: upload flow uses photoStorageId; seed scripts and URL-paste
    // flows use photoUrl directly. photoStorageId wins if both are set.
    photoStorageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const { photoStorageId, photoUrl: directUrl, ...rest } = args;
    const photoUrl = photoStorageId
      ? (await ctx.storage.getUrl(photoStorageId)) ?? undefined
      : directUrl;
    return await ctx.db.insert("trainers", {
      ...rest,
      photoUrl,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

/**
 * Partial update. Any field can be patched; omitted fields stay as-is.
 * Pass photoStorageId to replace the photo, or photoUrlCleared:true to
 * remove it without replacing.
 */
export const updateTrainer = adminMutation({
  args: {
    id: v.id("trainers"),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    role: v.optional(v.string()),
    category: v.optional(v.string()),
    bio: v.optional(v.string()),
    fullBio: v.optional(v.array(v.string())),
    tags: v.optional(v.array(v.string())),
    // Photo precedence: photoStorageId (new upload) > photoUrl (direct) >
    // photoUrlCleared (remove). Omitting all three leaves the photo as-is.
    photoStorageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    photoUrlCleared: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, photoStorageId, photoUrl: directUrl, photoUrlCleared, ...rest } = args;
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined)
      ),
      updatedAt: new Date().toISOString(),
    };
    if (photoStorageId) {
      patch.photoUrl =
        (await ctx.storage.getUrl(photoStorageId)) ?? undefined;
    } else if (directUrl !== undefined) {
      patch.photoUrl = directUrl;
    } else if (photoUrlCleared) {
      patch.photoUrl = undefined;
    }
    await ctx.db.patch(id, patch);
    return id;
  },
});

/** Soft delete — keeps the record but hides from public site. Reversible. */
export const deleteTrainer = adminMutation({
  args: { id: v.id("trainers") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

/** Permanently remove. Only for obvious test/duplicate entries. */
export const hardDeleteTrainer = adminMutation({
  args: { id: v.id("trainers") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

/**
 * Bulk reorder. Admin passes an ordered array of ids; we update each
 * record's displayOrder in that sequence.
 */
export const reorderTrainers = adminMutation({
  args: { orderedIds: v.array(v.id("trainers")) },
  handler: async (ctx, { orderedIds }) => {
    const now = new Date().toISOString();
    await Promise.all(
      orderedIds.map((id, i) =>
        ctx.db.patch(id, { displayOrder: i, updatedAt: now })
      )
    );
  },
});

// ──────────────────────────────────────────────────────────────────────────
// COLLABORATORS — /website-community admin, powers the /community page
//                 on the customer site (local business cards)
// ──────────────────────────────────────────────────────────────────────────

export const listCollaborators = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("collaborators").collect();
    return [...all].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const listActiveCollaborators = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("collaborators")
      .withIndex("by_active_displayOrder", (q) => q.eq("active", true))
      .collect();
    return [...active].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const createCollaborator = adminMutation({
  args: {
    slug: v.string(),
    name: v.string(),
    category: v.string(),
    description: v.string(),
    href: v.optional(v.string()),
    location: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    confirmed: v.boolean(),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const { photoStorageId, photoUrl: directUrl, ...rest } = args;
    const photoUrl = photoStorageId
      ? (await ctx.storage.getUrl(photoStorageId)) ?? undefined
      : directUrl;
    return await ctx.db.insert("collaborators", {
      ...rest,
      photoUrl,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateCollaborator = adminMutation({
  args: {
    id: v.id("collaborators"),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    href: v.optional(v.string()),
    location: v.optional(v.string()),
    photoStorageId: v.optional(v.id("_storage")),
    photoUrl: v.optional(v.string()),
    photoUrlCleared: v.optional(v.boolean()),
    confirmed: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, photoStorageId, photoUrl: directUrl, photoUrlCleared, ...rest } = args;
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined)
      ),
      updatedAt: new Date().toISOString(),
    };
    if (photoStorageId) {
      patch.photoUrl = (await ctx.storage.getUrl(photoStorageId)) ?? undefined;
    } else if (directUrl !== undefined) {
      patch.photoUrl = directUrl;
    } else if (photoUrlCleared) {
      patch.photoUrl = undefined;
    }
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deleteCollaborator = adminMutation({
  args: { id: v.id("collaborators") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

export const hardDeleteCollaborator = adminMutation({
  args: { id: v.id("collaborators") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

export const reorderCollaborators = adminMutation({
  args: { orderedIds: v.array(v.id("collaborators")) },
  handler: async (ctx, { orderedIds }) => {
    const now = new Date().toISOString();
    await Promise.all(
      orderedIds.map((id, i) =>
        ctx.db.patch(id, { displayOrder: i, updatedAt: now })
      )
    );
  },
});

// ──────────────────────────────────────────────────────────────────────────
// LOCATIONS — /website-locations admin, powers the footer (address/hours/
//             phone/email) + studio page location block on the customer site
// ──────────────────────────────────────────────────────────────────────────

export const listLocations = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("locations").collect();
    return [...all].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const listActiveLocations = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("locations")
      .withIndex("by_active_displayOrder", (q) => q.eq("active", true))
      .collect();
    return [...active].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

/**
 * Returns the single "primary" location — used by the footer + studio page
 * when the website needs one canonical address/hours (which is today, with
 * a single Leslieville studio). When a second location opens, the website
 * components can switch to listActiveLocations instead.
 */
export const getPrimaryLocation = query({
  args: {},
  handler: async (ctx) => {
    const primary = await ctx.db
      .query("locations")
      .withIndex("by_isPrimary", (q) => q.eq("isPrimary", true))
      .first();
    if (primary && primary.active) return primary;
    // Fallback: any active location, ordered
    const fallback = await ctx.db
      .query("locations")
      .withIndex("by_active_displayOrder", (q) => q.eq("active", true))
      .first();
    return fallback ?? null;
  },
});

export const createLocation = adminMutation({
  args: {
    slug: v.string(),
    name: v.string(),
    address1: v.string(),
    address2: v.optional(v.string()),
    city: v.string(),
    region: v.string(),
    postalCode: v.string(),
    country: v.string(),
    phone: v.string(),
    email: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    hoursMonFri: v.string(),
    hoursSatSun: v.string(),
    isPrimary: v.boolean(),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    // If isPrimary is true, un-primary all existing locations first —
    // only one primary at a time.
    if (args.isPrimary) {
      const existing = await ctx.db
        .query("locations")
        .withIndex("by_isPrimary", (q) => q.eq("isPrimary", true))
        .collect();
      await Promise.all(
        existing.map((loc) => ctx.db.patch(loc._id, { isPrimary: false }))
      );
    }
    return await ctx.db.insert("locations", {
      ...args,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateLocation = adminMutation({
  args: {
    id: v.id("locations"),
    slug: v.optional(v.string()),
    name: v.optional(v.string()),
    address1: v.optional(v.string()),
    address2: v.optional(v.string()),
    city: v.optional(v.string()),
    region: v.optional(v.string()),
    postalCode: v.optional(v.string()),
    country: v.optional(v.string()),
    phone: v.optional(v.string()),
    email: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    hoursMonFri: v.optional(v.string()),
    hoursSatSun: v.optional(v.string()),
    isPrimary: v.optional(v.boolean()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    // If this location is being set as primary, un-primary all others.
    if (rest.isPrimary === true) {
      const existing = await ctx.db
        .query("locations")
        .withIndex("by_isPrimary", (q) => q.eq("isPrimary", true))
        .collect();
      await Promise.all(
        existing
          .filter((loc) => loc._id !== id)
          .map((loc) => ctx.db.patch(loc._id, { isPrimary: false }))
      );
    }
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined)
      ),
      updatedAt: new Date().toISOString(),
    };
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deleteLocation = adminMutation({
  args: { id: v.id("locations") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

export const hardDeleteLocation = adminMutation({
  args: { id: v.id("locations") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

// ──────────────────────────────────────────────────────────────────────────
// TESTIMONIALS — /website-testimonials admin, powers the "Members Talk"
//                section on the homepage
// ──────────────────────────────────────────────────────────────────────────

export const listTestimonials = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("testimonials").collect();
    return [...all].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const listActiveTestimonials = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("testimonials")
      .withIndex("by_active_displayOrder", (q) => q.eq("active", true))
      .collect();
    return [...active].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const createTestimonial = adminMutation({
  args: {
    firstName: v.string(),
    lastInitial: v.string(),
    role: v.optional(v.string()),
    rating: v.number(),
    text: v.string(),
    source: v.optional(v.string()),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("testimonials", {
      ...args,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateTestimonial = adminMutation({
  args: {
    id: v.id("testimonials"),
    firstName: v.optional(v.string()),
    lastInitial: v.optional(v.string()),
    role: v.optional(v.string()),
    rating: v.optional(v.number()),
    text: v.optional(v.string()),
    source: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined)
      ),
      updatedAt: new Date().toISOString(),
    };
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deleteTestimonial = adminMutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

export const hardDeleteTestimonial = adminMutation({
  args: { id: v.id("testimonials") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

export const reorderTestimonials = adminMutation({
  args: { orderedIds: v.array(v.id("testimonials")) },
  handler: async (ctx, { orderedIds }) => {
    const now = new Date().toISOString();
    await Promise.all(
      orderedIds.map((id, i) =>
        ctx.db.patch(id, { displayOrder: i, updatedAt: now })
      )
    );
  },
});

// ──────────────────────────────────────────────────────────────────────────
// FAQ — /website-faq admin, powers the "You've Got Questions" section
//       on the homepage
// ──────────────────────────────────────────────────────────────────────────

export const listFaqEntries = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("faqEntries").collect();
    return [...all].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const listActiveFaqEntries = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("faqEntries")
      .withIndex("by_active_displayOrder", (q) => q.eq("active", true))
      .collect();
    return [...active].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const createFaqEntry = adminMutation({
  args: {
    question: v.string(),
    answer: v.string(),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("faqEntries", {
      ...args,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateFaqEntry = adminMutation({
  args: {
    id: v.id("faqEntries"),
    question: v.optional(v.string()),
    answer: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(
        Object.entries(rest).filter(([, v]) => v !== undefined)
      ),
      updatedAt: new Date().toISOString(),
    };
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deleteFaqEntry = adminMutation({
  args: { id: v.id("faqEntries") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, {
      active: false,
      updatedAt: new Date().toISOString(),
    });
    return id;
  },
});

export const hardDeleteFaqEntry = adminMutation({
  args: { id: v.id("faqEntries") },
  handler: async (ctx, { id }) => {
    await ctx.db.delete(id);
    return id;
  },
});

export const reorderFaqEntries = adminMutation({
  args: { orderedIds: v.array(v.id("faqEntries")) },
  handler: async (ctx, { orderedIds }) => {
    const now = new Date().toISOString();
    await Promise.all(
      orderedIds.map((id, i) =>
        ctx.db.patch(id, { displayOrder: i, updatedAt: now })
      )
    );
  },
});

// ──────────────────────────────────────────────────────────────────────────
// CLASS FORMATS — /website-class-formats admin, powers the card grid at
//                 the top of /programs (12 class cards split FIIT vs Academy)
// ──────────────────────────────────────────────────────────────────────────

export const listClassFormats = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("classFormats").collect();
    return [...all].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const listActiveClassFormats = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("classFormats")
      .withIndex("by_active_displayOrder", (q) => q.eq("active", true))
      .collect();
    return [...active].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const createClassFormat = adminMutation({
  args: {
    slug: v.string(),
    num: v.string(),
    tag: v.string(),
    title: v.string(),
    category: v.string(),                 // "fiit" | "academy"
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    includes: v.array(v.string()),
    who: v.string(),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const { imageStorageId, imageUrl: directUrl, ...rest } = args;
    const imageUrl = imageStorageId
      ? (await ctx.storage.getUrl(imageStorageId)) ?? undefined
      : directUrl;
    return await ctx.db.insert("classFormats", {
      ...rest,
      imageUrl,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateClassFormat = adminMutation({
  args: {
    id: v.id("classFormats"),
    slug: v.optional(v.string()),
    num: v.optional(v.string()),
    tag: v.optional(v.string()),
    title: v.optional(v.string()),
    category: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    imageUrlCleared: v.optional(v.boolean()),
    includes: v.optional(v.array(v.string())),
    who: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, imageStorageId, imageUrl: directUrl, imageUrlCleared, ...rest } = args;
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
      updatedAt: new Date().toISOString(),
    };
    if (imageStorageId) {
      patch.imageUrl = (await ctx.storage.getUrl(imageStorageId)) ?? undefined;
    } else if (directUrl !== undefined) {
      patch.imageUrl = directUrl;
    } else if (imageUrlCleared) {
      patch.imageUrl = undefined;
    }
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deleteClassFormat = adminMutation({
  args: { id: v.id("classFormats") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { active: false, updatedAt: new Date().toISOString() });
    return id;
  },
});

export const hardDeleteClassFormat = adminMutation({
  args: { id: v.id("classFormats") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); return id; },
});

export const reorderClassFormats = adminMutation({
  args: { orderedIds: v.array(v.id("classFormats")) },
  handler: async (ctx, { orderedIds }) => {
    const now = new Date().toISOString();
    await Promise.all(
      orderedIds.map((id, i) =>
        ctx.db.patch(id, { displayOrder: i, updatedAt: now })
      )
    );
  },
});

// ──────────────────────────────────────────────────────────────────────────
// PRICING PLANS — /website-pricing admin, powers the A/A.2/A.3/B/C/D
//                 pricing sections on /programs
// ──────────────────────────────────────────────────────────────────────────

export const listPricingPlans = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("pricingPlans").collect();
    return [...all].sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.displayOrder - b.displayOrder;
    });
  },
});

export const listActivePricingPlans = query({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db
      .query("pricingPlans")
      .withIndex("by_active_displayOrder", (q) => q.eq("active", true))
      .collect();
    return [...active].sort((a, b) => {
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.displayOrder - b.displayOrder;
    });
  },
});

export const createPricingPlan = adminMutation({
  args: {
    slug: v.string(),
    section: v.string(),
    sectionLabel: v.string(),
    sectionTitle: v.string(),
    sectionDescription: v.optional(v.string()),
    price: v.string(),
    name: v.string(),
    note: v.optional(v.string()),
    features: v.array(v.string()),
    featured: v.boolean(),
    badge: v.optional(v.string()),
    style: v.string(),                // "pricing" | "pack"
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("pricingPlans", {
      ...args,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updatePricingPlan = adminMutation({
  args: {
    id: v.id("pricingPlans"),
    slug: v.optional(v.string()),
    section: v.optional(v.string()),
    sectionLabel: v.optional(v.string()),
    sectionTitle: v.optional(v.string()),
    sectionDescription: v.optional(v.string()),
    price: v.optional(v.string()),
    name: v.optional(v.string()),
    note: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    featured: v.optional(v.boolean()),
    badge: v.optional(v.string()),
    style: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
      updatedAt: new Date().toISOString(),
    };
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deletePricingPlan = adminMutation({
  args: { id: v.id("pricingPlans") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { active: false, updatedAt: new Date().toISOString() });
    return id;
  },
});

export const hardDeletePricingPlan = adminMutation({
  args: { id: v.id("pricingPlans") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); return id; },
});

export const reorderPricingPlans = adminMutation({
  args: { orderedIds: v.array(v.id("pricingPlans")) },
  handler: async (ctx, { orderedIds }) => {
    const now = new Date().toISOString();
    await Promise.all(
      orderedIds.map((id, i) =>
        ctx.db.patch(id, { displayOrder: i, updatedAt: now })
      )
    );
  },
});

// ──────────────────────────────────────────────────────────────────────────
// BLOG POSTS — /website-blog admin, powers /blog listing + /blog/[slug]
//              detail pages on the customer site
//
// `bodyJson` stores the TipTap editor's document as a JSON string. The
// website renders it via @tiptap/html → HTML. Storing JSON (not HTML)
// means no XSS risk from admin input — the editor's schema is the source
// of truth for what's renderable.
//
// `status`: "draft" → only visible in admin, NOT shown on website
//           "published" → visible to everyone, sorted by publishedAt desc
// ──────────────────────────────────────────────────────────────────────────

export const listBlogPosts = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("blogPosts").collect();
    // Most recent first by updatedAt, regardless of status
    return [...all].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  },
});

export const listPublishedBlogPosts = query({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db
      .query("blogPosts")
      .withIndex("by_status_publishedAt", (q) => q.eq("status", "published"))
      .collect();
    // Newest published first
    return [...all].sort((a, b) => {
      const aT = a.publishedAt ?? "";
      const bT = b.publishedAt ?? "";
      return bT.localeCompare(aT);
    });
  },
});

export const getBlogPost = adminQuery({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, { id }) => ctx.db.get(id),
});

export const getBlogPostBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, { slug }) => {
    const match = await ctx.db
      .query("blogPosts")
      .withIndex("by_slug", (q) => q.eq("slug", slug))
      .first();
    return match ?? null;
  },
});

export const createBlogPost = adminMutation({
  args: {
    slug: v.string(),
    title: v.string(),
    excerpt: v.string(),
    category: v.string(),
    author: v.string(),
    readTime: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    coverImageUrl: v.optional(v.string()),
    bodyJson: v.string(),
    status: v.string(),                 // "draft" | "published"
    featured: v.optional(v.boolean()),
    publishedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { coverImageStorageId, coverImageUrl: directUrl, ...rest } = args;
    const coverImageUrl = coverImageStorageId
      ? (await ctx.storage.getUrl(coverImageStorageId)) ?? undefined
      : directUrl;
    const now = new Date().toISOString();
    return await ctx.db.insert("blogPosts", {
      ...rest,
      coverImageUrl,
      featured: rest.featured ?? false,
      // Auto-set publishedAt when status is "published" and none provided
      publishedAt:
        rest.status === "published"
          ? (rest.publishedAt ?? now)
          : rest.publishedAt,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const updateBlogPost = adminMutation({
  args: {
    id: v.id("blogPosts"),
    slug: v.optional(v.string()),
    title: v.optional(v.string()),
    excerpt: v.optional(v.string()),
    category: v.optional(v.string()),
    author: v.optional(v.string()),
    readTime: v.optional(v.string()),
    coverImageStorageId: v.optional(v.id("_storage")),
    coverImageUrl: v.optional(v.string()),
    coverImageCleared: v.optional(v.boolean()),
    bodyJson: v.optional(v.string()),
    status: v.optional(v.string()),
    featured: v.optional(v.boolean()),
    publishedAt: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, coverImageStorageId, coverImageUrl: directUrl, coverImageCleared, ...rest } = args;
    const existing = await ctx.db.get(id);
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
      updatedAt: new Date().toISOString(),
    };
    if (coverImageStorageId) {
      patch.coverImageUrl = (await ctx.storage.getUrl(coverImageStorageId)) ?? undefined;
    } else if (directUrl !== undefined) {
      patch.coverImageUrl = directUrl;
    } else if (coverImageCleared) {
      patch.coverImageUrl = undefined;
    }
    // Auto-set publishedAt on the draft → published transition
    if (
      rest.status === "published" &&
      existing &&
      existing.status !== "published" &&
      !rest.publishedAt
    ) {
      patch.publishedAt = new Date().toISOString();
    }
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deleteBlogPost = adminMutation({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, { id }) => {
    // Soft delete via status — keeps URL slug reserved until hard-deleted
    await ctx.db.patch(id, { status: "draft", updatedAt: new Date().toISOString() });
    return id;
  },
});

export const hardDeleteBlogPost = adminMutation({
  args: { id: v.id("blogPosts") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); return id; },
});

// ──────────────────────────────────────────────────────────────────────────
// PROMO VIDEOS — /website-promo-videos admin, renders <PromoSlot/>
//                components across the customer website.
//
// Each record targets a specific `pageSlot` (e.g. "home:after-testimonials")
// where the fiit-website has placed a <PromoSlot name="..."/> component.
// Multiple records in the same slot stack vertically by displayOrder.
// ──────────────────────────────────────────────────────────────────────────

export const listPromoVideos = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("promoVideos").collect();
    return [...all].sort((a, b) => {
      if (a.pageSlot !== b.pageSlot) return a.pageSlot.localeCompare(b.pageSlot);
      return a.displayOrder - b.displayOrder;
    });
  },
});

/**
 * Returns all active promo videos for a single slot, in displayOrder.
 * This is what the fiit-website <PromoSlot/> component calls.
 */
export const listActivePromoVideosForSlot = query({
  args: { pageSlot: v.string() },
  handler: async (ctx, { pageSlot }) => {
    const rows = await ctx.db
      .query("promoVideos")
      .withIndex("by_pageSlot_active", (q) => q.eq("pageSlot", pageSlot).eq("active", true))
      .collect();
    return [...rows].sort((a, b) => a.displayOrder - b.displayOrder);
  },
});

export const createPromoVideo = adminMutation({
  args: {
    title: v.string(),
    youtubeId: v.string(),
    pageSlot: v.string(),
    headline: v.optional(v.string()),
    subheadline: v.optional(v.string()),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("promoVideos", {
      ...args,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updatePromoVideo = adminMutation({
  args: {
    id: v.id("promoVideos"),
    title: v.optional(v.string()),
    youtubeId: v.optional(v.string()),
    pageSlot: v.optional(v.string()),
    headline: v.optional(v.string()),
    subheadline: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, ...rest } = args;
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
      updatedAt: new Date().toISOString(),
    };
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deletePromoVideo = adminMutation({
  args: { id: v.id("promoVideos") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { active: false, updatedAt: new Date().toISOString() });
    return id;
  },
});

export const hardDeletePromoVideo = adminMutation({
  args: { id: v.id("promoVideos") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); return id; },
});

export const reorderPromoVideos = adminMutation({
  args: { orderedIds: v.array(v.id("promoVideos")) },
  handler: async (ctx, { orderedIds }) => {
    const now = new Date().toISOString();
    await Promise.all(
      orderedIds.map((id, i) =>
        ctx.db.patch(id, { displayOrder: i, updatedAt: now })
      )
    );
  },
});

// ──────────────────────────────────────────────────────────────────────────
// WEBSITE IMAGES — /website-images admin. Hero backgrounds, studio
//                  gallery, and other site-wide imagery not handled by
//                  other modules. Each record maps 1:1 to a <LiveImage
//                  slot="..."/> on the customer website.
// ──────────────────────────────────────────────────────────────────────────

export const listWebsiteImages = adminQuery({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("websiteImages").collect();
    return [...all].sort((a, b) => {
      if (a.group !== b.group) return a.group.localeCompare(b.group);
      if (a.page !== b.page) return a.page.localeCompare(b.page);
      return a.displayOrder - b.displayOrder;
    });
  },
});

/** Website-side lookup by slot. Returns null if no record exists. */
// PUBLIC: called by customer site <LiveImage> components anonymously, AND
// by the staff portal's website-images admin page (which auto-attaches a
// sessionToken via useAuthedQuery). sessionToken is declared optional and
// ignored so Convex's strict arg validator accepts calls from both surfaces.
export const getWebsiteImageBySlot = query({
  args: { slot: v.string(), sessionToken: v.optional(v.string()) },
  handler: async (ctx, { slot }) => {
    const match = await ctx.db
      .query("websiteImages")
      .withIndex("by_slot", (q) => q.eq("slot", slot))
      .first();
    return match ?? null;
  },
});

export const createWebsiteImage = adminMutation({
  args: {
    slot: v.string(),
    label: v.string(),
    group: v.string(),
    page: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    altText: v.string(),
    displayOrder: v.number(),
  },
  handler: async (ctx, args) => {
    const { imageStorageId, imageUrl: directUrl, ...rest } = args;
    const imageUrl = imageStorageId
      ? (await ctx.storage.getUrl(imageStorageId)) ?? undefined
      : directUrl;
    return await ctx.db.insert("websiteImages", {
      ...rest,
      imageUrl,
      active: true,
      updatedAt: new Date().toISOString(),
    });
  },
});

export const updateWebsiteImage = adminMutation({
  args: {
    id: v.id("websiteImages"),
    slot: v.optional(v.string()),
    label: v.optional(v.string()),
    group: v.optional(v.string()),
    page: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    imageUrlCleared: v.optional(v.boolean()),
    altText: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { id, imageStorageId, imageUrl: directUrl, imageUrlCleared, ...rest } = args;
    const patch: Record<string, unknown> = {
      ...Object.fromEntries(Object.entries(rest).filter(([, v]) => v !== undefined)),
      updatedAt: new Date().toISOString(),
    };
    if (imageStorageId) {
      patch.imageUrl = (await ctx.storage.getUrl(imageStorageId)) ?? undefined;
    } else if (directUrl !== undefined) {
      patch.imageUrl = directUrl;
    } else if (imageUrlCleared) {
      patch.imageUrl = undefined;
    }
    await ctx.db.patch(id, patch);
    return id;
  },
});

export const deleteWebsiteImage = adminMutation({
  args: { id: v.id("websiteImages") },
  handler: async (ctx, { id }) => {
    await ctx.db.patch(id, { active: false, updatedAt: new Date().toISOString() });
    return id;
  },
});

export const hardDeleteWebsiteImage = adminMutation({
  args: { id: v.id("websiteImages") },
  handler: async (ctx, { id }) => { await ctx.db.delete(id); return id; },
});
