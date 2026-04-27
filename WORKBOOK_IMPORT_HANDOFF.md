# FIIT Workbook Import Handoff

## Goal

Import the data from:

- `/Users/davidezieshi/Downloads/Tyler COOp Proj/FIIT_Co_Class_Management_Tool_v4_FINAL.xlsx`

into the Convex-backed FIIT Ops app while preserving the existing `users` table so Arden's admin login remains untouched.

## Important Constraint

- Do not modify or reseed Arden's admin account.
- Safer approach: leave the entire `users` table alone during import.

## Current State

- No code has been deployed yet.
- No live Convex data has been changed yet.
- A live query attempt was blocked because network approval was not granted in this session.

## Best Implementation Path

1. Add a workbook parser script for `FIIT_Co_Class_Management_Tool_v4_FINAL.xlsx`.
2. Add a dedicated public Convex mutation such as `importWorkbookData` that:
   - clears imported data tables
   - reinserts parsed workbook data
   - does **not** touch `users`
   - optionally clears `pendingChanges` because old review items may point at replaced records
3. Use a local import script to:
   - parse the workbook
   - call the Convex mutation against production
4. Remove or disable the dashboard's demo reseed path so imported data is not accidentally overwritten later.

## Tables That Can Be Imported Directly

- `categories` from `📂 Category Library`
- `subcategories` from `📂 Subcategory Library`
- `classes` from `📋 Class Library`
- `tiers` from `🏅 Tiers Library`
- `equipment` from `🔧 Equipment Library`
- `pathways` from `🗂️ Pathway Library`
- `deliveryLog` from `📝 Class Delivery Log`

## Tables That Need Parsing / Transformation

### `instructors`

Use:

- `👤 Instructors` as the primary operational source for:
  - `instructorId`
  - `fullName`
  - `specialisations`
  - `certifications`
  - `phone`
  - `email`
- `👥 Instructor Library` merged by `fullName` for:
  - `displayName`
  - `status`
  - `notes`
  - `joinDate` if present

Important quirk:

- The two instructor tabs use different IDs for the same people.
- Merge by `fullName`, not by instructor ID.
- For final imported records, use the operational IDs from `👤 Instructors`, since those are the IDs referenced in schedule and delivery logs.

### `availability`

Source:

- `📋 Availability & Subs`

Shape:

- blocks per instructor
- time-slot rows beneath each instructor name
- cells contain `✅` or `❌`

Recommended mapping:

- one Convex row per instructor + day + time slot
- `startTime` = slot label
- `endTime` = one hour after start
- `available` = `✅`

### `weeklySchedule`

Source:

- `📅 Weekly Schedule`

Parsing notes:

- week title says `Week of March 3, 2026`
- the actual Monday for that displayed week is `2026-03-02`
- schedule cells follow:
  - `emoji + class name`
  - newline
  - `instructor [capacity]`

Recommended mapping:

- derive `date` from day column + week anchor
- `startTime` from row label
- `endTime` from class duration if known, otherwise default to 60 min
- `status` = `Scheduled`
- `bufferViolation` = `false`
- `bufferOverrideAcknowledged` = `false`

Important quirk:

- Several schedule class names do not exactly match the master class library.

Suggested alias map for resolving `classId` consistently:

- `Boxing Basics` -> `CLS-04`
- `Lunch Box` -> `CLS-04`
- `Bag Work` -> `CLS-04`
- `Advanced Boxing` -> `CLS-05`
- `Fight Night Prep` -> `CLS-05`
- `Open Sparring` -> `CLS-05`
- `Hybrid Crusher` -> `CLS-06`
- `Hybrid & Pilates` -> `CLS-06`
- `Yoga & Box` -> `CLS-06`
- `HIT Circuit` -> `CLS-06`
- `Sunday Sweat` -> `CLS-06`
- `Pilates Box` -> `CLS-07`
- `Yoga Circuit` -> `CLS-08`
- `Power Hour` -> `CLS-01`
- `Strength & Conditioning` -> `CLS-01`
- `Full Body Strength` -> `CLS-03`
- `Weekend Warriors` -> `CLS-04`

These are informed mappings, not perfect source-truth.

### `classPrograms`

Source:

- `🥊 Class Program`

Parsing notes:

- each section begins with a row like:
  - `CLASS: Boxing Basics — Monday 6:00 AM — Instructor: Jason Battiste`
- rows below contain block rows until the `Total class duration...` row

Recommended mapping:

- one `classPrograms` record per section
- `weekOf` = `2026-03-02`
- `status` = `Submitted`
  - this aligns with the workbook dashboard note that `3 class programs submitted`
- `submittedAt` can be derived from the `Created:` date in the footer row
- block mapping:
  - `blockType` = phase column
  - `exerciseName` = title column
  - `durationMinutes` = parsed duration
  - `description` = title column
  - `instructions` = description/instructions column
  - `equipment` = split equipment list, `None` -> `[]`

### `clientJourneys`

Source:

- `🧭 Client Journey`

Parsing notes:

- multiple rows belong to the same `journeyId`
- group by `journeyId`
- row shape is effectively:
  - `journeyId`
  - `title`
  - `goalType`
  - `pathwayId`
  - `weekNumber`
  - `classId`
  - `className`
  - `category` (ignore for schema)
  - `focus`
  - `notes`
  - `status`

Recommended mapping:

- `active` = `true` unless all grouped rows are completed/inactive

### `exercises`

Source:

- `📚 Exercise Library`

Parsing notes:

- data begins on row 3
- effective columns are:
  - row number
  - category
  - name
  - description
  - equipment
  - tier

Recommended mapping:

- `exerciseId` = `EXC-001`, `EXC-002`, etc.
- `active` = `true`
- `subcategory` = omit / `undefined`
  - the sheet does not provide it cleanly
- `equipment` = split comma-separated values

## Workbook Quirks Worth Remembering

- `👥 Instructor Library` and `👤 Instructors` conflict on IDs.
- Schedule names are not fully normalized against the class library.
- Some operational email addresses in `👤 Instructors` appear inherited from an older demo roster.
- `🛤️ Pathways` is narrative/detail content and does not map cleanly to the existing Convex `pathways` schema.
  - Prefer `🗂️ Pathway Library` as the source for the `pathways` table.
- `📝 Class Delivery Log` contains a summary section after the actual rows.
  - stop importing once `DELIVERY LOG SUMMARY` is reached.

## Files Likely To Change Next

- `convex/mutations.ts`
- `src/app/(app)/dashboard/page.tsx`
- a new parser script under `scripts/`
- a new import runner script under `scripts/`

## Deployment / Run Notes

Production Convex URL already used locally in the repo:

- `https://posh-coyote-465.convex.cloud`

To finish later:

1. add the parser + import mutation
2. deploy Convex functions
3. run the import script against the final workbook
4. verify in the live app

