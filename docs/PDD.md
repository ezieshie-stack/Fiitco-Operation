# FIIT.CO — Product Design Document (PDD)
**Version:** 2.0
**Date:** April 2026
**Status:** Phase 1 — In Development

---

## 1. Architecture Overview

Two separate systems share the same Next.js monorepo:

```
src/app/
├── (app)/                        ← Internal class management tool
│   ├── manage-users/
│   ├── guest-passes/             ← NEW: Front desk tab
│   └── ...
└── site/                         ← Public website
    ├── layout.tsx                 ← Shared nav + fonts
    ├── page.tsx                   ← Homepage
    ├── about/page.tsx             ← About + Team
    ├── programs/page.tsx          ← Programs
    ├── studio/page.tsx            ← Studio Info
    └── blog/
        ├── page.tsx               ← Blog listing
        └── [slug]/page.tsx        ← Blog post
```

**Route isolation:** `/site` has no auth checks — fully public. `(app)` requires staff login.

**Database:** Convex stores guest pass records and referral records. The website writes to Convex (via mutations). The front desk tool reads and manages those records.

---

## 2. Navigation

```
FIIT.CO    ABOUT    PROGRAMS    STUDIO    BLOG    [BOOK A FREE CLASS ↗]
```

| Link | Destination | Type |
|---|---|---|
| FIIT.CO logo | `/site` | Internal |
| ABOUT | `/site/about` | Internal |
| PROGRAMS | `/site/programs` | Internal |
| STUDIO | `/site/studio` | Internal |
| BLOG | `/site/blog` | Internal |
| BOOK A FREE CLASS | Mindbody URL | External (new tab) |

**Mindbody URL:** `https://www.mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377`

All booking/membership/pricing CTAs across every page point to this same Mindbody URL.

---

## 3. Page Specifications

---

### 3.1 Homepage (`/site`)

**Purpose:** Brand entry point. Establish identity, communicate value, drive Mindbody bookings.

**Sections:**
| Section | Content |
|---|---|
| Hero | Full-bleed boxing photo, headline: FIGHT FOR YOUR BEST SELF, CTA: Book A Free Class → Mindbody |
| Info Bar | Address · Phone · Hours |
| Trainers Teaser | 4 trainer portrait cards (grayscale), names below, links to `/site/about` |
| Three Pillars | 01 THE TRAINING / 02 THE SPACE / 03 THE COMMUNITY |
| Programs Teaser | 3 featured programs with CTA → `/site/programs` |
| Refer a Contender | Full-width red banner with Referral CTA (triggers referral modal) |
| Studio Credits | $50 / $100 / $250 / $500 gift card tiles → Mindbody |
| Foundry | Founder quote + equipment grid |
| Footer | Logo / EXPLORE / SUPPORT / CONNECT |

---

### 3.2 About (`/site/about`)

**Purpose:** Tell the FIIT.CO story. Build trust. Introduce the team.

**Sections:**
| Section | Content |
|---|---|
| Hero | "Meet the FIIT Co Team" — full-width header with photo |
| Studio Story | Founding story, mission, community values |
| Trainer Profiles | Full cards: photo, name, role, bio for each trainer |
| Our Space | Studio description — heavy bags, competition ring, recovery equipment |
| CTA | "Try us out for free" → Mindbody |

**Trainers:**
| Name | Role | Background |
|---|---|---|
| Jason Battiste | Owner & Founder | Former Canadian Super Middleweight Kickboxing Champion, 35+ years experience |
| Sarah Green | Trainer | Certified group fitness, kickboxing, TRX, yoga. ~20 years experience |
| Tyrone Warner | Yoga Instructor | Hatha, Vinyasa, and Yin traditions. Mindfulness + mobility focus |
| Nick Radionov | Boxing Academy Coach | Boxing Ontario Level 3, former Ukrainian National Olympic Team, 2x World Kickboxing Champion |

---

### 3.3 Programs (`/site/programs`)

**Purpose:** Show the full range of training options. Drive Mindbody signups.

**Programs:**
| Program | Description |
|---|---|
| Group Training | Group fitness classes. Expert coaching, variety, community motivation |
| Personal Training | One-on-one. Customized focus on form, technique, mental toughness |
| Small Group Personal Training | Up to 6 participants. Individualized + group support |
| FIIT Co Boxing Academy | 3-tier structured boxing: Level 1 (Foundation) / Level 2 (Development) / Level 3 (Competition) |
| Fight Training for Kids & Teens | Youth boxing ages 12–17. Confidence, discipline, fitness |
| Sports Team Training | Customized athletic programs for team development |

**Each program card:** Name, description, who it's for, CTA → Mindbody

---

### 3.4 Studio Info (`/site/studio`)

**Purpose:** Showcase the facility. Show classes, pricing, and hours.

**Sections:**
| Section | Content |
|---|---|
| Hero | "The Space" — studio photography |
| Classes | Full class list with descriptions |
| Pricing | All tiers displayed clearly with Mindbody CTA |
| Schedule | Static schedule or link to Mindbody schedule view |
| Location + Hours | Map embed, address, phone, hours |

**Classes:**
- FIIT Endure (interval/stamina)
- FIIT Hybrid (boxing + functional stations)
- FIIT Lift (strength/muscle building)
- Boxing Pad Work & Bag Work
- Muay Thai Kickboxing
- FIIT Caveman Circuit
- Yin Yoga
- Boxing Academy (Levels 1–3)
- Teens Boxing (ages 12–17)

**Pricing:**
| Pass | Price | Expiry |
|---|---|---|
| 2-Week Trial | $49.99 | — |
| 5 Class Pass | $125 | 2 months |
| 10 Class Pass | $239 | 4 months |
| 20 Class Pass | $425 | 6 months |
| Monthly Unlimited | $179/mo | — |
| Boxing Academy 5 | $135 | 2 months |
| Boxing Academy 10 | $220 | 3 months |
| Boxing Academy 20 | $400 | 6 months |

All pricing CTAs → Mindbody

---

### 3.5 Blog (`/site/blog` + `/site/blog/[slug]`)

**Purpose:** Content marketing. SEO. Community voice.

**Blog listing page:** Grid of post cards (title, date, category, excerpt, thumbnail)
**Individual post page:** Full article with author, date, category, related posts

**Phase 1:** Static — posts hardcoded as data files
**Phase 2:** Convex-backed CMS editable by staff

---

## 4. Guest Pass Feature

### 4.1 Website Flow (Public — No Login)

A "Guest Pass" CTA on the website (Homepage and Programs page) opens a modal popup.

**Modal Form Fields:**
- Member First Name
- Member Phone Number
- Guest First Name
- Guest Phone Number

**On Submit:**
1. Validate member exists in Convex by phone number
2. Check member's monthly guest pass count (max allowed per plan)
3. If eligible: create guest pass record with status `pending`
4. Show confirmation: "Your guest pass has been submitted. Have [Guest Name] give their name at the front desk on arrival."
5. If not eligible: show reason (e.g. "Monthly guest pass limit reached")

**Convex mutation:** `guestPasses.create`

---

### 4.2 Front Desk Tool (Internal — Staff Only)

New tab in the class management app: **Guest Passes**

**Features:**
| Feature | Description |
|---|---|
| Search by guest | Find passes by guest name or guest phone |
| Search by member | Find all passes issued by a member |
| View pass list | Table: member name, guest name, date issued, status |
| Redeem pass | Mark as `redeemed` — logs timestamp |
| Create walk-in pass | Staff creates a pass on the spot at front desk |
| Status badges | PENDING / REDEEMED / EXPIRED |

**Convex queries:** `guestPasses.search`, `guestPasses.list`, `guestPasses.redeem`, `guestPasses.createWalkIn`

---

### 4.3 Guest Pass Convex Schema

```ts
guestPasses: defineTable({
  memberFirstName:  v.string(),
  memberPhone:      v.string(),
  guestFirstName:   v.string(),
  guestPhone:       v.string(),
  status:           v.union(v.literal("pending"), v.literal("redeemed"), v.literal("expired")),
  createdAt:        v.number(),
  redeemedAt:       v.optional(v.number()),
  monthKey:         v.string(),   // "YYYY-MM" for monthly limit tracking
  createdBy:        v.union(v.literal("website"), v.literal("front-desk")),
})
```

---

## 5. Referral Feature

### 5.1 Website Flow (Public — No Login)

A "Refer a Contender" CTA on the website (Homepage banner + Programs page) opens a modal popup.

**Modal Form Fields:**
- Referrer First Name
- Referrer Phone Number
- Friend's First Name
- Friend's Phone Number

**On Submit:**
1. Validate referrer exists in Convex by phone number
2. Check for duplicate referral (same referrer + friend phone)
3. Create referral record with status `pending`
4. Show confirmation: "Your referral has been submitted. When [Friend Name] signs up, you'll receive your 50% discount automatically."

**Convex mutation:** `referrals.create`

---

### 5.2 Front Desk Tool — Referrals Tab (Internal)

Referral records viewable and manageable alongside guest passes in the internal tool.

**Features:**
| Feature | Description |
|---|---|
| View referrals | Table: referrer name, friend name, date submitted, status |
| Search | By referrer or friend name/phone |
| Mark completed | When referred friend signs up — changes status to `completed` |
| Mark rewarded | When referrer discount applied — changes status to `rewarded` |
| Status badges | PENDING / COMPLETED / REWARDED |

---

### 5.3 Referral Convex Schema

```ts
referrals: defineTable({
  referrerFirstName:  v.string(),
  referrerPhone:      v.string(),
  friendFirstName:    v.string(),
  friendPhone:        v.string(),
  status:             v.union(v.literal("pending"), v.literal("completed"), v.literal("rewarded")),
  createdAt:          v.number(),
  completedAt:        v.optional(v.number()),
  rewardedAt:         v.optional(v.number()),
})
```

---

## 6. Design System

### Colours
| Token | Value | Usage |
|---|---|---|
| Red | `#D92B2B` | CTAs, headings, section labels, accents |
| Black | `#000000` | Page background |
| Dark | `#1A1A1A` | Card backgrounds, info bar |
| White | `#FFFFFF` | Primary text |
| Muted | `rgba(255,255,255,0.55)` | Secondary text |
| Border | `rgba(255,255,255,0.15)` | Card borders (default) |

### Typography
| Font | Variable | Usage |
|---|---|---|
| Oswald | `--font-oswald` | All headings, prices, hero, CTAs, logo |
| Chakra Petch | `--font-chakra` | Section labels, nav, tags, small UI |
| Inter | `--font-inter` | Body copy, descriptions |

### Modals
- Dark overlay background (`rgba(0,0,0,0.85)`)
- Modal panel: `#1A1A1A` background, red top border (4px)
- Form inputs: `#000` background, `rgba(255,255,255,0.15)` border
- Submit button: red filled, Oswald uppercase
- Close button: top right corner

### Section Labels
```
—— SECTION NAME
```
28px red dash + Chakra Petch, 10px, uppercase, letter-spacing 0.2em

### Buttons
| Type | Style |
|---|---|
| Primary | Red background, white text, Oswald bold uppercase |
| Secondary | White outline, transparent bg |
| External (Mindbody) | Red filled + ↗ icon to indicate new tab |

---

## 7. Data & Content

### Phase 1 — Static
All page content (programs, classes, pricing, trainer bios) hardcoded in components.
Guest passes and referrals stored in Convex.

### Phase 2 — CMS
Blog posts migrated to Convex. Staff-editable via admin interface.
Studio info and pricing editable without code deploys.

---

## 8. Integrations

| Service | Phase | Purpose |
|---|---|---|
| Mindbody | Live (external link) | Booking, membership, payment |
| Convex | Phase 1 | Guest passes + referrals database |
| Google Calendar API | Phase 2 | Add to calendar on confirmations |
| Instagram API | Phase 2 | Feed embed |
| Analytics | Phase 2 | Google Analytics or Plausible |

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Lighthouse Performance | 85+ |
| Lighthouse Accessibility | 90+ |
| First Contentful Paint | < 1.5s |
| Mobile breakpoints | 375px, 768px, 1280px |
| Browser support | Chrome, Safari, Firefox (last 2 versions) |
| Modal accessibility | Focus trap, ESC to close, ARIA labels |

---

## 10. Phase 2 Backlog

- [ ] Real studio photography (replace Pexels placeholders)
- [ ] Blog CMS via Convex
- [ ] Mobile responsive breakpoints
- [ ] SEO metadata per page
- [ ] Analytics integration
- [ ] Mindbody webhook → auto-complete referrals when friend signs up
- [ ] Monthly guest pass limit enforcement per membership tier
- [ ] Email/SMS confirmation on guest pass + referral submission
- [ ] Trainer profiles for all 4 trainers (currently 2 slugs built)
