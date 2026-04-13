# FIIT.CO — Product Design Document (PDD)
**Version:** 1.0  
**Date:** April 2026  
**Status:** Phase 1 — In Development

---

## 1. Architecture Overview

The website lives under the `/site` route group inside the existing Next.js monorepo. It is completely isolated from the internal class management app which lives under the `/(app)` route group.

```
src/app/
├── (app)/                  ← Internal class management tool (SEPARATE)
│   └── manage-users/
│       └── ...
└── site/                   ← Public website (THIS PROJECT)
    ├── layout.tsx           ← Shared nav + font injection
    ├── page.tsx             ← Homepage
    ├── booking/
    │   └── page.tsx         ← Booking confirmation
    ├── trainers/
    │   └── [slug]/
    │       └── page.tsx     ← Trainer profile (dynamic)
    ├── classes/
    │   └── [slug]/
    │       └── page.tsx     ← Class detail (dynamic)
    ├── member/
    │   └── page.tsx         ← Member dashboard
    └── onboarding/
        └── page.tsx         ← Onboarding wizard
```

**Route isolation:** The `/site` layout renders its own nav and styling. It does not inherit the internal app's auth checks. Any visitor can access all `/site` pages without logging in.

---

## 2. Navigation

### Top Nav (Fixed, all pages)
```
FIIT.CO [logo]    SCHEDULE  TRAINERS  MEMBERSHIPS  THE STUDIO    [BOOK SESSION]
```

| Link | Destination | Notes |
|---|---|---|
| FIIT.CO logo | `/site` | Homepage |
| SCHEDULE | `/site` | Links to schedule section on homepage |
| TRAINERS | `/site/trainers/jason-battiste` | Opens trainer roster |
| MEMBERSHIPS | `/site` | Links to pricing section |
| THE STUDIO | `/site` | Links to Foundry section |
| BOOK SESSION | `/site/booking` | Primary CTA — red button |

---

## 3. Page Specifications

---

### 3.1 Homepage (`/site`)

**Purpose:** Establish brand identity, showcase offering, drive bookings.

**Sections (top to bottom):**

#### Hero
- Full-bleed boxing photography background with dark overlay
- Watermark text "BOXING" at large scale (low opacity)
- Headline: **FIGHT FOR YOUR BEST SELF** (Oswald, ~11vw, uppercase)
- Two CTAs: `Book Now` (red filled) → `/site/booking`, `Get Started` (white outline) → `/site/onboarding`

#### Info Bar
- Dark strip below hero
- Red top border
- Three data points: Location / Phone / Hours

#### Trainers
- Section label: `— ELITE PERSONNEL`
- 5-column grid of trainer portrait photos
- Photos: grayscale by default, colour on hover
- Name in small Chakra Petch text below each photo
- Each card links to `/site/trainers/[slug]`

**Trainers:**
| Name | Slug | Specialty |
|---|---|---|
| Jason Battiste | `jason-battiste` | Counter-Punching |
| Matt Makar | `matt-makar` | Strength & Power |
| Sarah Green | `sarah-green` | Technique & Flow |
| Jaye Pan | `jaye-pan` | Endurance |
| Nick Radionov | `nick-radionov` | Explosive Output |

#### Three Pillars
- 3-column grid, black background
- Each pillar: number label (01/02/03) in red, large red uppercase heading, body text
- **01 THE TRAINING** — methodology copy
- **02 THE SPACE** — 6,000 sq ft facility copy
- **03 THE COMMUNITY** — Toronto collective copy

#### Investment Tiers
- Section label: `— INVESTMENT TIERS`
- Tab switcher: `GROUP CLASSES` | `PERSONAL TRAINING` | `KIDS ACADEMY`
- Active tab: white text + red underline bar
- 3 pricing cards:

| Plan | Label | Price | Features | CTA |
|---|---|---|---|---|
| SINGLE FIGHT | STARTER | $35/cad | 1 Session, Gloves, 30 Days | BUY NOW (outlined) |
| UNLIMITED FIIT | RECOMMENDED | $249/mo | Unlimited, 2 Guest Passes, 15% Discount, Priority Booking | SELECT PLAN (red filled) |
| 10 SESSION PACK | COMMITTED | $280/cad | 10 Sessions, No Expiry, Shared Access | BUY NOW (outlined) |

- UNLIMITED FIIT card: red border (2px), red-tinted background

#### Refer a Contender
- Full-width red (`#D92B2B`) banner
- Headline: **REFER A CONTENDER** (Oswald, ~7vw)
- Subtext: GET 50% OFF YOUR NEXT MONTH FOR EVERY REFERRAL THAT SIGNS UP.

#### Studio Credits
- Section label: `— STUDIO CREDITS`
- 4 gift card tiles in a row: $50 / $100 / $250 / $500
- Each: white border, hover turns red border, "Digital Gift" label below price

#### Foundry
- Section label: `— FOUNDRY`
- Two-column layout:
  - **Left:** Large decorative red quote mark, founder quote (Oswald bold, ~2.6rem), attribution: *– Jason Battiste, Founder*
  - **Right:** 3×2 grid of dark equipment tiles
    - HEAVY BAGS (X30) / SPEED BAGS (X5)
    - OLYMPIC SQUAT RACK / ASSAULT BIKES (X12)
    - CUSTOM 18FT RING / ICE BATH FACILITY

#### Footer
- 4-column grid
- Col 1: FIIT.CO logo + studio tagline + est. date
- Col 2: **EXPLORE** — Classes, Workshops, Our Story, Franchise
- Col 3: **SUPPORT** — FAQ, Terms & Waiver, Contact Us, Privacy Policy
- Col 4: **CONNECT** — Instagram, TikTok, YouTube, Newsletter
- Column headings in red

---

### 3.2 Booking Confirmation (`/site/booking`)

**Purpose:** Confirm a booked session and reduce no-shows.

**Sections:**
- Green checkmark icon + "Booking Confirmed" heading
- Booking details card:
  - Class name, date/time, trainer, location, confirmation number
- What to bring checklist (gloves, hand wraps, water, towel)
- Cancellation policy (24hr notice required)
- Action buttons: Add to Calendar / Book Another Session / Go to Dashboard
- Recommended classes section (3 cards)

---

### 3.3 Trainer Profile (`/site/trainers/[slug]`)

**Supported slugs:** `jason-battiste`, `matt-makar`

**Sections:**
- Full-bleed hero image (grayscale) with name overlay
- Stats bar: Years Experience / Clients Trained / Titles / Classes/Week
- Bio paragraph
- Philosophy blockquote (red left border)
- Specialisations (tag chips)
- Certifications list
- Weekly schedule panel with per-slot Book CTA

---

### 3.4 Class Detail (`/site/classes/[slug]`)

**Supported slugs:** `heavy-bag-smash`, `ring-technicals`

**Sections:**
- Hero with category / tier / duration badges
- Class description
- What you get (bullet list)
- Ideal for (tag chips)
- Equipment needed (grid)
- Interactive slot picker — click slot to select, enables Confirm button
- Trainer teaser with link to trainer profile

---

### 3.5 Member Dashboard (`/site/member`)

**Purpose:** Returning member's personal hub.

**Sections:**
- Stats grid: Sessions Attended / Current Streak / Total Hours / Remaining Sessions
- Three-tab interface:
  - **Upcoming** — next booked sessions with class/time/trainer/cancel option
  - **History** — past sessions with ATTENDED / NO-SHOW badge
  - **Membership** — current plan card, guest passes, referral code

---

### 3.6 Onboarding Wizard (`/site/onboarding`)

**Purpose:** Guide a new visitor to the right membership plan.

**Steps:**

| Step | Content |
|---|---|
| 0 | Welcome screen + studio stats (1,200+ members, 15 classes/week, etc.) |
| 1 | Goal selection: Fitness / Competition / Stress Relief / Weight Loss |
| 2 | Experience level: Complete Beginner / Some Experience / Trained Before / Competitive |
| 3 | Preferred time (Morning/Afternoon/Evening) + days (multi-select Mon–Sun) |
| 4 | Personalised plan recommendation based on goal + level |

- Progress bar animates across steps
- Plan recommendation logic:
  - Fitness + Beginner → Single Fight (try it first)
  - Competition + Any → Unlimited FIIT
  - Stress Relief → Unlimited FIIT
  - Weight Loss + Experienced → 10 Session Pack

---

## 4. Design System

### Colours
| Token | Value | Usage |
|---|---|---|
| `--red` | `#D92B2B` | CTAs, headings, labels, accents |
| `--black` | `#000000` | Page background |
| `--dark` | `#1A1A1A` | Card backgrounds, info bar |
| `--white` | `#FFFFFF` | Primary text |
| `--muted` | `rgba(255,255,255,0.55)` | Secondary text |
| `--border` | `rgba(255,255,255,0.15)` | Card borders |

### Typography
| Font | Variable | Usage |
|---|---|---|
| Oswald | `--font-oswald` | All headings, prices, hero text, CTAs |
| Chakra Petch | `--font-chakra` | Section labels, nav links, tags, small UI |
| Inter | `--font-inter` | Body copy, descriptions |

### Section Labels
All sections use a consistent label pattern:
```
—— SECTION NAME
```
Red 28px horizontal rule + uppercase Chakra Petch text, 10px, letter-spacing 0.2em.

### Spacing
- Section padding: `7rem 4rem` (desktop)
- Card gap: `1–1.5rem`
- Section gap between pillars: `5rem`

### Buttons
| Type | Style |
|---|---|
| Primary CTA | Red background, white text, Oswald bold, uppercase |
| Secondary CTA | White/transparent border, white text |
| Outlined dark | `rgba(255,255,255,0.45)` border, transparent bg |

---

## 5. Data & Content

### Phase 1 (Current)
All content is hardcoded in each page component. Trainer data, class data, pricing, and equipment are static arrays/objects defined at the top of each file.

### Phase 2
Content to be migrated to Convex database with CMS-style admin interface, enabling Jason / studio staff to update schedules, trainers, and pricing without a code deploy.

---

## 6. Integrations

| Service | Phase | Purpose |
|---|---|---|
| Mindbody | Phase 2 | Live class schedule, booking, payment processing |
| Google Calendar API | Phase 2 | "Add to Calendar" on booking confirmation |
| Instagram API | Phase 2 | Feed embed on homepage |
| Convex | Phase 2 | Dynamic content management |

---

## 7. Non-Functional Requirements

| Requirement | Target |
|---|---|
| Lighthouse Performance | 85+ |
| Lighthouse Accessibility | 90+ |
| First Contentful Paint | < 1.5s |
| Mobile breakpoints | 375px, 768px, 1280px |
| Browser support | Chrome, Safari, Firefox (last 2 versions) |
| Image loading | Lazy load all below-fold images |

---

## 8. Open Items / Phase 2 Backlog

- [ ] Replace Pexels placeholder images with real studio photography
- [ ] Wire booking form to Mindbody API
- [ ] Add member login / session persistence
- [ ] Live schedule pull from Mindbody
- [ ] Mobile responsive breakpoints (currently desktop-first)
- [ ] Kids Academy and Personal Training pricing content
- [ ] Email confirmation on booking
- [ ] Referral code generation and tracking
- [ ] SEO metadata per page (og:image, description, etc.)
- [ ] Analytics (Google Analytics or Plausible)
