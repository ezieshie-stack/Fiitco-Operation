# FIIT.CO — Project Brief
**Version:** 1.0  
**Date:** April 2026  
**Client:** FIIT Co. Boxing & Fitness  
**Location:** 481 Richmond St W, Toronto, ON

---

## 1. Overview

FIIT.CO is a boutique boxing and fitness studio in downtown Toronto, established in 2015. This project is a standalone public-facing marketing website, completely separate from the internal class management tool already in operation.

The website's purpose is to drive new member acquisition, communicate the brand's identity, and enable class bookings — positioning FIIT.CO as the premier boxing destination in Toronto.

---

## 2. The Problem

FIIT.CO has a fully operational internal management system but no public-facing web presence. Prospective members have no way to:
- Discover the studio and its offering online
- Learn about trainers and class types
- Book sessions without calling in
- Understand pricing and membership options
- Find the studio or assess if it's the right fit

---

## 3. Goals

| Priority | Goal |
|---|---|
| 1 | Drive class bookings through an online channel |
| 2 | Communicate brand identity (elite, gritty, boutique) |
| 3 | Showcase trainers and build trainer-member relationships |
| 4 | Convert visitors to members via clear pricing and onboarding |
| 5 | Support referral growth through the Refer a Contender programme |

---

## 4. Target Audience

**Primary:** Toronto adults 22–45, fitness-conscious, seeking structured training beyond a standard gym. Professionals who value premium, outcome-driven experiences.

**Secondary:** Boxing enthusiasts looking to train seriously under professional instruction.

**Tertiary:** Parents seeking structured youth boxing (Kids Academy).

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

### In Scope
- 6 public-facing web views (detailed in the PDD)
- Mobile-responsive design
- Class booking flow
- Trainer profiles
- Membership/pricing pages
- Member dashboard (returning member view)
- Onboarding flow for new members
- Studio credits / gift cards section
- Referral programme section

### Out of Scope
- Internal class management tool (separate system, already built)
- Payment processing backend (Mindbody integration — Phase 2)
- User authentication for members (Phase 2)
- Blog or editorial content
- Native mobile app

---

## 7. Technical Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Inline styles (consistent with existing codebase) |
| Fonts | Google Fonts via `next/font/google` |
| Hosting | Vercel |
| Backend | Convex (used by internal app — website is largely static) |
| Images | Pexels CDN (placeholder; real photography Phase 2) |

---

## 8. Success Metrics

- Bounce rate below 50% on the homepage
- Booking form conversion rate above 8%
- Trainer profile page engagement (avg. time on page > 90s)
- Referral programme click-through rate
- Mobile usability score 90+ (Lighthouse)

---

## 9. Phases

**Phase 1 (Current):** Static marketing website with 6 core views, booking form, and onboarding flow.  
**Phase 2:** Live class schedule integration (Mindbody API), member login, real payment processing.  
**Phase 3:** App-like member portal with session history, streaks, and loyalty rewards.

---

## 10. Stakeholders

| Role | Name |
|---|---|
| Founder / Brand Lead | Jason Battiste |
| Development | Claude Code (Anthropic) |
| Design Reference | Provided design screenshots (April 2026) |
