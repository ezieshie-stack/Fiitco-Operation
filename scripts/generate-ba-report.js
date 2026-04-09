const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, LevelFormat, TabStopType, TabStopPosition,
  ExternalHyperlink, TableOfContents
} = require("docx");

// ── Colors ──
const BRAND_DARK = "1E1812";
const BRAND_ACCENT = "2E75B6";
const BRAND_WARM = "8B7355";
const HEADER_BG = "1E1812";
const HEADER_TEXT = "FFFFFF";
const ROW_ALT = "F5F0EB";
const BORDER_COLOR = "CCCCCC";
const LIGHT_BG = "F9F5F0";

// ── Table helpers ──
const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_COLOR };
const borders = { top: border, bottom: border, left: border, right: border };
const cellMargins = { top: 80, bottom: 80, left: 120, right: 120 };
const TABLE_WIDTH = 9360;

function headerCell(text, width) {
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: { fill: HEADER_BG, type: ShadingType.CLEAR },
    margins: cellMargins,
    verticalAlign: "center",
    children: [new Paragraph({ children: [new TextRun({ text, bold: true, color: HEADER_TEXT, font: "Arial", size: 20 })] })],
  });
}

function dataCell(text, width, opts = {}) {
  const runs = typeof text === "string"
    ? [new TextRun({ text, font: "Arial", size: 20, bold: opts.bold, color: opts.color })]
    : text;
  return new TableCell({
    borders,
    width: { size: width, type: WidthType.DXA },
    shading: opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins: cellMargins,
    children: [new Paragraph({ children: runs, alignment: opts.align })],
  });
}

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({ heading: level, children: [new TextRun({ text })] });
}

function para(text, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 200 },
    children: [new TextRun({ text, font: "Arial", size: 22, bold: opts.bold, italics: opts.italics, color: opts.color })],
  });
}

function multiRun(runs, opts = {}) {
  return new Paragraph({
    spacing: { after: opts.after ?? 200 },
    children: runs.map(r => new TextRun({ font: "Arial", size: 22, ...r })),
  });
}

function bulletItem(text, ref = "bullets", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  });
}

function numberedItem(text, ref = "numbers", level = 0) {
  return new Paragraph({
    numbering: { reference: ref, level },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
  });
}

function spacer() {
  return new Paragraph({ spacing: { after: 80 }, children: [] });
}

function pageBreak() {
  return new Paragraph({ children: [new PageBreak()] });
}

// ── Build Document ──
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } },
    paragraphStyles: [
      {
        id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, font: "Arial", color: BRAND_DARK },
        paragraph: { spacing: { before: 360, after: 240 }, outlineLevel: 0 },
      },
      {
        id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 30, bold: true, font: "Arial", color: BRAND_WARM },
        paragraph: { spacing: { before: 280, after: 200 }, outlineLevel: 1 },
      },
      {
        id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 26, bold: true, font: "Arial", color: BRAND_DARK },
        paragraph: { spacing: { before: 240, after: 160 }, outlineLevel: 2 },
      },
    ],
  },
  numbering: {
    config: [
      {
        reference: "bullets",
        levels: [
          { level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
          { level: 1, format: LevelFormat.BULLET, text: "\u25E6", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } },
        ],
      },
      {
        reference: "numbers",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ],
      },
      {
        reference: "numbers2",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ],
      },
      {
        reference: "numbers3",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ],
      },
      {
        reference: "numbers4",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ],
      },
      {
        reference: "numbers5",
        levels: [
          { level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
        ],
      },
    ],
  },
  sections: [
    // ════════════ COVER PAGE ════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children: [
        new Paragraph({ spacing: { before: 3000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [new TextRun({ text: "FIIT Co. Boxing & Fitness", font: "Arial", size: 56, bold: true, color: BRAND_DARK })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [new TextRun({ text: "Class Management Tool", font: "Arial", size: 44, color: BRAND_WARM })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 600 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BRAND_WARM, space: 1 } },
          children: [new TextRun({ text: "Business Analysis Report", font: "Arial", size: 32, color: BRAND_DARK })],
        }),
        spacer(),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prepared for", font: "Arial", size: 22, color: "888888" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "FIIT Co. Boxing & Fitness", font: "Arial", size: 26, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "1047 Gerrard St E, Toronto, ON", font: "Arial", size: 22, color: "666666" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prepared by", font: "Arial", size: 22, color: "888888" })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 }, children: [new TextRun({ text: "Team 4 \u2014 George Brown College Co-op", font: "Arial", size: 26, bold: true })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 300 }, children: [new TextRun({ text: "Business Analysis Program", font: "Arial", size: 22, color: "666666" })] }),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Document Version: ", font: "Arial", size: 22, color: "888888" }),
            new TextRun({ text: "2.0", font: "Arial", size: 22, bold: true }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Date: ", font: "Arial", size: 22, color: "888888" }),
            new TextRun({ text: "April 9, 2026", font: "Arial", size: 22, bold: true }),
          ],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: "Status: ", font: "Arial", size: 22, color: "888888" }),
            new TextRun({ text: "In Progress \u2014 Scope 2 Active", font: "Arial", size: 22, bold: true, color: BRAND_ACCENT }),
          ],
        }),
      ],
    },

    // ════════════ TOC + BODY ════════════
    {
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      headers: {
        default: new Header({
          children: [
            new Paragraph({
              border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: BRAND_WARM, space: 4 } },
              children: [
                new TextRun({ text: "FIIT Co. \u2014 Class Management Tool BA Report", font: "Arial", size: 18, color: "888888" }),
                new TextRun({ text: "\tConfidential", font: "Arial", size: 18, color: "BBBBBB", italics: true }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            }),
          ],
        }),
      },
      footers: {
        default: new Footer({
          children: [
            new Paragraph({
              border: { top: { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR, space: 4 } },
              children: [
                new TextRun({ text: "Team 4 \u2014 George Brown College", font: "Arial", size: 16, color: "888888" }),
                new TextRun({ text: "\tPage ", font: "Arial", size: 16, color: "888888" }),
                new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 16, color: "888888" }),
              ],
              tabStops: [{ type: TabStopType.RIGHT, position: TabStopPosition.MAX }],
            }),
          ],
        }),
      },
      children: [
        // ── TABLE OF CONTENTS ──
        heading("Table of Contents"),
        new TableOfContents("Table of Contents", { hyperlink: true, headingStyleRange: "1-3" }),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 1. EXECUTIVE SUMMARY
        // ══════════════════════════════════════════════════════════════════
        heading("1. Executive Summary"),
        para("FIIT Co. Boxing & Fitness is a boutique boxing and fitness studio located at 1047 Gerrard St E, Toronto, Ontario. The gym has experienced rapid growth, expanding from 1\u20132 primary leads to approximately 12 active trainers, with plans to move into a new, larger space by end of 2026 and open a second location within 18 months."),
        para("This Business Analysis engagement, conducted by Team 4 of the George Brown College Co-op Business Analysis Program, was initiated to address three key operational areas identified during stakeholder consultations:"),
        numberedItem("User Acceptance Testing (UAT) of the existing Squarespace website \u2014 COMPLETE", "numbers"),
        numberedItem("Class Management Tool development \u2014 a centralized scheduling, lesson planning, and operational management system \u2014 IN PROGRESS (highest priority)", "numbers"),
        numberedItem("Client Tracking & Body Composition recommendations \u2014 NEARLY FINAL (pending budget confirmation)", "numbers"),
        spacer(),
        para("The Class Management Tool is the centerpiece of this engagement. It replaces fragmented manual processes (Google Calendar, Google Docs, paper-based lesson plans, and screenshot-based communication) with a unified, real-time web application. The tool is designed to become the gym\u2019s single source of truth for all scheduling, programming, and operational data."),
        para("This report documents the complete business analysis lifecycle: stakeholder identification, requirements elicitation, current-state analysis, solution design, prototype development, and testing outcomes."),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 2. PROJECT OVERVIEW
        // ══════════════════════════════════════════════════════════════════
        heading("2. Project Overview"),

        heading("2.1 Project Background", HeadingLevel.HEADING_2),
        para("FIIT Co. is a growing boutique boxing and fitness studio that offers a variety of class types including boxing, strength & conditioning, hybrid training, Pilates, and yoga. The gym operates through two primary systems:"),
        bulletItem("Squarespace \u2014 public-facing website for marketing and general information"),
        bulletItem("MindBody \u2014 booking and membership management platform (source of truth for live schedule)"),
        spacer(),
        para("However, the internal operational workflow \u2014 class scheduling coordination, lesson plan creation, instructor communication, and delivery tracking \u2014 relies on fragmented manual processes. This creates inefficiencies, data silos, and communication gaps that will become increasingly problematic as the gym scales."),

        heading("2.2 Problem Statement", HeadingLevel.HEADING_2),
        para("FIIT Co. lacks a centralized system for managing the full lifecycle of a class, from scheduling through lesson planning to delivery logging and outcome tracking. Specific pain points include:", { bold: true }),
        bulletItem("Scheduling coordination via Google Calendar and screenshots sent to instructors"),
        bulletItem("No structured lesson planning \u2014 instructors fill out plans on paper 10 minutes before class"),
        bulletItem("No formal class pathways or progression tracking for members"),
        bulletItem("No delivery logs to track what was actually taught vs. what was planned"),
        bulletItem("No single source of truth for operational data"),

        heading("2.3 Project Objectives", HeadingLevel.HEADING_2),
        numberedItem("Centralize class scheduling, lesson planning, and delivery tracking into one tool", "numbers2"),
        numberedItem("Establish master data libraries (categories, classes, exercises, instructors) as the single source of truth", "numbers2"),
        numberedItem("Enable structured class programming with pre-built lesson plan templates", "numbers2"),
        numberedItem("Provide role-based access for admins and instructors with appropriate controls", "numbers2"),
        numberedItem("Support mobile access for instructors working on the gym floor", "numbers2"),
        numberedItem("Create a foundation that can scale to a second location within 18 months", "numbers2"),

        heading("2.4 Project Timeline", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2000, 3680, 2000, 1680],
          rows: [
            new TableRow({ children: [headerCell("Phase", 2000), headerCell("Activity", 3680), headerCell("Date", 2000), headerCell("Status", 1680)] }),
            new TableRow({ children: [dataCell("Phase 1", 2000), dataCell("Initial Stakeholder Meeting & UAT", 3680), dataCell("March 2026", 2000), dataCell("Complete", 1680, { color: "2E7D32", bold: true })] }),
            new TableRow({ children: [dataCell("Phase 2", 2000, { shading: ROW_ALT }), dataCell("Follow-up Meeting with Arden & Tyler", 3680, { shading: ROW_ALT }), dataCell("March 26, 2026", 2000, { shading: ROW_ALT }), dataCell("Complete", 1680, { shading: ROW_ALT, color: "2E7D32", bold: true })] }),
            new TableRow({ children: [dataCell("Phase 3", 2000), dataCell("Prototype Development (v2)", 3680), dataCell("Mar\u2013Apr 2026", 2000), dataCell("In Progress", 1680, { color: BRAND_ACCENT, bold: true })] }),
            new TableRow({ children: [dataCell("Phase 4", 2000, { shading: ROW_ALT }), dataCell("Follow-up Meeting \u2014 Demo & Elicitation", 3680, { shading: ROW_ALT }), dataCell("April 9, 2026", 2000, { shading: ROW_ALT }), dataCell("Today", 1680, { shading: ROW_ALT, color: "E65100", bold: true })] }),
            new TableRow({ children: [dataCell("Phase 5", 2000), dataCell("Iteration, Testing & Handoff", 3680), dataCell("Apr\u2013May 2026", 2000), dataCell("Upcoming", 1680, { color: "888888" })] }),
          ],
        }),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 3. STAKEHOLDER ANALYSIS
        // ══════════════════════════════════════════════════════════════════
        heading("3. Stakeholder Analysis"),

        heading("3.1 Stakeholder Register", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [1800, 1800, 2160, 1800, 1800],
          rows: [
            new TableRow({ children: [headerCell("Stakeholder", 1800), headerCell("Role", 1800), headerCell("Interest", 2160), headerCell("Influence", 1800), headerCell("Engagement", 1800)] }),
            new TableRow({ children: [dataCell("Arden Hamilton", 1800, { bold: true }), dataCell("Gym Manager / Owner", 1800), dataCell("Overall operations, growth strategy, member experience", 2160), dataCell("High", 1800, { color: "C62828", bold: true }), dataCell("Key Decision Maker", 1800)] }),
            new TableRow({ children: [dataCell("Tyler Krimmel", 1800, { shading: ROW_ALT, bold: true }), dataCell("Project Coordinator", 1800, { shading: ROW_ALT }), dataCell("Technical requirements, tool architecture, data model", 2160, { shading: ROW_ALT }), dataCell("High", 1800, { shading: ROW_ALT, color: "C62828", bold: true }), dataCell("Technical Lead", 1800, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Instructors (~12)", 1800, { bold: true }), dataCell("End Users", 1800), dataCell("Class scheduling, lesson plans, delivery logging", 2160), dataCell("Medium", 1800, { color: "E65100", bold: true }), dataCell("Primary Users", 1800)] }),
            new TableRow({ children: [dataCell("Members", 1800, { shading: ROW_ALT, bold: true }), dataCell("Indirect Beneficiaries", 1800, { shading: ROW_ALT }), dataCell("Class quality, consistency, progression", 2160, { shading: ROW_ALT }), dataCell("Low", 1800, { shading: ROW_ALT, color: "2E7D32" }), dataCell("Informed", 1800, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Team 4 (GBC)", 1800, { bold: true }), dataCell("Business Analysts / Dev", 1800), dataCell("Requirements, design, prototype delivery", 2160), dataCell("Medium", 1800, { color: "E65100", bold: true }), dataCell("Project Team", 1800)] }),
          ],
        }),

        heading("3.2 Key Findings from Stakeholder Consultations", HeadingLevel.HEADING_2),
        para("March 26, 2026 Meeting (66 minutes, with Arden and Tyler):", { bold: true }),
        bulletItem("Tyler joined approximately 25 minutes in and provided most of the technical requirements feedback"),
        bulletItem("Tyler described the tool as needing to become the gym\u2019s \u201Cmaster record / source of truth\u201D"),
        bulletItem("Confirmed that instructors currently do not pre-program classes \u2014 they fill out lesson plans on paper 10 minutes before class"),
        bulletItem("Classes are 100% in-person; no virtual/hybrid delivery"),
        bulletItem("Arden experienced intermittent connectivity issues (Mac + Microsoft Teams); Google Meet recommended for future meetings"),
        bulletItem("Tyler is open to Microsoft Access or similar as a next step after Excel validation"),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 4. SCOPE DEFINITION
        // ══════════════════════════════════════════════════════════════════
        heading("4. Scope Definition"),
        para("The engagement is organized into three distinct scope areas, each with its own deliverables and status:"),

        heading("4.1 Scope 1: User Acceptance Testing (UAT) \u2014 COMPLETE", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2800, 6560],
          rows: [
            new TableRow({ children: [headerCell("Metric", 2800), headerCell("Result", 6560)] }),
            new TableRow({ children: [dataCell("Total Links Tested", 2800, { bold: true }), dataCell("44 out of 384 clickable elements", 6560)] }),
            new TableRow({ children: [dataCell("Navigation Health", 2800, { shading: ROW_ALT, bold: true }), dataCell("82% (36 of 44 links correct)", 6560, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Bugs Found", 2800, { bold: true }), dataCell("8 total \u2014 2 Critical, 1 High, 3 Medium, 2 Low", 6560)] }),
            new TableRow({ children: [dataCell("Recommendations", 2800, { shading: ROW_ALT, bold: true }), dataCell("13 total recommendations provided", 6560, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Post-Report Fixes", 2800, { bold: true }), dataCell("Phone number bug and Book Now button already fixed by FIIT Co. team before March 26 meeting", 6560)] }),
          ],
        }),
        spacer(),
        para("Deliverables: UAT Report (PDF), Bug Log (Excel), Slide Deck (PPTX). All shared with Arden who confirmed review prior to the March 26 meeting."),

        heading("4.2 Scope 2: Class Management Tool \u2014 IN PROGRESS", HeadingLevel.HEADING_2),
        para("This is the primary deliverable and the focus of this report. The tool is a web-based application designed to centralize all class management operations.", { bold: true }),

        heading("4.2.1 Confirmed Class Categories", HeadingLevel.HEADING_3),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 2600, 3200, 2760],
          rows: [
            new TableRow({ children: [headerCell("#", 800), headerCell("Category", 2600), headerCell("Description", 3200), headerCell("Frequency", 2760)] }),
            new TableRow({ children: [dataCell("1", 800), dataCell("Strength & Conditioning", 2600, { bold: true }), dataCell("Upper Body, Lower Body + subcategories TBD", 3200), dataCell("~3\u20134 classes/week", 2760)] }),
            new TableRow({ children: [dataCell("2", 800, { shading: ROW_ALT }), dataCell("Boxing", 2600, { shading: ROW_ALT, bold: true }), dataCell("Traditional boxing technique and conditioning", 3200, { shading: ROW_ALT }), dataCell("Multiple/week", 2760, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("3", 800), dataCell("Hybrid", 2600, { bold: true }), dataCell("Half boxing bag + half full body conditioning", 3200), dataCell("~12 classes/week", 2760)] }),
            new TableRow({ children: [dataCell("4", 800, { shading: ROW_ALT }), dataCell("Pilates", 2600, { shading: ROW_ALT, bold: true }), dataCell("Core-focused reformer and mat work", 3200, { shading: ROW_ALT }), dataCell("Multiple/week", 2760, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("5", 800), dataCell("Yoga", 2600, { bold: true }), dataCell("Flexibility, mobility, and recovery", 3200), dataCell("Multiple/week", 2760)] }),
          ],
        }),

        heading("4.2.2 Key Business Rules", HeadingLevel.HEADING_3),
        bulletItem("10-Minute Buffer Rule: A minimum 10-minute gap must exist between classes. The tool must flag violations but allow admin override with acknowledgement."),
        bulletItem("Tier Assignment: Tiers (Beginner/Intermediate/Advanced) are assigned to classes, not members. Members self-select their tier."),
        bulletItem("File Sharing: Only date-stamped static copies are shared; no shared live file editing."),
        bulletItem("Category Cascade: When a category is renamed or deleted, changes must propagate to all dependent tables (classes, subcategories, exercises, schedule, delivery logs, pathways)."),
        bulletItem("Category Deletion: Dependent records are marked as \u201C(deleted)\u201D and deactivated rather than cascade-deleted, preserving historical data."),

        heading("4.3 Scope 3: Client Tracking \u2014 NEARLY FINAL", HeadingLevel.HEADING_2),
        para("Recommendation: Trainerize ($250/month) \u2014 meets all core requirements for body composition tracking, member check-ins, and progress dashboards."),
        para("Confirmed decisions:", { bold: true }),
        bulletItem("Water retention tracking = nice to have, not required"),
        bulletItem("Client-facing dashboard = nice to have; PDF/snapshot delivery acceptable"),
        bulletItem("InBody hardware already under consideration (prefer used/second-hand)"),
        bulletItem("Key metrics: all InBody outputs (weight, body fat, lean mass, BMI, measurements)"),
        bulletItem("Apple Health / third-party app integration = nice to have"),
        spacer(),
        para("Open questions remaining:", { bold: true, color: "C62828" }),
        bulletItem("Who conducts member check-ins (instructor vs. Arden)?"),
        bulletItem("Check-in frequency?"),
        bulletItem("Budget confirmation for Trainerize?"),
        bulletItem("Does Trainerize export to Apple Health / third-party apps?"),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 5. CURRENT STATE ANALYSIS
        // ══════════════════════════════════════════════════════════════════
        heading("5. Current State vs. Future State Analysis"),

        heading("5.1 Current State (As-Is)", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2200, 3580, 3580],
          rows: [
            new TableRow({ children: [headerCell("Process", 2200), headerCell("Current Method", 3580), headerCell("Pain Points", 3580)] }),
            new TableRow({ children: [dataCell("Class Scheduling", 2200, { bold: true }), dataCell("MindBody for public schedule; Google Calendar + screenshots for internal coordination", 3580), dataCell("No single view; manual screenshot communication; no conflict detection", 3580)] }),
            new TableRow({ children: [dataCell("Lesson Planning", 2200, { shading: ROW_ALT, bold: true }), dataCell("Paper-based, completed 10 minutes before class", 3580, { shading: ROW_ALT }), dataCell("No pre-programming; no standardization; no historical record", 3580, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Instructor Mgmt", 2200, { bold: true }), dataCell("Google Docs and verbal communication", 3580), dataCell("No centralized instructor profiles; availability tracked manually", 3580)] }),
            new TableRow({ children: [dataCell("Class Delivery", 2200, { shading: ROW_ALT, bold: true }), dataCell("No formal tracking", 3580, { shading: ROW_ALT }), dataCell("No record of what was actually taught; no attendance logging", 3580, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Exercise Library", 2200, { bold: true }), dataCell("None exists", 3580), dataCell("Exercises not catalogued; no equipment mapping", 3580)] }),
            new TableRow({ children: [dataCell("Member Pathways", 2200, { shading: ROW_ALT, bold: true }), dataCell("None exists", 3580, { shading: ROW_ALT }), dataCell("No structured progression; classes are standalone", 3580, { shading: ROW_ALT })] }),
          ],
        }),

        heading("5.2 Future State (To-Be)", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2200, 3580, 3580],
          rows: [
            new TableRow({ children: [headerCell("Process", 2200), headerCell("Future Method", 3580), headerCell("Benefits", 3580)] }),
            new TableRow({ children: [dataCell("Class Scheduling", 2200, { bold: true }), dataCell("Centralized weekly schedule with buffer violation detection and print-to-PDF", 3580), dataCell("Real-time view; automated conflict warnings; printable for posting", 3580)] }),
            new TableRow({ children: [dataCell("Lesson Planning", 2200, { shading: ROW_ALT, bold: true }), dataCell("Structured lesson plan builder with exercise library integration", 3580, { shading: ROW_ALT }), dataCell("Pre-programming enforced; standardized format; historical archive", 3580, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Instructor Mgmt", 2200, { bold: true }), dataCell("Centralized instructor profiles with availability, specializations, and certifications", 3580), dataCell("Self-service availability; conflict detection; sub management", 3580)] }),
            new TableRow({ children: [dataCell("Class Delivery", 2200, { shading: ROW_ALT, bold: true }), dataCell("Delivery log with planned vs. actual tracking", 3580, { shading: ROW_ALT }), dataCell("Accountability; attendance data; variation tracking; missing log alerts", 3580, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Exercise Library", 2200, { bold: true }), dataCell("Master exercise library with category, equipment, and description", 3580), dataCell("Reusable building blocks for lesson plans; equipment planning", 3580)] }),
            new TableRow({ children: [dataCell("Member Pathways", 2200, { shading: ROW_ALT, bold: true }), dataCell("Multi-week training pathways with progress tracking", 3580, { shading: ROW_ALT }), dataCell("Structured member journeys; retention improvement; goal tracking", 3580, { shading: ROW_ALT })] }),
          ],
        }),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 6. SYSTEM ARCHITECTURE
        // ══════════════════════════════════════════════════════════════════
        heading("6. System Architecture & Technology Stack"),

        heading("6.1 Architecture Overview", HeadingLevel.HEADING_2),
        para("The Class Management Tool is built as a modern web application with the following architecture:"),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2400, 2400, 4560],
          rows: [
            new TableRow({ children: [headerCell("Layer", 2400), headerCell("Technology", 2400), headerCell("Purpose", 4560)] }),
            new TableRow({ children: [dataCell("Frontend", 2400, { bold: true }), dataCell("Next.js 14 (App Router)", 2400), dataCell("React-based UI framework with server-side rendering and file-based routing", 4560)] }),
            new TableRow({ children: [dataCell("Database", 2400, { shading: ROW_ALT, bold: true }), dataCell("Convex (Real-time)", 2400, { shading: ROW_ALT }), dataCell("Real-time reactive database with automatic subscriptions; data updates instantly across all connected clients", 4560, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Styling", 2400, { bold: true }), dataCell("CSS Custom Properties", 2400), dataCell("Design system with CSS variables for consistent theming (--bg-app, --ui-dark, --text-main, etc.)", 4560)] }),
            new TableRow({ children: [dataCell("Typography", 2400, { shading: ROW_ALT, bold: true }), dataCell("Playfair Display + DM Sans", 2400, { shading: ROW_ALT }), dataCell("Serif headings for elegance; sans-serif body for readability", 4560, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Authentication", 2400, { bold: true }), dataCell("Database-backed (demo)", 2400), dataCell("Email/password with security questions for recovery; admin approval for new accounts", 4560)] }),
            new TableRow({ children: [dataCell("Hosting", 2400, { shading: ROW_ALT, bold: true }), dataCell("Local / Deployable", 2400, { shading: ROW_ALT }), dataCell("Currently running locally; can be deployed to Vercel (frontend) + Convex Cloud (database)", 4560, { shading: ROW_ALT })] }),
          ],
        }),

        heading("6.2 Design Decisions & Rationale", HeadingLevel.HEADING_2),
        multiRun([
          { text: "No traditional backend server required: ", bold: true },
          { text: "Convex provides both database and server-side logic (mutations/queries) in a single service, eliminating the need for a separate Express/Node.js backend. This reduces complexity, cost, and maintenance burden \u2014 critical for a small gym that won\u2019t have dedicated IT staff." },
        ]),
        multiRun([
          { text: "Real-time data: ", bold: true },
          { text: "Convex\u2019s reactive subscriptions mean that when an admin updates the schedule, all connected clients (including instructors on their phones) see the change instantly without refreshing." },
        ]),
        multiRun([
          { text: "Self-service administration: ", bold: true },
          { text: "The Manage Users page allows admins to approve new signups, change roles, and reset passwords without developer intervention \u2014 essential since the development team is outsourced." },
        ]),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 7. DATA MODEL
        // ══════════════════════════════════════════════════════════════════
        heading("7. Data Model & Entity Definitions"),
        para("The system uses 16 interconnected tables organized into a \u201CSource of Truth\u201D architecture where every entity pulls from its own master library. This was a key requirement from Tyler (March 26 meeting)."),

        heading("7.1 Entity Relationship Summary", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2000, 1600, 2400, 3360],
          rows: [
            new TableRow({ children: [headerCell("Table", 2000), headerCell("Records", 1600), headerCell("Key Fields", 2400), headerCell("Relationships", 3360)] }),
            new TableRow({ children: [dataCell("categories", 2000, { bold: true }), dataCell("5 (seed)", 1600), dataCell("categoryId, name, colorCode", 2400), dataCell("Parent of: subcategories, classes, exercises, schedule, deliveryLog, pathways", 3360)] }),
            new TableRow({ children: [dataCell("subcategories", 2000, { shading: ROW_ALT, bold: true }), dataCell("5+ (seed)", 1600, { shading: ROW_ALT }), dataCell("subcategoryId, categoryId, name", 2400, { shading: ROW_ALT }), dataCell("Belongs to: categories", 3360, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("classes", 2000, { bold: true }), dataCell("8 (seed)", 1600), dataCell("classId, categoryId, name, tier", 2400), dataCell("Belongs to: categories; Referenced by: schedule, programs, journeys", 3360)] }),
            new TableRow({ children: [dataCell("instructors", 2000, { shading: ROW_ALT, bold: true }), dataCell("5 (seed)", 1600, { shading: ROW_ALT }), dataCell("instructorId, fullName, specialisations", 2400, { shading: ROW_ALT }), dataCell("Referenced by: schedule, programs, deliveryLog, availability, users", 3360, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("weeklySchedule", 2000, { bold: true }), dataCell("Dynamic", 1600), dataCell("date, startTime, endTime, classId, instructorId", 2400), dataCell("References: classes, instructors, categories", 3360)] }),
            new TableRow({ children: [dataCell("classPrograms", 2000, { shading: ROW_ALT, bold: true }), dataCell("Dynamic", 1600, { shading: ROW_ALT }), dataCell("classId, instructorId, blocks[], status", 2400, { shading: ROW_ALT }), dataCell("References: classes, instructors; Contains: exercise blocks", 3360, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("deliveryLog", 2000, { bold: true }), dataCell("Dynamic", 1600), dataCell("date, classId, attendance, programFollowed", 2400), dataCell("References: classes, instructors, categories", 3360)] }),
            new TableRow({ children: [dataCell("exercises", 2000, { shading: ROW_ALT, bold: true }), dataCell("12+ (seed)", 1600, { shading: ROW_ALT }), dataCell("exerciseId, name, category, equipment[]", 2400, { shading: ROW_ALT }), dataCell("References: categories; Used by: classPrograms", 3360, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("equipment", 2000, { bold: true }), dataCell("12 (seed)", 1600), dataCell("equipmentId, name, quantityAvailable", 2400), dataCell("Referenced by: exercises", 3360)] }),
            new TableRow({ children: [dataCell("pathways", 2000, { shading: ROW_ALT, bold: true }), dataCell("4+ (seed)", 1600, { shading: ROW_ALT }), dataCell("pathwayId, title, category, durationWeeks", 2400, { shading: ROW_ALT }), dataCell("References: categories; Referenced by: clientJourneys", 3360, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("clientJourneys", 2000, { bold: true }), dataCell("Dynamic", 1600), dataCell("journeyId, title, goalType, weeks[]", 2400), dataCell("References: pathways, classes", 3360)] }),
            new TableRow({ children: [dataCell("availability", 2000, { shading: ROW_ALT, bold: true }), dataCell("Dynamic", 1600, { shading: ROW_ALT }), dataCell("instructorId, dayOfWeek, startTime, endTime", 2400, { shading: ROW_ALT }), dataCell("References: instructors", 3360, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("tiers", 2000, { bold: true }), dataCell("3 (seed)", 1600), dataCell("tierId, name, description", 2400), dataCell("Referenced by: classes", 3360)] }),
            new TableRow({ children: [dataCell("pendingChanges", 2000, { shading: ROW_ALT, bold: true }), dataCell("Dynamic", 1600, { shading: ROW_ALT }), dataCell("tableName, action, payload, status", 2400, { shading: ROW_ALT }), dataCell("RBAC workflow table \u2014 stores instructor submissions", 3360, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("users", 2000, { bold: true }), dataCell("6 (seed)", 1600), dataCell("email, role, status, instructorId", 2400), dataCell("References: instructors; Authentication & authorization", 3360)] }),
          ],
        }),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 8. FUNCTIONAL REQUIREMENTS
        // ══════════════════════════════════════════════════════════════════
        heading("8. Functional Requirements"),

        heading("8.1 Authentication & User Management", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 4280, 2280, 2000],
          rows: [
            new TableRow({ children: [headerCell("ID", 800), headerCell("Requirement", 4280), headerCell("Priority", 2280), headerCell("Status", 2000)] }),
            new TableRow({ children: [dataCell("FR-01", 800), dataCell("System shall support email/password login with @fiitco.ca domain validation", 4280), dataCell("Must Have", 2280, { color: "C62828", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-02", 800, { shading: ROW_ALT }), dataCell("New user signups require admin approval before account activation", 4280, { shading: ROW_ALT }), dataCell("Must Have", 2280, { shading: ROW_ALT, color: "C62828", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-03", 800), dataCell("Password reset via security question; admin fallback reset available", 4280), dataCell("Must Have", 2280, { color: "C62828", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-04", 800, { shading: ROW_ALT }), dataCell("Admin can approve/reject signups, toggle roles, deactivate/reactivate users", 4280, { shading: ROW_ALT }), dataCell("Must Have", 2280, { shading: ROW_ALT, color: "C62828", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-05", 800), dataCell("Self-service signup creates instructor record automatically (INS-XX ID)", 4280), dataCell("Should Have", 2280, { color: "E65100", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
          ],
        }),

        heading("8.2 Role-Based Access Control (RBAC)", HeadingLevel.HEADING_2),
        para("The system implements a two-tier RBAC model to balance operational efficiency with data integrity:"),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2000, 3680, 3680],
          rows: [
            new TableRow({ children: [headerCell("Action", 2000), headerCell("Admin", 3680), headerCell("Instructor", 3680)] }),
            new TableRow({ children: [dataCell("Add / Edit / Delete", 2000, { bold: true }), dataCell("Direct execution \u2014 changes take effect immediately", 3680), dataCell("Submitted as pending change \u2014 requires admin approval", 3680)] }),
            new TableRow({ children: [dataCell("View Data", 2000, { shading: ROW_ALT, bold: true }), dataCell("Full access to all pages and data", 3680, { shading: ROW_ALT }), dataCell("Full read access to all pages and data", 3680, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Review Queue", 2000, { bold: true }), dataCell("Can approve or deny pending changes with notes", 3680), dataCell("Can view status of own submissions", 3680)] }),
            new TableRow({ children: [dataCell("Manage Users", 2000, { shading: ROW_ALT, bold: true }), dataCell("Full access \u2014 approve signups, change roles, reset passwords", 3680, { shading: ROW_ALT }), dataCell("No access", 3680, { shading: ROW_ALT })] }),
          ],
        }),

        heading("8.3 Scheduling & Operations", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 4280, 2280, 2000],
          rows: [
            new TableRow({ children: [headerCell("ID", 800), headerCell("Requirement", 4280), headerCell("Priority", 2280), headerCell("Status", 2000)] }),
            new TableRow({ children: [dataCell("FR-10", 800), dataCell("Weekly schedule with day/time grid view, class details, and instructor assignment", 4280), dataCell("Must Have", 2280, { color: "C62828", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-11", 800, { shading: ROW_ALT }), dataCell("10-minute buffer violation detection with visual warning and admin override", 4280, { shading: ROW_ALT }), dataCell("Must Have", 2280, { shading: ROW_ALT, color: "C62828", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-12", 800), dataCell("Availability conflict warnings when scheduling instructors outside their available hours", 4280), dataCell("Should Have", 2280, { color: "E65100", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-13", 800, { shading: ROW_ALT }), dataCell("Print-to-PDF schedule generation for posting in the gym", 4280, { shading: ROW_ALT }), dataCell("Should Have", 2280, { shading: ROW_ALT, color: "E65100", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-14", 800), dataCell("Delivery log tracking with planned vs. actual comparison and attendance recording", 4280), dataCell("Must Have", 2280, { color: "C62828", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-15", 800, { shading: ROW_ALT }), dataCell("Missing delivery log detection and dashboard alerts", 4280, { shading: ROW_ALT }), dataCell("Should Have", 2280, { shading: ROW_ALT, color: "E65100", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-16", 800), dataCell("Lesson plan builder with exercise blocks, duration, equipment, and instructions", 4280), dataCell("Must Have", 2280, { color: "C62828", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
          ],
        }),

        heading("8.4 Master Libraries", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 4280, 2280, 2000],
          rows: [
            new TableRow({ children: [headerCell("ID", 800), headerCell("Requirement", 4280), headerCell("Priority", 2280), headerCell("Status", 2000)] }),
            new TableRow({ children: [dataCell("FR-20", 800), dataCell("Category Library with full CRUD; cascade name changes to all dependent tables", 4280), dataCell("Must Have", 2280, { color: "C62828", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-21", 800, { shading: ROW_ALT }), dataCell("Class Library with category linking, tier assignment, and duration", 4280, { shading: ROW_ALT }), dataCell("Must Have", 2280, { shading: ROW_ALT, color: "C62828", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-22", 800), dataCell("Exercise Library with equipment mapping and category filtering", 4280), dataCell("Must Have", 2280, { color: "C62828", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-23", 800, { shading: ROW_ALT }), dataCell("Instructor Library with specializations, certifications, and availability", 4280, { shading: ROW_ALT }), dataCell("Must Have", 2280, { shading: ROW_ALT, color: "C62828", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-24", 800), dataCell("Equipment inventory with quantity tracking and location", 4280), dataCell("Should Have", 2280, { color: "E65100", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-25", 800, { shading: ROW_ALT }), dataCell("Training Pathways with multi-week structure and progress tracking", 4280, { shading: ROW_ALT }), dataCell("Should Have", 2280, { shading: ROW_ALT, color: "E65100", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-26", 800), dataCell("Client Journey CRUD with dynamic week builder and pathway linkage", 4280), dataCell("Should Have", 2280, { color: "E65100", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
          ],
        }),

        heading("8.5 Dashboard & Reporting", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 4280, 2280, 2000],
          rows: [
            new TableRow({ children: [headerCell("ID", 800), headerCell("Requirement", 4280), headerCell("Priority", 2280), headerCell("Status", 2000)] }),
            new TableRow({ children: [dataCell("FR-30", 800), dataCell("Dashboard with KPIs: classes today, this week, active instructors, class library size, equipment count", 4280), dataCell("Must Have", 2280, { color: "C62828", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-31", 800, { shading: ROW_ALT }), dataCell("Real-time schedule view with Today/Tomorrow/Week filter", 4280, { shading: ROW_ALT }), dataCell("Must Have", 2280, { shading: ROW_ALT, color: "C62828", bold: true }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-32", 800), dataCell("Action Required panel with pending reviews, missing logs, buffer violations", 4280), dataCell("Should Have", 2280, { color: "E65100", bold: true }), dataCell("Implemented", 2000, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("FR-33", 800, { shading: ROW_ALT }), dataCell("Weekly activity bar chart and class category breakdown", 4280, { shading: ROW_ALT }), dataCell("Nice to Have", 2280, { shading: ROW_ALT, color: "2E7D32" }), dataCell("Implemented", 2000, { shading: ROW_ALT, color: "2E7D32" })] }),
          ],
        }),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 9. NON-FUNCTIONAL REQUIREMENTS
        // ══════════════════════════════════════════════════════════════════
        heading("9. Non-Functional Requirements"),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [800, 2000, 4280, 2280],
          rows: [
            new TableRow({ children: [headerCell("ID", 800), headerCell("Category", 2000), headerCell("Requirement", 4280), headerCell("Status", 2280)] }),
            new TableRow({ children: [dataCell("NFR-01", 800), dataCell("Responsiveness", 2000, { bold: true }), dataCell("Application must be fully functional on mobile devices (375px+) for instructor floor use", 4280), dataCell("Implemented", 2280, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("NFR-02", 800, { shading: ROW_ALT }), dataCell("Performance", 2000, { shading: ROW_ALT, bold: true }), dataCell("Real-time data updates must reflect across all connected clients within 1 second", 4280, { shading: ROW_ALT }), dataCell("Implemented", 2280, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("NFR-03", 800), dataCell("Usability", 2000, { bold: true }), dataCell("Instructors with minimal technical experience must be able to navigate and use the tool without training", 4280), dataCell("In Testing", 2280, { color: BRAND_ACCENT })] }),
            new TableRow({ children: [dataCell("NFR-04", 800, { shading: ROW_ALT }), dataCell("Scalability", 2000, { shading: ROW_ALT, bold: true }), dataCell("Architecture must support expansion to a second location within 18 months", 4280, { shading: ROW_ALT }), dataCell("Designed For", 2280, { shading: ROW_ALT, color: BRAND_ACCENT })] }),
            new TableRow({ children: [dataCell("NFR-05", 800), dataCell("Maintainability", 2000, { bold: true }), dataCell("Admin must be able to manage users, reset passwords, and seed data without developer intervention", 4280), dataCell("Implemented", 2280, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("NFR-06", 800, { shading: ROW_ALT }), dataCell("Availability", 2000, { shading: ROW_ALT, bold: true }), dataCell("System should be accessible from any device with a modern web browser", 4280, { shading: ROW_ALT }), dataCell("Implemented", 2280, { shading: ROW_ALT, color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("NFR-07", 800), dataCell("Data Integrity", 2000, { bold: true }), dataCell("Category cascade must propagate changes to all 6 dependent tables atomically", 4280), dataCell("Implemented", 2280, { color: "2E7D32" })] }),
            new TableRow({ children: [dataCell("NFR-08", 800, { shading: ROW_ALT }), dataCell("Printability", 2000, { shading: ROW_ALT, bold: true }), dataCell("Weekly schedule must be printable as a clean PDF for posting in the gym", 4280, { shading: ROW_ALT }), dataCell("Implemented", 2280, { shading: ROW_ALT, color: "2E7D32" })] }),
          ],
        }),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 10. APPLICATION PAGES & FEATURES
        // ══════════════════════════════════════════════════════════════════
        heading("10. Application Pages & Feature Inventory"),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2400, 4560, 2400],
          rows: [
            new TableRow({ children: [headerCell("Page", 2400), headerCell("Features", 4560), headerCell("Access", 2400)] }),
            new TableRow({ children: [dataCell("Login", 2400, { bold: true }), dataCell("Email/password auth, signup form, forgot password (3-step), @fiitco.ca validation", 4560), dataCell("Public", 2400)] }),
            new TableRow({ children: [dataCell("Dashboard", 2400, { shading: ROW_ALT, bold: true }), dataCell("KPIs, live clock, schedule preview, action required panel, system flags, quick access links, weekly bar chart, class mix breakdown", 4560, { shading: ROW_ALT }), dataCell("All Users", 2400, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Weekly Schedule", 2400, { bold: true }), dataCell("7-day grid, add/edit/delete slots, buffer violation flags, availability conflict warnings, print-to-PDF", 4560), dataCell("All (RBAC)", 2400)] }),
            new TableRow({ children: [dataCell("Class Library", 2400, { shading: ROW_ALT, bold: true }), dataCell("CRUD with category/tier/duration, search and filter, category cascade", 4560, { shading: ROW_ALT }), dataCell("All (RBAC)", 2400, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Exercise Library", 2400, { bold: true }), dataCell("CRUD with equipment mapping, category filter, search", 4560), dataCell("All (RBAC)", 2400)] }),
            new TableRow({ children: [dataCell("Category Library", 2400, { shading: ROW_ALT, bold: true }), dataCell("CRUD with cascade propagation to 6 dependent tables, color coding, emoji icons", 4560, { shading: ROW_ALT }), dataCell("All (RBAC)", 2400, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Instructor Library", 2400, { bold: true }), dataCell("Profiles with specializations, certifications, contact info, status", 4560), dataCell("All (RBAC)", 2400)] }),
            new TableRow({ children: [dataCell("Availability & Subs", 2400, { shading: ROW_ALT, bold: true }), dataCell("Instructor availability blocks by day/time, sub management", 4560, { shading: ROW_ALT }), dataCell("All (RBAC)", 2400, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Lesson Plans", 2400, { bold: true }), dataCell("Structured block builder with exercise selection, duration, equipment, instructions", 4560), dataCell("All (RBAC)", 2400)] }),
            new TableRow({ children: [dataCell("Delivery Logs", 2400, { shading: ROW_ALT, bold: true }), dataCell("Log class delivery with attendance, plan compliance, variations. Missing logs tab with pre-fill", 4560, { shading: ROW_ALT }), dataCell("All (RBAC)", 2400, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Equipment", 2400, { bold: true }), dataCell("Inventory tracking with quantity, location, and notes", 4560), dataCell("All (RBAC)", 2400)] }),
            new TableRow({ children: [dataCell("Training Pathways", 2400, { shading: ROW_ALT, bold: true }), dataCell("Multi-week pathway builder with progress tracking bars", 4560, { shading: ROW_ALT }), dataCell("All (RBAC)", 2400, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("Client Journey", 2400, { bold: true }), dataCell("Dynamic week builder, goal types, pathway linkage, class selection per week", 4560), dataCell("All (RBAC)", 2400)] }),
            new TableRow({ children: [dataCell("Review Queue", 2400, { shading: ROW_ALT, bold: true }), dataCell("Pending/Approved/Denied tabs, approve/deny with notes, payload preview", 4560, { shading: ROW_ALT }), dataCell("Admin only", 2400, { shading: ROW_ALT, color: "C62828", bold: true })] }),
            new TableRow({ children: [dataCell("Manage Users", 2400, { bold: true }), dataCell("Approve signups, role toggle, deactivate/reactivate, password reset", 4560), dataCell("Admin only", 2400, { color: "C62828", bold: true })] }),
          ],
        }),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 11. RISK ASSESSMENT
        // ══════════════════════════════════════════════════════════════════
        heading("11. Risk Assessment"),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [600, 2200, 1200, 1200, 4160],
          rows: [
            new TableRow({ children: [headerCell("#", 600), headerCell("Risk", 2200), headerCell("Likelihood", 1200), headerCell("Impact", 1200), headerCell("Mitigation", 4160)] }),
            new TableRow({ children: [dataCell("R1", 600), dataCell("Low instructor adoption", 2200, { bold: true }), dataCell("Medium", 1200, { color: "E65100" }), dataCell("High", 1200, { color: "C62828" }), dataCell("Mobile-first design for floor use; simple UI; instructor onboarding session planned", 4160)] }),
            new TableRow({ children: [dataCell("R2", 600, { shading: ROW_ALT }), dataCell("No dedicated IT staff post-handoff", 2200, { shading: ROW_ALT, bold: true }), dataCell("High", 1200, { shading: ROW_ALT, color: "C62828" }), dataCell("High", 1200, { shading: ROW_ALT, color: "C62828" }), dataCell("Self-service admin tools (Manage Users, data seeding); comprehensive documentation; no backend server to maintain", 4160, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("R3", 600), dataCell("MindBody integration gap", 2200, { bold: true }), dataCell("Medium", 1200, { color: "E65100" }), dataCell("Medium", 1200, { color: "E65100" }), dataCell("Tool designed as complementary (not replacement) to MindBody; manual sync acceptable for V1", 4160)] }),
            new TableRow({ children: [dataCell("R4", 600, { shading: ROW_ALT }), dataCell("Data loss from demo-grade auth", 2200, { shading: ROW_ALT, bold: true }), dataCell("Low", 1200, { shading: ROW_ALT, color: "2E7D32" }), dataCell("Medium", 1200, { shading: ROW_ALT, color: "E65100" }), dataCell("Base64 encoding is demo-only; production deployment would use proper hashing (bcrypt); internal tool with trusted users", 4160, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("R5", 600), dataCell("Scope creep into website redesign", 2200, { bold: true }), dataCell("Medium", 1200, { color: "E65100" }), dataCell("Low", 1200, { color: "2E7D32" }), dataCell("Website redesign acknowledged as separate scope; documented in meeting notes for future engagement", 4160)] }),
            new TableRow({ children: [dataCell("R6", 600, { shading: ROW_ALT }), dataCell("Category cascade data corruption", 2200, { shading: ROW_ALT, bold: true }), dataCell("Low", 1200, { shading: ROW_ALT, color: "2E7D32" }), dataCell("High", 1200, { shading: ROW_ALT, color: "C62828" }), dataCell("Cascade uses deactivation + marking rather than hard delete; preserves all historical data; admin-only operation", 4160, { shading: ROW_ALT })] }),
          ],
        }),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 12. RECOMMENDATIONS & NEXT STEPS
        // ══════════════════════════════════════════════════════════════════
        heading("12. Recommendations & Next Steps"),

        heading("12.1 Immediate Actions (April 2026)", HeadingLevel.HEADING_2),
        numberedItem("Complete stakeholder demo (April 9, 2026) \u2014 walk through all 15 pages with Arden and Tyler", "numbers3"),
        numberedItem("Gather feedback on RBAC workflow \u2014 confirm that the pending review process meets operational needs", "numbers3"),
        numberedItem("Resolve open Scope 3 questions \u2014 check-in frequency, budget confirmation for Trainerize", "numbers3"),
        numberedItem("Deploy to production \u2014 move from local development to Vercel (frontend) + Convex Cloud (database) for team access", "numbers3"),

        heading("12.2 Short-Term Enhancements (V2 \u2014 May\u2013June 2026)", HeadingLevel.HEADING_2),
        numberedItem("Instructor self-service \u2014 instructors log in and build their own class plans directly (confirmed as future V2 requirement by Tyler)", "numbers4"),
        numberedItem("MindBody data sync \u2014 explore API integration to pull live schedule data automatically", "numbers4"),
        numberedItem("Notification system \u2014 email or in-app alerts for pending reviews, upcoming classes, and missing logs", "numbers4"),
        numberedItem("Reporting dashboard \u2014 attendance trends, instructor workload, class utilization rates", "numbers4"),
        numberedItem("Production-grade authentication \u2014 replace base64 with bcrypt; consider OAuth/SSO integration", "numbers4"),

        heading("12.3 Long-Term Roadmap (2027+)", HeadingLevel.HEADING_2),
        numberedItem("Multi-location support \u2014 architecture already supports expansion; add location field to schedule, instructors, and equipment", "numbers5"),
        numberedItem("Client-facing portal \u2014 member progress dashboards, pathway enrollment, feedback submission", "numbers5"),
        numberedItem("InBody integration \u2014 body composition data import for client tracking (Scope 3)", "numbers5"),
        numberedItem("Mobile app \u2014 progressive web app (PWA) or native app for instructor and member use", "numbers5"),
        numberedItem("Database migration \u2014 evaluate migration to Microsoft Access or PostgreSQL as data volume grows (Tyler expressed interest in Access)", "numbers5"),
        pageBreak(),

        // ══════════════════════════════════════════════════════════════════
        // 13. APPENDIX
        // ══════════════════════════════════════════════════════════════════
        heading("13. Appendices"),

        heading("13.1 Appendix A: Login Credentials (Demo Environment)", HeadingLevel.HEADING_2),
        para("All seed accounts use the default password: fiitco2024", { bold: true }),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [2600, 2600, 1560, 2600],
          rows: [
            new TableRow({ children: [headerCell("Email", 2600), headerCell("Name", 2600), headerCell("Role", 1560), headerCell("Instructor ID", 2600)] }),
            new TableRow({ children: [dataCell("arden@fiitco.ca", 2600), dataCell("Arden Hamilton", 2600), dataCell("Admin", 1560, { color: "C62828", bold: true }), dataCell("N/A", 2600)] }),
            new TableRow({ children: [dataCell("jason@fiitco.ca", 2600, { shading: ROW_ALT }), dataCell("Jason Villanueva", 2600, { shading: ROW_ALT }), dataCell("Instructor", 1560, { shading: ROW_ALT, color: BRAND_ACCENT, bold: true }), dataCell("INS-01", 2600, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("maya@fiitco.ca", 2600), dataCell("Maya Rodriguez", 2600), dataCell("Instructor", 1560, { color: BRAND_ACCENT, bold: true }), dataCell("INS-02", 2600)] }),
            new TableRow({ children: [dataCell("diego@fiitco.ca", 2600, { shading: ROW_ALT }), dataCell("Diego Fernandez", 2600, { shading: ROW_ALT }), dataCell("Instructor", 1560, { shading: ROW_ALT, color: BRAND_ACCENT, bold: true }), dataCell("INS-03", 2600, { shading: ROW_ALT })] }),
            new TableRow({ children: [dataCell("priya@fiitco.ca", 2600), dataCell("Priya Kapoor", 2600), dataCell("Instructor", 1560, { color: BRAND_ACCENT, bold: true }), dataCell("INS-04", 2600)] }),
            new TableRow({ children: [dataCell("marcus@fiitco.ca", 2600, { shading: ROW_ALT }), dataCell("Marcus Thompson", 2600, { shading: ROW_ALT }), dataCell("Instructor", 1560, { shading: ROW_ALT, color: BRAND_ACCENT, bold: true }), dataCell("INS-05", 2600, { shading: ROW_ALT })] }),
          ],
        }),

        heading("13.2 Appendix B: GitHub Repository", HeadingLevel.HEADING_2),
        para("Source code is hosted at:"),
        new Paragraph({
          children: [new ExternalHyperlink({
            children: [new TextRun({ text: "https://github.com/ezieshie-stack/Fiitco-Operation", style: "Hyperlink", font: "Arial", size: 22 })],
            link: "https://github.com/ezieshie-stack/Fiitco-Operation",
          })],
        }),
        spacer(),
        para("To run locally:", { bold: true }),
        bulletItem("git clone https://github.com/ezieshie-stack/Fiitco-Operation.git"),
        bulletItem("cd Fiitco-Operation && npm install"),
        bulletItem("npx convex dev (starts database)"),
        bulletItem("npm run dev (starts frontend on http://localhost:3000)"),

        heading("13.3 Appendix C: Open Elicitation Questions", HeadingLevel.HEADING_2),
        para("The following questions remain open and should be addressed in upcoming stakeholder sessions:"),
        numberedItem("MindBody Integration: Does FIIT Co. have API access to MindBody? Would they want automatic schedule sync?"),
        numberedItem("Member Data: What member data is currently collected? How is it stored? Any privacy/consent considerations?"),
        numberedItem("Check-in Process: Who conducts member body composition check-ins? What is the target frequency?"),
        numberedItem("Budget: Is $250/month for Trainerize within the approved budget?"),
        numberedItem("Handoff Plan: Who will maintain the tool after the co-op engagement ends? Is training needed?"),
        numberedItem("Website Redesign: Is the new website a separate project or should it integrate with the class management tool?"),
        numberedItem("Second Location: What is the timeline for the second location? Should the tool support multi-location from day one?"),

        heading("13.4 Appendix D: Document Revision History", HeadingLevel.HEADING_2),
        new Table({
          width: { size: TABLE_WIDTH, type: WidthType.DXA },
          columnWidths: [1400, 1400, 2400, 4160],
          rows: [
            new TableRow({ children: [headerCell("Version", 1400), headerCell("Date", 1400), headerCell("Author", 2400), headerCell("Changes", 4160)] }),
            new TableRow({ children: [dataCell("1.0", 1400), dataCell("Mar 26, 2026", 1400), dataCell("Team 4", 2400), dataCell("Initial draft based on March 26 stakeholder meeting", 4160)] }),
            new TableRow({ children: [dataCell("2.0", 1400, { shading: ROW_ALT }), dataCell("Apr 9, 2026", 1400, { shading: ROW_ALT }), dataCell("Team 4", 2400, { shading: ROW_ALT }), dataCell("Complete rewrite with full prototype documentation, RBAC, data model, functional requirements, mobile responsiveness, and risk assessment", 4160, { shading: ROW_ALT })] }),
          ],
        }),
        spacer(),
        spacer(),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: BRAND_WARM, space: 8 } },
          spacing: { before: 400 },
          children: [new TextRun({ text: "End of Document", font: "Arial", size: 20, italics: true, color: "888888" })],
        }),
      ],
    },
  ],
});

// ── Write file ──
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/Users/davidezieshi/fiit-ops/FIIT_Co_Class_Management_Tool_BA_Report.docx", buffer);
  console.log("BA Report generated successfully!");
});
