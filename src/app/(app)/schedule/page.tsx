"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

// ── helpers ────────────────────────────────────────────────────────────────
function getWeekDates(anchor: Date): string[] {
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function formatDisplayDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-CA", { month: "short", day: "numeric" });
}

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function addMinutes(t: string, mins: number) {
  const total = timeToMinutes(t) + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const CAT_STYLE: Record<string, { bg: string; color: string }> = {
  "Strength & Conditioning": { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  Boxing:                    { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
  Hybrid:                    { bg: "var(--tag-purple-bg)", color: "var(--tag-purple-txt)" },
  Pilates:                   { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
  Yoga:                      { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
};

const STATUS_OPTIONS = ["Scheduled", "Cancelled", "Completed"];

// ── types ──────────────────────────────────────────────────────────────────
interface SlotDoc {
  _id: Id<"weeklySchedule">;
  date: string; dayOfWeek: string;
  startTime: string; endTime: string;
  className: string; categoryName: string;
  instructorId: string; instructorName: string;
  capacity: number; status: string;
  bufferViolation: boolean; bufferOverrideAcknowledged: boolean;
}

// ── Add Slot Modal ─────────────────────────────────────────────────────────
function AddSlotModal({
  date, dayLabel, classes, instructors, slotsOnDay, availability, onClose, onSave,
}: {
  date: string; dayLabel: string;
  classes: { classId: string; name: string; categoryName: string; durationMinutes: number }[];
  instructors: { instructorId: string; displayName: string }[];
  slotsOnDay: SlotDoc[];
  availability: { instructorId: string; dayOfWeek: string; available: boolean }[];
  onClose: () => void;
  onSave: (data: {
    classId: string; className: string; categoryName: string;
    instructorId: string; instructorName: string;
    startTime: string; endTime: string; capacity: number;
    bufferOverrideAcknowledged: boolean;
  }) => void;
}) {
  const [classId, setClassId]         = useState(classes[0]?.classId ?? "");
  const [instructorId, setInstructorId] = useState(instructors[0]?.instructorId ?? "");
  const [startTime, setStartTime]     = useState("09:00");
  const [capacity, setCapacity]       = useState(20);
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);

  const selectedClass = classes.find((c) => c.classId === classId);
  const endTime = selectedClass ? addMinutes(startTime, selectedClass.durationMinutes) : startTime;

  const bufferWarning = useMemo(() => {
    if (!selectedClass) return null;
    const ns = timeToMinutes(startTime), ne = timeToMinutes(endTime);
    for (const slot of slotsOnDay) {
      const ss = timeToMinutes(slot.startTime), se = timeToMinutes(slot.endTime);
      if (ns < se && ne > ss) return { type: "overlap" as const, slot };
      const g1 = ns - se, g2 = ss - ne;
      if ((g1 >= 0 && g1 < 10) || (g2 >= 0 && g2 < 10)) return { type: "buffer" as const, slot };
    }
    return null;
  }, [startTime, endTime, slotsOnDay, selectedClass]);

  // Availability conflict check
  const availConflict = (() => {
    if (!instructorId || !dayLabel) return null;
    const record = availability.find(
      a => a.instructorId === instructorId && a.dayOfWeek === dayLabel
    );
    const ins = instructors.find(i => i.instructorId === instructorId);
    if (!record) return `No availability record for this instructor on ${dayLabel}`;
    if (!record.available) return `${ins?.displayName || "Instructor"} is marked unavailable on ${dayLabel}`;
    return null;
  })();

  function handleSave() {
    if (!selectedClass) return;
    const ins = instructors.find((i) => i.instructorId === instructorId);
    onSave({ classId, className: selectedClass.name, categoryName: selectedClass.categoryName,
      instructorId, instructorName: ins?.displayName ?? "",
      startTime, endTime, capacity, bufferOverrideAcknowledged: overrideConfirmed });
  }

  const s: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 0 };

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>Add Class Slot</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{dayLabel} — {formatDisplayDate(date)}</p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={s}>
            <label className="field-label">Class</label>
            <select className="field-input" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>{c.name} ({c.categoryName}) — {c.durationMinutes} min</option>
              ))}
            </select>
          </div>

          <div style={s}>
            <label className="field-label">Instructor</label>
            <select className="field-input" value={instructorId} onChange={(e) => setInstructorId(e.target.value)}>
              {instructors.map((i) => (
                <option key={i.instructorId} value={i.instructorId}>{i.displayName}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={s}>
              <label className="field-label">Start Time</label>
              <input type="time" className="field-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div style={s}>
              <label className="field-label">End Time (auto)</label>
              <input type="time" className="field-input" value={endTime} readOnly />
            </div>
          </div>

          <div style={s}>
            <label className="field-label">Capacity</label>
            <input type="number" min={1} max={100} className="field-input" value={capacity}
              onChange={(e) => setCapacity(Number(e.target.value))} />
          </div>

          {availConflict && (
            <div style={{
              padding: "10px 14px",
              background: "var(--tag-yellow-bg)",
              border: "1px solid var(--tag-yellow-txt)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--tag-yellow-txt)",
              fontWeight: 500,
              marginBottom: 16,
            }}>
              ⚠️ {availConflict}
            </div>
          )}

          {bufferWarning && (
            <div style={{ background: "var(--tag-yellow-bg)", borderRadius: 14, padding: 16 }}>
              <p style={{ color: "var(--tag-yellow-txt)", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                {bufferWarning.type === "overlap" ? "⚠️ Time Overlap" : "⚠️ 10-Minute Buffer Violation"}
              </p>
              <p style={{ color: "var(--text-main)", fontSize: 13, lineHeight: 1.5 }}>
                {bufferWarning.type === "overlap"
                  ? `Overlaps with "${bufferWarning.slot.className}" (${bufferWarning.slot.startTime}–${bufferWarning.slot.endTime}).`
                  : `Less than 10 minutes between this and "${bufferWarning.slot.className}" (${bufferWarning.slot.startTime}–${bufferWarning.slot.endTime}).`}
              </p>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={overrideConfirmed} onChange={(e) => setOverrideConfirmed(e.target.checked)} />
                <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 500 }}>I acknowledge this and want to proceed anyway</span>
              </label>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}
            disabled={!!(bufferWarning && !overrideConfirmed)}>
            Add to Schedule
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Slot Modal ────────────────────────────────────────────────────────
function EditSlotModal({
  slot, classes, instructors, slotsOnDay, availability, onClose, onSave,
}: {
  slot: SlotDoc;
  classes: { classId: string; name: string; categoryName: string; durationMinutes: number }[];
  instructors: { instructorId: string; displayName: string }[];
  slotsOnDay: SlotDoc[];
  availability: { instructorId: string; dayOfWeek: string; available: boolean }[];
  onClose: () => void;
  onSave: (data: {
    id: Id<"weeklySchedule">;
    startTime: string; endTime: string;
    className: string; categoryName: string;
    instructorId: string; instructorName: string;
    capacity: number; status: string;
  }) => void;
}) {
  // Pre-fill from the existing slot; fall back to first class/instructor if none found
  const initialClass = classes.find((c) => c.name === slot.className) ?? classes[0];
  const [classId, setClassId]         = useState(initialClass?.classId ?? "");
  const [instructorId, setInstructorId] = useState(slot.instructorId ?? instructors[0]?.instructorId ?? "");
  const [startTime, setStartTime]     = useState(slot.startTime);
  const [capacity, setCapacity]       = useState(slot.capacity);
  const [status, setStatus]           = useState(slot.status);
  const [overrideConfirmed, setOverrideConfirmed] = useState(false);

  const selectedClass = classes.find((c) => c.classId === classId);
  const endTime = selectedClass ? addMinutes(startTime, selectedClass.durationMinutes) : slot.endTime;

  // Exclude the slot being edited from buffer checks
  const otherSlotsOnDay = useMemo(
    () => slotsOnDay.filter((s) => s._id !== slot._id),
    [slotsOnDay, slot._id]
  );

  const bufferWarning = useMemo(() => {
    if (!selectedClass) return null;
    const ns = timeToMinutes(startTime), ne = timeToMinutes(endTime);
    for (const other of otherSlotsOnDay) {
      const ss = timeToMinutes(other.startTime), se = timeToMinutes(other.endTime);
      if (ns < se && ne > ss) return { type: "overlap" as const, slot: other };
      const g1 = ns - se, g2 = ss - ne;
      if ((g1 >= 0 && g1 < 10) || (g2 >= 0 && g2 < 10)) return { type: "buffer" as const, slot: other };
    }
    return null;
  }, [startTime, endTime, otherSlotsOnDay, selectedClass]);

  // Availability conflict check
  const availConflict = (() => {
    if (!instructorId || !slot.dayOfWeek) return null;
    const record = availability.find(
      a => a.instructorId === instructorId && a.dayOfWeek === slot.dayOfWeek
    );
    const ins = instructors.find(i => i.instructorId === instructorId);
    if (!record) return `No availability record for this instructor on ${slot.dayOfWeek}`;
    if (!record.available) return `${ins?.displayName || "Instructor"} is marked unavailable on ${slot.dayOfWeek}`;
    return null;
  })();

  function handleSave() {
    if (!selectedClass) return;
    const ins = instructors.find((i) => i.instructorId === instructorId);
    onSave({
      id: slot._id,
      startTime, endTime,
      className: selectedClass.name,
      categoryName: selectedClass.categoryName,
      instructorId,
      instructorName: ins?.displayName ?? "",
      capacity,
      status,
    });
  }

  const s: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6, marginBottom: 0 };

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>Edit Class Slot</h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
              {slot.dayOfWeek} — {formatDisplayDate(slot.date)}
            </p>
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={s}>
            <label className="field-label">Class</label>
            <select className="field-input" value={classId} onChange={(e) => setClassId(e.target.value)}>
              {classes.map((c) => (
                <option key={c.classId} value={c.classId}>{c.name} ({c.categoryName}) — {c.durationMinutes} min</option>
              ))}
            </select>
          </div>

          <div style={s}>
            <label className="field-label">Instructor</label>
            <select className="field-input" value={instructorId} onChange={(e) => setInstructorId(e.target.value)}>
              {instructors.map((i) => (
                <option key={i.instructorId} value={i.instructorId}>{i.displayName}</option>
              ))}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={s}>
              <label className="field-label">Start Time</label>
              <input type="time" className="field-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
            </div>
            <div style={s}>
              <label className="field-label">End Time (auto)</label>
              <input type="time" className="field-input" value={endTime} readOnly />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={s}>
              <label className="field-label">Capacity</label>
              <input type="number" min={1} max={100} className="field-input" value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))} />
            </div>
            <div style={s}>
              <label className="field-label">Status</label>
              <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUS_OPTIONS.map((opt) => <option key={opt}>{opt}</option>)}
              </select>
            </div>
          </div>

          {availConflict && (
            <div style={{
              padding: "10px 14px",
              background: "var(--tag-yellow-bg)",
              border: "1px solid var(--tag-yellow-txt)",
              borderRadius: 8,
              fontSize: 13,
              color: "var(--tag-yellow-txt)",
              fontWeight: 500,
              marginBottom: 16,
            }}>
              ⚠️ {availConflict}
            </div>
          )}

          {bufferWarning && (
            <div style={{ background: "var(--tag-yellow-bg)", borderRadius: 14, padding: 16 }}>
              <p style={{ color: "var(--tag-yellow-txt)", fontWeight: 600, fontSize: 14, marginBottom: 6 }}>
                {bufferWarning.type === "overlap" ? "⚠️ Time Overlap" : "⚠️ 10-Minute Buffer Violation"}
              </p>
              <p style={{ color: "var(--text-main)", fontSize: 13, lineHeight: 1.5 }}>
                {bufferWarning.type === "overlap"
                  ? `Overlaps with "${bufferWarning.slot.className}" (${bufferWarning.slot.startTime}–${bufferWarning.slot.endTime}).`
                  : `Less than 10 minutes between this and "${bufferWarning.slot.className}" (${bufferWarning.slot.startTime}–${bufferWarning.slot.endTime}).`}
              </p>
              <label style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10, cursor: "pointer" }}>
                <input type="checkbox" checked={overrideConfirmed} onChange={(e) => setOverrideConfirmed(e.target.checked)} />
                <span style={{ fontSize: 13, color: "var(--text-main)", fontWeight: 500 }}>I acknowledge this and want to proceed anyway</span>
              </label>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={handleSave} className="btn-primary" style={{ flex: 1 }}
            disabled={!!(bufferWarning && !overrideConfirmed)}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const [anchorDate, setAnchorDate] = useState(new Date());
  const [addModal, setAddModal]     = useState<{ date: string; dayLabel: string } | null>(null);
  const [editSlot, setEditSlot]     = useState<SlotDoc | null>(null);
  const [hoveredSlot, setHoveredSlot] = useState<string | null>(null);

  const weekDates     = useMemo(() => getWeekDates(anchorDate), [anchorDate]);
  const scheduleSlots = useQuery(api.queries.getScheduleByWeek, { weekDates }) ?? [];
  const classes       = useQuery(api.queries.getClasses) ?? [];
  const instructors   = useQuery(api.queries.getInstructors) ?? [];
  const availability  = useQuery(api.queries.getAvailability) ?? [];

  const { currentUser } = useAuth();
  const submitChange = useMutation(api.mutations.submitPendingChange);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  const addSlot    = useMutation(api.mutations.addScheduleSlot);
  const deleteSlot = useMutation(api.mutations.deleteScheduleSlot);
  const updateSlot = useMutation(api.mutations.updateScheduleSlot);

  function showStatus(msg: { type: "success" | "pending" | "error"; text: string }) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  const slotsByDate = useMemo(() => {
    const map: Record<string, SlotDoc[]> = {};
    for (const d of weekDates) map[d] = [];
    for (const s of scheduleSlots) { if (map[s.date]) map[s.date].push(s as SlotDoc); }
    for (const d of weekDates) map[d].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
    return map;
  }, [scheduleSlots, weekDates]);

  const violations = scheduleSlots.filter((s) => s.bufferViolation && !s.bufferOverrideAcknowledged).length;
  const weekLabel  = `${formatDisplayDate(weekDates[0])} – ${formatDisplayDate(weekDates[6])}`;
  const today      = new Date().toISOString().split("T")[0];

  async function handleAdd(data: Parameters<React.ComponentProps<typeof AddSlotModal>["onSave"]>[0]) {
    if (!addModal) return;
    const dayIdx = weekDates.indexOf(addModal.date);
    const payload = { date: addModal.date, dayOfWeek: DAY_LABELS[dayIdx >= 0 ? dayIdx : 0], ...data };
    if (currentUser?.role === "admin") {
      await addSlot(payload);
      showStatus({ type: "success", text: "Class slot added successfully." });
    } else {
      await submitChange({
        tableName: "weeklySchedule",
        action: "add",
        payload,
        submittedBy: currentUser?.id ?? "",
        submittedByName: currentUser?.displayName ?? "",
        description: `Add ${data.className} on ${payload.dayOfWeek} ${data.startTime}`,
      });
      showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
    }
    setAddModal(null);
  }

  async function handleUpdate(data: Parameters<React.ComponentProps<typeof EditSlotModal>["onSave"]>[0]) {
    if (currentUser?.role === "admin") {
      await updateSlot(data);
      showStatus({ type: "success", text: "Class slot updated successfully." });
    } else {
      await submitChange({
        tableName: "weeklySchedule",
        action: "update",
        entityId: String(data.id),
        payload: data,
        submittedBy: currentUser?.id ?? "",
        submittedByName: currentUser?.displayName ?? "",
        description: `Update ${data.className} on ${data.startTime}`,
      });
      showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
    }
    setEditSlot(null);
  }

  function shift(n: number) {
    const d = new Date(anchorDate); d.setDate(d.getDate() + n); setAnchorDate(d);
  }

  function handlePrint() {
    window.print();
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Print header — only visible when printing */}
      <div className="print-header" style={{ display: "none" }}>
        <h1>FIIT Co. — Weekly Schedule</h1>
        <p>Week of {weekDates[0]} to {weekDates[6]} • Generated {new Date().toLocaleDateString()}</p>
      </div>

      {/* Status message banner */}
      {statusMsg && (
        <div style={{
          marginBottom: 16,
          padding: "10px 16px",
          borderRadius: 10,
          fontSize: 14,
          fontWeight: 500,
          background: statusMsg.type === "success" ? "#e8f5e9" : statusMsg.type === "pending" ? "#e3f2fd" : "#ffebee",
          color: statusMsg.type === "success" ? "#2e7d32" : statusMsg.type === "pending" ? "#1565c0" : "#c62828",
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="schedule-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <h1 className="page-title">Weekly Schedule</h1>
          <p className="page-subtitle" style={{ marginBottom: 0, display: "flex", alignItems: "center", gap: 10 }}>
            {weekLabel}
            {violations > 0 && (
              <span style={{ background: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)", fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: "var(--radius-pill)" }}>
                ⚠️ {violations} buffer {violations === 1 ? "violation" : "violations"}
              </span>
            )}
          </p>
        </div>
        <div className="no-print" style={{ display: "flex", gap: 8 }}>
          <button className="btn-ghost" onClick={() => setAnchorDate(new Date())}>Today</button>
          <button className="btn-ghost" onClick={() => shift(-7)}>← Prev</button>
          <button className="btn-ghost" onClick={() => shift(7)}>Next →</button>
          <button
            onClick={handlePrint}
            style={{
              background: "var(--bg-beige)",
              color: "var(--text-main)",
              border: "1px solid rgba(0,0,0,0.08)",
              padding: "10px 18px",
              borderRadius: "var(--radius-pill)",
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.15s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "var(--ui-dark)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "var(--bg-beige)"; e.currentTarget.style.color = "var(--text-main)"; }}
          >
            🖨 Print Schedule
          </button>
        </div>
      </div>

      {/* Buffer rule notice */}
      <div style={{ marginBottom: 28, padding: "10px 16px", background: "var(--tag-yellow-bg)", borderRadius: 12, fontSize: 13, color: "var(--tag-yellow-txt)", fontWeight: 500 }}>
        ⚠️ 10-minute buffer rule active — gaps under 10 min between classes will be flagged. Override requires acknowledgment.
      </div>

      {/* 7-col grid */}
      <div className="week-grid" style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 10 }}>
        {weekDates.map((date, i) => {
          const slots   = slotsByDate[date] ?? [];
          const isToday = date === today;
          return (
            <div key={date} style={{
              background: "var(--bg-panel)",
              borderRadius: "var(--radius-card)",
              border: isToday ? "2px solid var(--ui-dark)" : "1px solid var(--border-soft)",
              display: "flex", flexDirection: "column",
              minHeight: 380,
              boxShadow: "0 2px 12px rgba(0,0,0,0.03)",
            }}>
              {/* Day header */}
              <div style={{
                background: isToday ? "var(--ui-dark)" : "var(--bg-beige)",
                borderRadius: "18px 18px 0 0",
                padding: "12px 14px",
                borderBottom: "1px solid var(--border-soft)",
              }}>
                <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: isToday ? "rgba(255,255,255,0.6)" : "var(--text-muted)" }}>
                  {DAY_LABELS[i]}
                </p>
                <p style={{ fontSize: 15, fontWeight: 600, color: isToday ? "#fff" : "var(--text-main)", marginTop: 2 }}>
                  {formatDisplayDate(date)}
                </p>
              </div>

              {/* Slots */}
              <div style={{ flex: 1, padding: 10, display: "flex", flexDirection: "column", gap: 8, overflowY: "auto" }}>
                {slots.length === 0 && (
                  <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", paddingTop: 20, opacity: 0.5 }}>No classes</p>
                )}
                {slots.map((slot) => {
                  const flagged = slot.bufferViolation && !slot.bufferOverrideAcknowledged;
                  const cat = CAT_STYLE[slot.categoryName] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
                  const isHovered = hoveredSlot === slot._id;
                  return (
                    <div
                      key={slot._id}
                      onMouseEnter={() => setHoveredSlot(slot._id)}
                      onMouseLeave={() => setHoveredSlot(null)}
                      style={{
                        background: flagged ? "var(--tag-yellow-bg)" : cat.bg,
                        borderRadius: 12,
                        padding: "10px 12px",
                        position: "relative",
                        border: flagged ? "1px solid var(--tag-yellow-txt)" : isHovered ? `1px solid ${cat.color}40` : "1px solid transparent",
                        transition: "border 0.1s",
                      }}
                    >
                      {flagged && (
                        <span style={{ position: "absolute", top: -6, right: -4, background: "var(--tag-yellow-txt)", color: "#fff", fontSize: 9, fontWeight: 700, padding: "2px 5px", borderRadius: 6 }}>⚠️</span>
                      )}
                      <p style={{ fontSize: 13, fontWeight: 600, color: flagged ? "var(--tag-yellow-txt)" : cat.color, marginBottom: 3, paddingRight: isHovered ? 44 : 4 }}>{slot.className}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{slot.startTime} – {slot.endTime}</p>
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 1 }}>{slot.instructorName}</p>

                      {/* Edit + Delete — visible on card hover */}
                      {isHovered && (
                        <div className="no-print" style={{ position: "absolute", top: 6, right: 6, display: "flex", gap: 2 }}>
                          <button onClick={(e) => { e.stopPropagation(); setEditSlot(slot); }}
                            style={{ background: "rgba(255,255,255,0.85)", border: "none", borderRadius: 6, fontSize: 12, color: "var(--tag-blue-txt)", cursor: "pointer", padding: "3px 6px", fontWeight: 600, lineHeight: 1 }}
                            title="Edit">✏️</button>
                          <button onClick={async (e) => {
                            e.stopPropagation();
                            if (currentUser?.role === "admin") {
                              await deleteSlot({ id: slot._id });
                              showStatus({ type: "success", text: "Class slot deleted." });
                            } else {
                              await submitChange({
                                tableName: "weeklySchedule",
                                action: "delete",
                                entityId: String(slot._id),
                                payload: {},
                                submittedBy: currentUser?.id ?? "",
                                submittedByName: currentUser?.displayName ?? "",
                                description: `Delete ${slot.className} on ${slot.dayOfWeek} ${slot.startTime}`,
                              });
                              showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
                            }
                          }}
                            style={{ background: "rgba(255,255,255,0.85)", border: "none", borderRadius: 6, fontSize: 14, color: "var(--tag-red-txt)", cursor: "pointer", padding: "3px 6px", fontWeight: 700, lineHeight: 1 }}
                            title="Delete">×</button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add */}
              <div className="no-print" style={{ padding: "8px 10px", borderTop: "1px solid var(--border-soft)" }}>
                <button
                  onClick={() => setAddModal({ date, dayLabel: DAY_LABELS[i] })}
                  style={{ width: "100%", background: "none", border: "none", fontSize: 13, color: "var(--text-muted)", cursor: "pointer", padding: "6px", borderRadius: 10, fontWeight: 500, fontFamily: "inherit" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-beige)"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-main)"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "none"; (e.currentTarget as HTMLButtonElement).style.color = "var(--text-muted)"; }}
                >+ Add</button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div style={{ marginTop: 24, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginRight: 4 }}>Categories:</span>
        {Object.entries(CAT_STYLE).map(([name, s]) => (
          <span key={name} className="cat-tag" style={{ background: s.bg, color: s.color }}>{name}</span>
        ))}
        <span className="cat-tag" style={{ background: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" }}>⚠️ Buffer violation</span>
      </div>

      {/* Add Slot Modal */}
      {addModal && (
        <AddSlotModal
          date={addModal.date} dayLabel={addModal.dayLabel}
          classes={classes.map((c) => ({ classId: c.classId, name: c.name, categoryName: c.categoryName, durationMinutes: c.durationMinutes }))}
          instructors={instructors.map((i) => ({ instructorId: i.instructorId, displayName: i.displayName }))}
          slotsOnDay={(slotsByDate[addModal.date] ?? []) as SlotDoc[]}
          availability={availability.map((a) => ({ instructorId: a.instructorId, dayOfWeek: a.dayOfWeek, available: a.available }))}
          onClose={() => setAddModal(null)}
          onSave={handleAdd}
        />
      )}

      {/* Edit Slot Modal */}
      {editSlot && (
        <EditSlotModal
          slot={editSlot}
          classes={classes.map((c) => ({ classId: c.classId, name: c.name, categoryName: c.categoryName, durationMinutes: c.durationMinutes }))}
          instructors={instructors.map((i) => ({ instructorId: i.instructorId, displayName: i.displayName }))}
          slotsOnDay={(slotsByDate[editSlot.date] ?? []) as SlotDoc[]}
          availability={availability.map((a) => ({ instructorId: a.instructorId, dayOfWeek: a.dayOfWeek, available: a.available }))}
          onClose={() => setEditSlot(null)}
          onSave={handleUpdate}
        />
      )}
    </div>
  );
}
