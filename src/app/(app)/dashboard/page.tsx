"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

// ── helpers ────────────────────────────────────────────────────────────────
function todayISO() { return new Date().toISOString().split("T")[0]; }
function tomorrowISO() { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split("T")[0]; }

function getWeekDates(): string[] {
  const anchor = new Date();
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday); d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatLongDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatShortDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { weekday: "short" });
}

function formatMonthDay(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function timeToMins(t: string) { const [h, m] = t.split(":").map(Number); return h * 60 + m; }

const CAT_TAG: Record<string, { bg: string; color: string }> = {
  "Strength & Conditioning": { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  Boxing:                    { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
  Hybrid:                    { bg: "var(--tag-purple-bg)", color: "var(--tag-purple-txt)" },
  Pilates:                   { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
  Yoga:                      { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
};

const AVATAR_COLORS = ["#4A7FD4", "#D16250", "#8E62CD", "#66B685", "#D89F3C"];
const initials = (name: string) => name.split(" ").map(n => n[0]).join("");

type ViewFilter = "today" | "tomorrow" | "week";

// ── Sub-components ─────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color, href }: {
  label: string; value: number | string; sub: string; color: string; href: string;
}) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div
        style={{
          background: "var(--bg-panel)", borderRadius: "var(--radius-card)",
          padding: "22px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          cursor: "pointer", transition: "all 0.15s", border: "1px solid transparent",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 6px 24px rgba(0,0,0,0.09)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,0,0,0.07)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 2px 12px rgba(0,0,0,0.04)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "transparent";
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--text-muted)", marginBottom: 10 }}>{label}</p>
        <p style={{ fontSize: 38, fontWeight: 600, color, lineHeight: 1, marginBottom: 6 }}>{value}</p>
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{sub}</p>
      </div>
    </Link>
  );
}

function WeekBar({ dates, slotsByDate }: { dates: string[]; slotsByDate: Record<string, unknown[]> }) {
  const today = todayISO();
  const max = Math.max(...dates.map(d => slotsByDate[d]?.length ?? 0), 1);
  return (
    <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 16 }}>This Week</p>
      <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
        {dates.map((date) => {
          const count = slotsByDate[date]?.length ?? 0;
          const isToday = date === today;
          const height = count === 0 ? 4 : Math.max(12, Math.round((count / max) * 52));
          return (
            <div key={date} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: isToday ? "var(--ui-dark)" : "var(--text-muted)", textTransform: "uppercase" }}>{count > 0 ? count : ""}</p>
              <div style={{
                width: "100%", height, borderRadius: 6,
                background: isToday ? "var(--ui-dark)" : count === 0 ? "var(--bg-beige)" : "var(--tag-blue-bg)",
                transition: "height 0.3s ease",
              }} />
              <p style={{ fontSize: 10, fontWeight: isToday ? 700 : 400, color: isToday ? "var(--ui-dark)" : "var(--text-muted)" }}>{formatShortDay(date)}</p>
              <p style={{ fontSize: 9, color: "var(--text-muted)" }}>{formatMonthDay(date)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function CategoryBreakdown({ classes }: { classes: { categoryName: string }[] }) {
  const counts: Record<string, number> = {};
  for (const c of classes) counts[c.categoryName] = (counts[c.categoryName] ?? 0) + 1;
  const total = classes.length || 1;
  const order = ["Boxing", "Strength & Conditioning", "Hybrid", "Pilates", "Yoga"];
  return (
    <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
      <p style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 16 }}>Class Mix</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {order.map((cat) => {
          const count = counts[cat] ?? 0;
          const pct = Math.round((count / total) * 100);
          const tag = CAT_TAG[cat] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
          return (
            <div key={cat}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-main)" }}>{cat}</span>
                <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{count} class{count !== 1 ? "es" : ""}</span>
              </div>
              <div style={{ height: 6, background: "var(--bg-beige)", borderRadius: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${pct}%`, background: tag.color, borderRadius: 6, transition: "width 0.5s ease" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { currentUser } = useAuth();
  const classes         = useQuery(api.queries.getClasses)          ?? [];
  const instructors     = useQuery(api.queries.getInstructors)      ?? [];
  const categories      = useQuery(api.queries.getCategories)       ?? [];
  const allSlots        = useQuery(api.queries.getWeeklySchedule)   ?? [];
  const classPrograms   = useQuery(api.queries.getClassPrograms)    ?? [];
  const equipment       = useQuery(api.queries.getEquipment)        ?? [];
  const pathways        = useQuery(api.queries.getPathways)         ?? [];
  const exercises       = useQuery(api.queries.getExercises)        ?? [];
  const pendingChanges  = useQuery(api.queries.getPendingChanges, { status: "pending" }) ?? [];
  const missingLogs     = useQuery(api.queries.getMissingDeliveryLogs) ?? [];

  const [view, setView]       = useState<ViewFilter>("today");
  const [clock, setClock]     = useState("");

  // Live clock
  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  const today     = todayISO();
  const tomorrow  = tomorrowISO();
  const weekDates = useMemo(() => getWeekDates(), []);

  // Slots grouped by date
  const slotsByDate = useMemo(() => {
    const map: Record<string, typeof allSlots> = {};
    for (const d of weekDates) map[d] = [];
    for (const s of allSlots) { if (map[s.date]) map[s.date].push(s); }
    for (const d of weekDates) map[d].sort((a, b) => timeToMins(a.startTime) - timeToMins(b.startTime));
    return map;
  }, [allSlots, weekDates]);

  // Slots for current view
  const viewSlots = useMemo(() => {
    if (view === "today")    return slotsByDate[today]    ?? [];
    if (view === "tomorrow") return slotsByDate[tomorrow] ?? [];
    return weekDates.flatMap(d => slotsByDate[d] ?? []).sort((a, b) =>
      a.date !== b.date ? a.date.localeCompare(b.date) : timeToMins(a.startTime) - timeToMins(b.startTime)
    );
  }, [view, slotsByDate, today, tomorrow, weekDates]);

  const weekTotal       = weekDates.reduce((s, d) => s + (slotsByDate[d]?.length ?? 0), 0);
  const pendingPlans    = classPrograms.filter(p => p.status === "Submitted").length;
  const violations      = allSlots.filter(s => s.bufferViolation && !s.bufferOverrideAcknowledged).length;
  const pendingReviews  = pendingChanges.length;
  // For instructors: only their own submissions
  const myPending       = pendingChanges.filter(c => c.submittedBy === currentUser?.id).length;
  const todayCapacity = (slotsByDate[today] ?? []).reduce((s, sl) => s + sl.capacity, 0);

  // Active instructors today
  const todayInstructors = useMemo(() => {
    const ids = new Set((slotsByDate[today] ?? []).map(s => s.instructorId));
    return instructors.filter(i => ids.has(i.instructorId));
  }, [slotsByDate, today, instructors]);

  const greetHour  = new Date().getHours();
  const greeting   = greetHour < 12 ? "Good morning" : greetHour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div style={{ width: "100%" }}>

      {/* ── TOP HEADER ───────────────────────────────────────────── */}
      <div className="dashboard-header">
        <div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500, marginBottom: 4 }}>{greeting}, {currentUser?.name ?? "there"}</p>
          <h1 className="font-serif dashboard-title" style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em" }}>Overview</h1>
        </div>
        <div className="dashboard-clock-row">
          <div>
            <p className="dashboard-clock" style={{ fontSize: 22, fontWeight: 600, color: "var(--text-main)", fontVariantNumeric: "tabular-nums" }}>{clock}</p>
            <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{formatLongDate(today)}</p>
          </div>
          <div
            style={{
              padding: "8px 12px",
              borderRadius: "var(--radius-pill)",
              background: "var(--bg-beige)",
              color: "var(--text-muted)",
              fontSize: 12,
              fontWeight: 500,
              textAlign: "right",
            }}
          >
            Workbook data is now managed via the import script.
          </div>
        </div>
      </div>

      {/* ── VIEW FILTER ──────────────────────────────────────────── */}
      <div className="view-filter-bar" style={{ display: "flex", gap: 8, marginBottom: 32, marginTop: 20 }}>
        {(["today", "tomorrow", "week"] as ViewFilter[]).map(v => (
          <button key={v} onClick={() => setView(v)}
            style={{
              padding: "8px 20px", borderRadius: "var(--radius-pill)", fontSize: 14, fontWeight: 500,
              border: "none", cursor: "pointer", transition: "all 0.15s",
              background: view === v ? "var(--ui-dark)" : "var(--bg-beige)",
              color: view === v ? "#fff" : "var(--text-muted)",
            }}>
            {v === "today" ? "Today" : v === "tomorrow" ? "Tomorrow" : "This Week"}
          </button>
        ))}
      </div>

      {/* ── KPI ROW ──────────────────────────────────────────────── */}
      <div className="kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 14, marginBottom: 32 }}>
        <KpiCard label="Classes Today"      value={(slotsByDate[today] ?? []).length}                  sub={`${todayCapacity} total capacity`}                color="var(--text-main)"        href="/schedule" />
        <KpiCard label="This Week"          value={weekTotal}                                           sub={`Across ${weekDates.filter(d => (slotsByDate[d]?.length ?? 0) > 0).length} days`} color="var(--tag-blue-txt)"    href="/schedule" />
        <KpiCard label="Active Instructors" value={instructors.filter(i => i.status === "Active").length} sub={`${todayInstructors.length} teaching today`}   color="var(--tag-purple-txt)"   href="/instructors" />
        <KpiCard label="Class Library"      value={classes.length}                                      sub={`${categories.length} categories`}                color="var(--tag-red-txt)"      href="/classes" />
        <KpiCard label="Equipment Items"    value={equipment.length}                                    sub={`${equipment.reduce((s,e) => s + e.quantityAvailable, 0)} total pieces`} color="var(--tag-green-txt)" href="/equipment" />
      </div>

      {/* ── MAIN GRID ────────────────────────────────────────────── */}
      <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 20 }}>

        {/* LEFT — Schedule */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            {/* Schedule header */}
            <div style={{ padding: "20px 24px 0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p className="font-serif" style={{ fontSize: 20, fontWeight: 500 }}>
                {view === "today" ? "Today's Schedule" : view === "tomorrow" ? "Tomorrow's Schedule" : "This Week's Schedule"}
              </p>
              <Link href="/schedule" style={{ fontSize: 13, color: "var(--tag-blue-txt)", fontWeight: 500, textDecoration: "none" }}>View full schedule →</Link>
            </div>

            {viewSlots.length === 0 ? (
              <div className="hatch" style={{ margin: 20, borderRadius: 14, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <p style={{ color: "var(--text-muted)", fontSize: 14, fontWeight: 500 }}>No classes scheduled</p>
              </div>
            ) : (
              <div style={{ padding: "16px 24px 24px", display: "flex", flexDirection: "column", gap: 0 }}>
                {viewSlots.map((slot, i) => {
                  const cat    = CAT_TAG[slot.categoryName] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
                  const flagged = slot.bufferViolation && !slot.bufferOverrideAcknowledged;
                  const showDate = view === "week" && (i === 0 || viewSlots[i - 1].date !== slot.date);
                  return (
                    <div key={slot._id}>
                      {showDate && (
                        <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", padding: "16px 0 8px", borderTop: i > 0 ? "1px solid var(--border-soft)" : "none" }}>
                          {formatLongDate(slot.date).split(",")[0]} — {formatMonthDay(slot.date)}
                        </p>
                      )}
                      <div className="slot-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: "10px 0", borderBottom: "1px solid var(--border-soft)", flexWrap: "wrap" }}>
                        {/* Time */}
                        <div style={{ width: 52, flexShrink: 0, textAlign: "right" }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)" }}>{slot.startTime}</p>
                        </div>
                        {/* Color bar */}
                        <div style={{ width: 3, height: 44, borderRadius: 2, background: cat.color, flexShrink: 0 }} />
                        {/* Class info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3, flexWrap: "wrap" }}>
                            <p className="font-serif" style={{ fontSize: 16, fontWeight: 500, color: "var(--text-main)" }}>{slot.className}</p>
                            {flagged && <span style={{ fontSize: 10, background: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)", fontWeight: 700, padding: "2px 6px", borderRadius: 4 }}>⚠️ BUFFER</span>}
                          </div>
                          <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
                            {slot.startTime} – {slot.endTime} &nbsp;·&nbsp; {slot.capacity} spots
                          </p>
                        </div>
                        {/* Category tag */}
                        <span className="slot-category-tag" style={{ background: cat.bg, color: cat.color, fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-pill)" }}>{slot.categoryName}</span>
                        {/* Instructor pill */}
                        <div className="slot-instructor-pill" style={{ background: "#fff", border: "1px solid var(--border-soft)", padding: "6px 14px", borderRadius: "var(--radius-pill)", fontSize: 13, fontWeight: 500, color: "var(--text-main)", boxShadow: "0 1px 4px rgba(0,0,0,0.05)" }}>
                          {slot.instructorName}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Week bar + class mix */}
          <div className="dashboard-sub-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <WeekBar dates={weekDates} slotsByDate={slotsByDate as Record<string, unknown[]>} />
            <CategoryBreakdown classes={classes} />
          </div>
        </div>

        {/* RIGHT — Sidebar panels */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Action Required */}
          <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 20 }}>Action Required</p>

            {[
              ...(currentUser?.role === "admin" ? [{ count: pendingReviews, label: "Pending Reviews", sub: "Instructor changes awaiting approval", href: "/review", urgent: pendingReviews > 0 }] : []),
              ...(currentUser?.role === "instructor" ? [{ count: myPending, label: "My Submissions", sub: "Awaiting admin approval", href: "/review", urgent: myPending > 0 }] : []),
              { count: pendingPlans, label: "Lesson Plans", sub: "Pending review", href: "/lesson-plans", urgent: pendingPlans > 0 },
              { count: violations,  label: "Buffer Violations", sub: "In weekly schedule", href: "/schedule",     urgent: violations > 0 },
              { count: missingLogs.length, label: "Missing Logs", sub: "Classes with no delivery log", href: "/delivery-log", urgent: missingLogs.length > 0 },
            ].map((item) => (
              <Link key={item.label} href={item.href} style={{ textDecoration: "none" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid var(--border-soft)", cursor: "pointer" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "0.75")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLDivElement).style.opacity = "1")}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      background: item.urgent ? "var(--ui-orange)" : "var(--bg-beige)",
                      color: item.urgent ? "#fff" : "var(--text-muted)", fontSize: 14, fontWeight: 700, flexShrink: 0
                    }}>{item.count}</div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-main)" }}>{item.label}</p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{item.sub}</p>
                    </div>
                  </div>
                  {item.urgent && (
                    <span style={{ background: "var(--ui-dark)", color: "#fff", fontSize: 11, fontWeight: 600, padding: "5px 12px", borderRadius: "var(--radius-pill)" }}>Review</span>
                  )}
                </div>
              </Link>
            ))}
          </div>

          {/* Instructors On Today */}
          <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p className="font-serif" style={{ fontSize: 18, fontWeight: 500 }}>On Today</p>
              <Link href="/instructors" style={{ fontSize: 12, color: "var(--tag-blue-txt)", fontWeight: 500, textDecoration: "none" }}>All →</Link>
            </div>
            {todayInstructors.length === 0 ? (
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No instructors scheduled today</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {todayInstructors.map((ins, i) => {
                  const slots = (slotsByDate[today] ?? []).filter(s => s.instructorId === ins.instructorId);
                  return (
                    <div key={ins._id} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: "50%", background: AVATAR_COLORS[i % AVATAR_COLORS.length], color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
                        {initials(ins.fullName)}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text-main)" }}>{ins.displayName}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{slots.map(s => s.startTime).join(" · ")}</p>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "var(--tag-green-txt)", background: "var(--tag-green-bg)", padding: "3px 8px", borderRadius: "var(--radius-pill)" }}>
                        {slots.length} class{slots.length !== 1 ? "es" : ""}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* System Flags */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 10 }}>System Flags</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {violations === 0 && pendingPlans === 0 && pendingReviews === 0 && myPending === 0 && missingLogs.length === 0 ? (
                <div style={{ background: "var(--tag-green-bg)", borderRadius: 14, padding: "14px 16px" }}>
                  <p style={{ color: "var(--tag-green-txt)", fontWeight: 600, fontSize: 14 }}>✓ All Clear</p>
                  <p style={{ color: "var(--text-main)", fontSize: 13, marginTop: 4 }}>No violations or pending items.</p>
                </div>
              ) : (
                <>
                  {violations > 0 && (
                    <div style={{ background: "var(--tag-red-bg)", borderRadius: 14, padding: "14px 16px" }}>
                      <p style={{ color: "var(--tag-red-txt)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Buffer Violations ({violations})</p>
                      <p style={{ color: "var(--text-main)", fontSize: 13 }}>Less than 10-min gaps detected in the schedule. Review and override or adjust times.</p>
                    </div>
                  )}
                  {pendingPlans > 0 && (
                    <div style={{ background: "var(--tag-yellow-bg)", borderRadius: 14, padding: "14px 16px" }}>
                      <p style={{ color: "var(--tag-yellow-txt)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>Lesson Plans Pending</p>
                      <p style={{ color: "var(--text-main)", fontSize: 13 }}>{pendingPlans} submitted plan{pendingPlans !== 1 ? "s" : ""} awaiting review.</p>
                    </div>
                  )}
                  {missingLogs.length > 0 && (
                    <div style={{ background: "var(--tag-red-bg)", borderRadius: 14, padding: "14px 16px" }}>
                      <p style={{ color: "var(--tag-red-txt)", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                        Missing Delivery Logs ({missingLogs.length})
                      </p>
                      <p style={{ color: "var(--text-main)", fontSize: 13 }}>
                        {missingLogs.length} past class{missingLogs.length !== 1 ? "es" : ""} have no delivery log submitted.
                      </p>
                    </div>
                  )}
                  {currentUser?.role === "admin" && pendingReviews > 0 && (
                    <Link href="/review" style={{ textDecoration: "none" }}>
                      <div style={{ background: "#E3F2FD", borderRadius: 14, padding: "14px 16px", cursor: "pointer" }}>
                        <p style={{ color: "#1565C0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                          {pendingReviews} Pending Review{pendingReviews !== 1 ? "s" : ""}
                        </p>
                        <p style={{ color: "var(--text-main)", fontSize: 13 }}>
                          Instructor changes awaiting your approval. Tap to review →
                        </p>
                      </div>
                    </Link>
                  )}
                  {currentUser?.role === "instructor" && myPending > 0 && (
                    <div style={{ background: "#E3F2FD", borderRadius: 14, padding: "14px 16px" }}>
                      <p style={{ color: "#1565C0", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                        {myPending} Submission{myPending !== 1 ? "s" : ""} Pending
                      </p>
                      <p style={{ color: "var(--text-main)", fontSize: 13 }}>Your changes are in the queue waiting for admin approval.</p>
                    </div>
                  )}
                </>
              )}
              {/* Pre-programming reminder */}
              <div style={{ background: "var(--bg-beige)", borderRadius: 14, padding: "14px 16px" }}>
                <p style={{ fontWeight: 600, fontSize: 13, color: "var(--text-main)", marginBottom: 3 }}>Pre-Programming Rate</p>
                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>Target: 100% of lesson plans submitted 24h before class. Currently tracking {exercises.length} exercises in the library.</p>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "20px 24px", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
            <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 14 }}>Quick Access</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "📅 Add Class Slot",       href: "/schedule" },
                { label: "📋 Submit Lesson Plan",   href: "/lesson-plans" },
                { label: "📝 Log Class Delivery",   href: "/delivery-log" },
                { label: "🗓️ View Pathways",        href: "/pathways" },
                { label: "💪 Exercise Library",     href: "/exercises" },
                ...(currentUser?.role === "admin" ? [{ label: "✅ Review Queue", href: "/review" }] : []),
              ].map((l) => (
                <Link key={l.href} href={l.href}
                  style={{ display: "block", padding: "9px 14px", borderRadius: 10, fontSize: 13, fontWeight: 500, color: "var(--text-main)", textDecoration: "none", background: "var(--bg-app)", transition: "background 0.12s" }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-beige)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLAnchorElement).style.background = "var(--bg-app)")}
                >{l.label}</Link>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
