# FIIT.CO — Project Brief
**Version:** 2.0
**Date:** April 2026
**Client:** FIIT Co. Boxing & Fitness
**Location:** 1047 Gerrard St E, Toronto, ON M4M 1Z7

---

## 1. Overview

FIIT.CO is a boutique boxing and fitness studio in downtown Toronto, established in 2015. This project delivers a standalone public-facing marketing website, completely separate from the internal class management tool already in operation.

The website drives new member acquisition, communicates the brand identity, and connects visitors to booking through Mindbody — the studio's existing booking and membership platform.

---

## 2. The Problem

FIIT.CO has a fully operational internal management system but no modern public-facing web presence. Prospective members have no way to:
- Discover the studio and its offering online
- Learn about trainers, programs, and class types
- Book sessions or purchase memberships online
- Submit guest passes or referrals digitally
- Find the studio or assess if it's the right fit

---

## 3. Goals

| Priority | Goal |
|---|---|
| 1 | Drive class bookings via Mindbody integration |
| 2 | Communicate brand identity (elite, gritty, boutique) |
| 3 | Showcase trainers and programs |
| 4 | Enable digital guest pass submission |
| 5 | Enable digital referral submission |
| 6 | Support front desk staff with guest pass + referral management |

---

## 4. Target Audience

**Primary:** Toronto adults 22–45, fitness-conscious, seeking structured training beyond a standard gym. Professionals who value premium, outcome-driven experiences.

**Secondary:** Boxing enthusiasts looking to train seriously under professional instruction.

**Tertiary:** Parents seeking structured youth boxing (Kids & Teens Academy, ages 12–17).

---

## 5. Brand Identity

| Element | Value |
|---|---|
| Colours | Black `#000000`, Red `#D92B2B`, White `#FFFFFF` |
| Fonts | Oswald (headings/display), Chakra Petch (labels/UI), Inter (body) |
| Tone | Direct. Confident. No fluff. |
| Aesthetic | Industrial grit meets boutique luxury |
| Tagline | Fight For Your Best Self |

---

## 6. Scope of Work

### Public Website (New)
- 5 public-facing pages: Homepage, About, Programs, Studio Info, Blog
- Mobile-responsive design
- All booking/membership CTAs link out to Mindbody (external)
- Guest Pass modal form (no login required)
- Referral modal form (no login required)

### Internal Tool — Front Desk Tab (New)
- New tab inside the existing class management tool
- Guest pass lookup, redemption, and walk-in creation
- Referral record lookup and status management
- Accessible to instructors and admins only

### Out of Scope
- Native mobile app
- Payment processing (handled entirely by Mindbody)
- Member authentication on the public website
- Blog CMS (Phase 2 — static posts for now)

---

## 7. Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Fonts | Google Fonts via `next/font/google` |
| Hosting | Vercel |
| Database | Convex (guest passes + referrals tables) |
| Booking / Membership | Mindbody (external link) |
| Images | Pexels CDN (placeholder; real photography Phase 2) |

---

## 8. Real Studio Data

| Field | Value |
|---|---|
| Address | 1047 Gerrard St E, Toronto, ON M4M 1Z7 |
| Phone | (416) 565-9300 |
| Email | info@fiitco.ca |
| Hours | Mon / Wed–Fri: 6 AM – 9 PM · Tue / Sat–Sun: 8 AM – 5 PM |
| Mindbody | mindbodyonline.com/explore/deals/fiit-co/intro-offer-10377 |
| Instagram | @fiitco.to |

---

## 9. Trainers

| Name | Role |
|---|---|
| Jason Battiste | Owner & Founder — Former Canadian Super Middleweight Kickboxing Champion, 35+ years experience |
| Sarah Green | Trainer — Certified group fitness, kickboxing, TRX, yoga. ~20 years experience |
| Tyrone Warner | Yoga Instructor — Hatha, Vinyasa, Yin traditions |
| Nick Radionov | Boxing Academy Coach — Boxing Ontario Level 3, former Ukrainian National Olympic Team, 2x World Kickboxing Champion |

---

## 10. Success Metrics

- Bounce rate below 50% on homepage
- Mindbody CTA click-through rate above 12%
- Guest pass form submissions tracked monthly
- Referral form submissions tracked monthly
- Mobile Lighthouse score 90+

---

## 11. Phases

**Phase 1 (Current):**
- Public website (5 pages)
- Guest pass + referral modal forms
- Front desk management tab in class management tool

**Phase 2:**
- Blog CMS (Convex-backed, staff-editable)
- Real studio photography
- Mobile responsive polish
- SEO metadata + analytics

**Phase 3:**
- Member portal (session history, loyalty, streaks)
- Mindbody webhook integration for auto-referral completion

---

## 12. Stakeholders

| Role | Name |
|---|---|
| Founder / Brand Lead | Jason Battiste |
| Development | Claude Code (Anthropic) |
| Design Reference | fiitco.ca (existing site) + provided screenshots |
