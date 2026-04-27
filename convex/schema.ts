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

  // Refer-a-friend submissions from the customer website or walked in at the
  // front desk. Staff mark completed once the friend signs up, then rewarded
  // once the 50% discount is manually applied in Mindbody.
  referrals: defineTable({
    referrerFirstName: v.string(),
    referrerPhone: v.string(),
    friendFirstName: v.string(),
    friendPhone: v.string(),
    status: v.string(),              // "pending" | "completed" | "rewarded"
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
    rewardedAt: v.optional(v.number()),
    createdBy: v.string(),           // "website" | "front-desk"
    notes: v.optional(v.string()),
  })
    .index("by_referrerPhone", ["referrerPhone"])
    .index("by_friendPhone", ["friendPhone"])
    .index("by_status", ["status"]),

  // Monthly guest passes. Members get MONTHLY_LIMIT=2 per calendar month.
  // monthKey ("YYYY-MM") drives the monthly limit check via compound index.
  guestPasses: defineTable({
    memberFirstName: v.string(),
    memberPhone: v.string(),
    guestFirstName: v.string(),
    guestPhone: v.string(),
    status: v.string(),              // "pending" | "redeemed" | "expired"
    createdAt: v.number(),
    redeemedAt: v.optional(v.number()),
    monthKey: v.string(),            // "YYYY-MM"
    createdBy: v.string(),           // "website" | "front-desk"
    redeemedBy: v.optional(v.string()),
    notes: v.optional(v.string()),
  })
    .index("by_memberPhone", ["memberPhone"])
    .index("by_guestPhone", ["guestPhone"])
    .index("by_status", ["status"])
    .index("by_monthKey_memberPhone", ["monthKey", "memberPhone"]),

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
    // Hidden users exist in the DB and can log in normally, but are filtered
    // out of the Manage Users UI. Useful for dev/maintenance accounts that
    // shouldn't appear in the regular admin directory.
    isHidden: v.optional(v.boolean()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"]),

  // ════════════════════════════════════════════════════════════════════
  // PUBLIC WEBSITE CONTENT (fiit-website reads these tables live)
  //
  // Each table below powers a section of the customer-facing website and
  // has matching admin UI in the ops tool under "Website Content". The
  // website replaces its hardcoded _data/*.ts imports with useQuery() calls
  // against these tables. Soft-delete via `active: false` everywhere so
  // accidental "deletes" in the admin UI can be reversed.
  // ════════════════════════════════════════════════════════════════════

  // Public-facing trainer bios shown on homepage team showcase + About page.
  // Intentionally separate from the ops `instructors` table above — that
  // one tracks operational data (email, phone, join date); this one is
  // marketing copy + photos that Arden's team edits freely.
  trainers: defineTable({
    slug: v.string(),                // stable URL anchor ("jason", "sarah")
    name: v.string(),
    role: v.string(),                // "Owner & Founder", "Trainer"
    category: v.string(),            // "fiit" | "academy"
    bio: v.string(),                 // short one-liner for team showcase hover
    fullBio: v.array(v.string()),    // multi-paragraph for About page
    tags: v.array(v.string()),       // credential chips
    photoUrl: v.optional(v.string()),
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_displayOrder", ["active", "displayOrder"]),

  // Community page collaborator cards
  collaborators: defineTable({
    slug: v.string(),
    name: v.string(),
    category: v.string(),            // "Coffee", "Nutrition", etc.
    description: v.string(),
    href: v.optional(v.string()),    // external URL; null = no website
    location: v.optional(v.string()),
    photoUrl: v.optional(v.string()),
    confirmed: v.boolean(),          // false → "Coming soon" tag on card
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_displayOrder", ["active", "displayOrder"]),

  // Class-format cards on the Programs page (12 currently)
  classFormats: defineTable({
    slug: v.string(),
    num: v.string(),                 // "01", "02" — the big number on each card
    tag: v.string(),                 // small eyebrow ("Hybrid", "Endurance")
    title: v.string(),               // "FIIT Hybrid"
    category: v.string(),            // "fiit" | "academy"
    imageUrl: v.optional(v.string()),
    includes: v.array(v.string()),
    who: v.string(),                 // one-liner under the bullets
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_category_displayOrder", ["category", "displayOrder"])
    .index("by_active_displayOrder", ["active", "displayOrder"]),

  // Pricing plans — A / A.2 / A.3 / B / C / D sections on Programs page.
  // `section` groups them; `style` says whether to render as a full pricing
  // card (multi-feature) or a compact pack tile (just price + label + note).
  pricingPlans: defineTable({
    slug: v.string(),
    section: v.string(),             // "group-memberships", "class-packs", "kids", "small-group", "personal-training", "academy-adult", "academy-teens"
    sectionLabel: v.string(),        // "A · FIIT Co Memberships" — shown as section eyebrow
    sectionTitle: v.string(),        // "Train The Way That Works For You."
    sectionDescription: v.optional(v.string()),
    price: v.string(),               // "$49.99"
    name: v.string(),                // "2-Week Trial"
    note: v.optional(v.string()),
    features: v.array(v.string()),
    featured: v.boolean(),
    badge: v.optional(v.string()),   // "Most Popular", "Best Value"
    style: v.string(),               // "pricing" | "pack"
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_section_displayOrder", ["section", "displayOrder"])
    .index("by_active_displayOrder", ["active", "displayOrder"]),

  // Blog posts — body stored as TipTap JSON doc (serialized) for safe
  // render. Render-time HTML generated from the JSON on the website.
  blogPosts: defineTable({
    slug: v.string(),                // URL-safe — stable anchor for SEO
    title: v.string(),
    excerpt: v.string(),
    category: v.string(),
    author: v.string(),
    readTime: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    bodyJson: v.string(),            // TipTap JSON.stringify()'d
    status: v.string(),              // "draft" | "published"
    featured: v.boolean(),           // hero-card on /blog
    publishedAt: v.optional(v.string()),
    displayOrder: v.optional(v.number()),
    createdAt: v.string(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_status_publishedAt", ["status", "publishedAt"])
    .index("by_featured", ["featured"]),

  // Studio locations. One row today (Leslieville) but structured for
  // expansion — drives both the studio page and the footer map/address.
  locations: defineTable({
    slug: v.string(),
    name: v.string(),                // "FIIT Co. Leslieville"
    address1: v.string(),
    address2: v.optional(v.string()),
    city: v.string(),
    region: v.string(),              // "ON"
    postalCode: v.string(),
    country: v.string(),             // "CA"
    phone: v.string(),
    email: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    hoursMonFri: v.string(),         // "6:00 AM – 8:30 PM"
    hoursSatSun: v.string(),         // "8:00 AM – 8:30 PM"
    isPrimary: v.boolean(),
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_slug", ["slug"])
    .index("by_active_displayOrder", ["active", "displayOrder"])
    .index("by_isPrimary", ["isPrimary"]),

  // Homepage "Members Talk" testimonials
  testimonials: defineTable({
    firstName: v.string(),
    lastInitial: v.string(),
    role: v.optional(v.string()),    // "Member", "Member · Parent"
    rating: v.number(),              // 1-5
    text: v.string(),
    source: v.optional(v.string()),  // "Google Review", "Direct"
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_active_displayOrder", ["active", "displayOrder"]),

  // Homepage "You've Got Questions" FAQ entries
  faqEntries: defineTable({
    question: v.string(),
    answer: v.string(),
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_active_displayOrder", ["active", "displayOrder"]),

  // Promotional videos placed into named slots across site pages.
  // `pageSlot` examples: "home:after-hero", "about:after-story",
  // "programs:after-hero". Each slot can hold 0+ videos; multiple stack
  // vertically in `displayOrder`. Scroll-to-autoplay behavior is handled
  // by the <PromoSlot/> component on the website side.
  promoVideos: defineTable({
    title: v.string(),               // internal label for the admin list
    youtubeId: v.string(),           // extracted from the URL the admin pastes
    pageSlot: v.string(),            // "home:after-testimonials"
    headline: v.optional(v.string()),     // optional per-embed heading
    subheadline: v.optional(v.string()),
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_pageSlot_active", ["pageSlot", "active"])
    .index("by_active_displayOrder", ["active", "displayOrder"]),

  // Website images — hero backgrounds + studio gallery + other site-wide
  // imagery not already managed by other modules (trainer photos, blog
  // covers, class formats, etc., have their own tables).
  //
  // `slot` is a globally unique identifier like "home-hero" or
  // "studio-gallery-1" that maps 1:1 to a <LiveImage slot="..."/> call
  // on the customer website.
  //
  // `group` lets the admin UI cluster related slots (all heroes together,
  // all gallery slots together) without hardcoded layout assumptions.
  websiteImages: defineTable({
    slot: v.string(),                // unique key — one image per slot
    label: v.string(),               // "Homepage Hero Background"
    group: v.string(),               // "hero" | "gallery"
    page: v.string(),                // "home" | "about" | "studio" | ...
    imageUrl: v.optional(v.string()),
    altText: v.string(),
    displayOrder: v.number(),
    active: v.boolean(),
    updatedAt: v.string(),
  })
    .index("by_slot", ["slot"])
    .index("by_group_page_displayOrder", ["group", "page", "displayOrder"])
    .index("by_active_slot", ["active", "slot"]),

  // Short-lived tokens for email-based password reset. Inserted when any
  // user hits "Forgot password". Link expires 15 minutes after creation and
  // is single-use (marked `used: true` after the new password is saved).
  passwordResetTokens: defineTable({
    token: v.string(),       // random opaque string sent in the email link
    userId: v.id("users"),   // the user this token lets you reset
    expiresAt: v.number(),   // epoch ms; tokens rejected after this
    used: v.boolean(),       // flipped true after first successful reset
    createdAt: v.number(),   // epoch ms; for audit/cleanup
  }).index("by_token", ["token"]),

  // Server-side login sessions. Issued by auth.loginUser when a password
  // check succeeds. Every privileged Convex mutation re-validates the
  // sessionToken via authHelpers.requireAuth(). Tokens are opaque random
  // strings; the client only stores the token (no user data in localStorage).
  sessions: defineTable({
    token: v.string(),       // opaque random string; client stores this
    userId: v.id("users"),   // the user this session belongs to
    createdAt: v.number(),   // epoch ms; for audit
    expiresAt: v.number(),   // epoch ms; rejected after this
    lastSeenAt: v.number(),  // epoch ms; bumped on each requireAuth() call
  })
    .index("by_token", ["token"])
    .index("by_userId", ["userId"]),

  // Per-(ip, action) rate-limit counters. Used by sensitive endpoints
  // (login, security-answer verification, password-reset request) to throttle
  // brute force attempts. Rolling 15-minute window enforced in code.
  rateLimits: defineTable({
    key: v.string(),         // e.g. "login:1.2.3.4" or "verifySA:user@x"
    windowStart: v.number(), // epoch ms; rolling window anchor
    count: v.number(),       // attempts in the current window
  }).index("by_key", ["key"]),

  // Editable legal documents (privacy policy, terms, accessibility).
  // Customer site reads these via getLegalDocBySlug — when a record
  // exists it overrides the hardcoded fallback page on the customer
  // site, so Arden can update legal text without a developer.
  //
  // bodyJson is TipTap JSON serialized as a string, same shape as
  // blogPosts.bodyJson. Customer site renders it via the existing
  // <TipTapRenderer> component.
  //
  // The slug is the URL path the customer site uses ("privacy-policy",
  // "terms", "accessibility"), so adding a new doc is a one-row insert
  // plus a matching Next.js page route.
  legalDocs: defineTable({
    slug: v.string(),                // unique URL identifier
    title: v.string(),               // page heading
    bodyJson: v.string(),            // TipTap JSON content
    effectiveDate: v.optional(v.string()),  // human-readable, e.g. "April 13, 2026"
    lastEditedAt: v.string(),        // ISO datetime
    lastEditedBy: v.string(),        // editor's display name (audit)
  }).index("by_slug", ["slug"]),
});
