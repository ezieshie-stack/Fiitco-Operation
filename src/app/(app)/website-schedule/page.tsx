"use client";

/**
 * Website Schedule admin — tunes the weekly schedule for the public site
 * at fiitco.ca/schedule. Reads and writes the SAME `weeklySchedule` table
 * the operational /schedule uses, so edits here reach customers immediately
 * (the public query `getWeeklySchedule` is intentionally unauthenticated).
 *
 * Scope: light edits for the customer view (class, instructor, time,
 * capacity, Scheduled/Cancelled status). Delete here hard-removes the row.
 * For the ops-side version with buffer/availability conflict checks, use
 * /schedule.
 */

import { useMemo, useState } from "react";
import {
  useAuthedQuery as useQuery,
  useAuthedMutation as useMutation,
} from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

// ── helpers ───────────────────────────────────────────────────────────────
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const STATUS_OPTIONS = ["Scheduled", "Cancelled"] as const;

function getWeekDates(anchor: Date): string[] {
  const monday = new Date(anchor);
  monday.setDate(anchor.getDate() - ((anchor.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.toISOString().split("T")[0];
  });
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDisplayDate(iso: string): string {
  return parseIsoDate(iso).toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
}

function formatRange(dates: string[]): string {
  const first = parseIsoDate(dates[0]);
  const last = parseIsoDate(dates[dates.length - 1]);
  const sameMonth = first.getMonth() === last.getMonth();
  const firstFmt = first.toLocaleDateString("en-CA", {
    month: "short",
    day: "numeric",
  });
  const lastFmt = last.toLocaleDateString("en-CA", {
    month: sameMonth ? undefined : "short",
    day: "numeric",
    year: "numeric",
  });
  return `${firstFmt} – ${lastFmt}`;
}

function timeToMinutes(t: string): number {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

function addMinutes(t: string, mins: number): string {
  const total = timeToMinutes(t) + mins;
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

// ── types ──────────────────────────────────────────────────────────────────
interface SlotDoc {
  _id: Id<"weeklySchedule">;
  date: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  className: string;
  categoryName: string;
  instructorId: string;
  instructorName: string;
  capacity: number;
  status: string;
}

interface ClassOption {
  classId: string;
  name: string;
  categoryName: string;
  durationMinutes: number;
}

interface InstructorOption {
  instructorId: string;
  displayName: string;
  status: string;
}

// ── page ───────────────────────────────────────────────────────────────────
export default function WebsiteSchedulePage() {
  const { ready } = useRequireAdmin();

  const slots = useQuery(api.queries.getWeeklySchedule) as SlotDoc[] | undefined;
  const classesData = useQuery(api.queries.getClasses) as ClassOption[] | undefined;
  const instructorsData = useQuery(api.queries.getInstructors) as InstructorOption[] | undefined;

  const addSlot = useMutation(api.mutations.addScheduleSlot);
  const updateSlot = useMutation(api.mutations.updateScheduleSlot);
  const deleteSlot = useMutation(api.mutations.deleteScheduleSlot);

  const [anchor, setAnchor] = useState<Date>(() => new Date());
  const weekDates = useMemo(() => getWeekDates(anchor), [anchor]);
  const [addState, setAddState] = useState<{ date: string; dayLabel: string } | null>(null);
  const [editState, setEditState] = useState<SlotDoc | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const slotsByDate = useMemo(() => {
    const map: Record<string, SlotDoc[]> = {};
    if (!slots) return map;
    for (const s of slots) {
      if (!map[s.date]) map[s.date] = [];
      map[s.date].push(s);
    }
    for (const key of Object.keys(map)) {
      map[key].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [slots]);

  const activeInstructors = useMemo(
    () => (instructorsData ?? []).filter((i) => i.status === "Active"),
    [instructorsData],
  );
  const classes = classesData ?? [];

  function flash(type: "ok" | "err", text: string) {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  }

  async function handleAdd(data: {
    date: string;
    dayLabel: string;
    classId: string;
    className: string;
    categoryName: string;
    instructorId: string;
    instructorName: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }) {
    try {
      await addSlot({
        date: data.date,
        dayOfWeek: data.dayLabel,
        startTime: data.startTime,
        endTime: data.endTime,
        classId: data.classId,
        className: data.className,
        categoryName: data.categoryName,
        instructorId: data.instructorId,
        instructorName: data.instructorName,
        capacity: data.capacity,
        bufferOverrideAcknowledged: true,
      });
      setAddState(null);
      flash("ok", `Added ${data.className} on ${formatDisplayDate(data.date)}.`);
    } catch (e) {
      flash("err", (e as Error).message ?? "Failed to add slot.");
    }
  }

  async function handleUpdate(data: {
    id: Id<"weeklySchedule">;
    startTime: string;
    endTime: string;
    className: string;
    categoryName: string;
    instructorId: string;
    instructorName: string;
    capacity: number;
    status: string;
  }) {
    try {
      await updateSlot(data);
      setEditState(null);
      flash("ok", "Saved.");
    } catch (e) {
      flash("err", (e as Error).message ?? "Failed to save.");
    }
  }

  async function handleDelete(id: Id<"weeklySchedule">) {
    const yes = window.confirm(
      "Delete this slot? This removes it from the staff schedule and from fiitco.ca.",
    );
    if (!yes) return;
    try {
      await deleteSlot({ id });
      setEditState(null);
      flash("ok", "Deleted.");
    } catch (e) {
      flash("err", (e as Error).message ?? "Failed to delete.");
    }
  }

  if (!ready) return null;

  const loading = slots === undefined || classesData === undefined || instructorsData === undefined;

  return (
    <div style={{ padding: "40px 48px", maxWidth: 1400, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--text-muted)", marginBottom: 8 }}>
          Website UI/UX
        </p>
        <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 8 }}>
          Schedule
        </h1>
        <p style={{ fontSize: 15, color: "var(--text-muted)", maxWidth: 720, lineHeight: 1.55 }}>
          Edits here flow straight to fiitco.ca/schedule. Shares the same table
          as the ops <strong>Weekly Schedule</strong> page; use this view when
          you&apos;re tuning what customers see. Delete removes the slot
          everywhere.
        </p>
      </div>

      {/* Week nav */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20, gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setAnchor(new Date(anchor.getTime() - 7 * 24 * 60 * 60 * 1000))}
          >
            ← Prev week
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setAnchor(new Date())}
          >
            This week
          </button>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => setAnchor(new Date(anchor.getTime() + 7 * 24 * 60 * 60 * 1000))}
          >
            Next week →
          </button>
        </div>
        <p style={{ fontSize: 15, fontWeight: 500 }}>{formatRange(weekDates)}</p>
      </div>

      {statusMsg && (
        <div style={{
          padding: "10px 14px",
          marginBottom: 16,
          borderRadius: 8,
          fontSize: 14,
          background: statusMsg.type === "ok" ? "var(--tag-green-bg)" : "var(--tag-red-bg)",
          color: statusMsg.type === "ok" ? "var(--tag-green-txt)" : "var(--tag-red-txt)",
          fontWeight: 500,
        }}>
          {statusMsg.text}
        </div>
      )}

      {loading ? (
        <p style={{ color: "var(--text-muted)" }}>Loading schedule…</p>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
          gap: 12,
        }}>
          {weekDates.map((date, i) => {
            const dayLabel = DAY_LABELS[i];
            const todaySlots = slotsByDate[date] ?? [];
            return (
              <div
                key={date}
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid rgba(0,0,0,0.06)",
                  borderRadius: 12,
                  padding: 12,
                  minHeight: 240,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ marginBottom: 8 }}>
                  <p style={{ fontSize: 11, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--text-muted)" }}>
                    {dayLabel}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 600 }}>{formatDisplayDate(date)}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {todaySlots.map((slot) => (
                    <button
                      key={slot._id}
                      type="button"
                      onClick={() => setEditState(slot)}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: slot.status === "Cancelled" ? "rgba(0,0,0,0.04)" : "white",
                        opacity: slot.status === "Cancelled" ? 0.55 : 1,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
                        {slot.startTime}–{slot.endTime}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25, textDecoration: slot.status === "Cancelled" ? "line-through" : "none" }}>
                        {slot.className}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {slot.instructorName}
                      </p>
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setAddState({ date, dayLabel })}
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px dashed rgba(0,0,0,0.15)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: classes.length === 0 || activeInstructors.length === 0 ? "not-allowed" : "pointer",
                  }}
                  disabled={classes.length === 0 || activeInstructors.length === 0}
                  title={
                    classes.length === 0
                      ? "Add a class in Class Library first"
                      : activeInstructors.length === 0
                        ? "Mark an instructor Active first"
                        : "Add a slot"
                  }
                >
                  + Add slot
                </button>
              </div>
            );
          })}
        </div>
      )}

      {addState && (
        <AddSlotModal
          date={addState.date}
          dayLabel={addState.dayLabel}
          classes={classes}
          instructors={activeInstructors}
          onClose={() => setAddState(null)}
          onSave={(data) => handleAdd({ ...data, date: addState.date, dayLabel: addState.dayLabel })}
        />
      )}

      {editState && (
        <EditSlotModal
          slot={editState}
          classes={classes}
          instructors={activeInstructors}
          onClose={() => setEditState(null)}
          onSave={handleUpdate}
          onDelete={() => handleDelete(editState._id)}
        />
      )}
    </div>
  );
}

// ── Add modal ──────────────────────────────────────────────────────────────
function AddSlotModal({
  date,
  dayLabel,
  classes,
  instructors,
  onClose,
  onSave,
}: {
  date: string;
  dayLabel: string;
  classes: ClassOption[];
  instructors: InstructorOption[];
  onClose: () => void;
  onSave: (data: {
    classId: string;
    className: string;
    categoryName: string;
    instructorId: string;
    instructorName: string;
    startTime: string;
    endTime: string;
    capacity: number;
  }) => void;
}) {
  const [classId, setClassId] = useState(classes[0]?.classId ?? "");
  const [instructorId, setInstructorId] = useState(instructors[0]?.instructorId ?? "");
  const [startTime, setStartTime] = useState("09:00");
  const [capacity, setCapacity] = useState(20);

  const selectedClass = classes.find((c) => c.classId === classId);
  const endTime = selectedClass ? addMinutes(startTime, selectedClass.durationMinutes) : startTime;

  function handleSave() {
    if (!selectedClass) return;
    const ins = instructors.find((i) => i.instructorId === instructorId);
    onSave({
      classId,
      className: selectedClass.name,
      categoryName: selectedClass.categoryName,
      instructorId,
      instructorName: ins?.displayName ?? "",
      startTime,
      endTime,
      capacity,
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <ModalHeader title="Add class slot" subtitle={`${dayLabel} — ${formatDisplayDate(date)}`} onClose={onClose} />
        <SlotForm
          classId={classId}
          setClassId={setClassId}
          instructorId={instructorId}
          setInstructorId={setInstructorId}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          capacity={capacity}
          setCapacity={setCapacity}
          classes={classes}
          instructors={instructors}
        />
        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Add to schedule</button>
        </div>
      </div>
    </div>
  );
}

// ── Edit modal ─────────────────────────────────────────────────────────────
function EditSlotModal({
  slot,
  classes,
  instructors,
  onClose,
  onSave,
  onDelete,
}: {
  slot: SlotDoc;
  classes: ClassOption[];
  instructors: InstructorOption[];
  onClose: () => void;
  onSave: (data: {
    id: Id<"weeklySchedule">;
    startTime: string;
    endTime: string;
    className: string;
    categoryName: string;
    instructorId: string;
    instructorName: string;
    capacity: number;
    status: string;
  }) => void;
  onDelete: () => void;
}) {
  const initialClass = classes.find((c) => c.name === slot.className) ?? classes[0];
  const [classId, setClassId] = useState(initialClass?.classId ?? "");
  const [instructorId, setInstructorId] = useState(slot.instructorId || instructors[0]?.instructorId || "");
  const [startTime, setStartTime] = useState(slot.startTime);
  const [capacity, setCapacity] = useState(slot.capacity);
  const [status, setStatus] = useState<string>(STATUS_OPTIONS.includes(slot.status as (typeof STATUS_OPTIONS)[number]) ? slot.status : "Scheduled");

  const selectedClass = classes.find((c) => c.classId === classId);
  const endTime = selectedClass ? addMinutes(startTime, selectedClass.durationMinutes) : slot.endTime;

  function handleSave() {
    if (!selectedClass) return;
    const ins = instructors.find((i) => i.instructorId === instructorId);
    onSave({
      id: slot._id,
      startTime,
      endTime,
      className: selectedClass.name,
      categoryName: selectedClass.categoryName,
      instructorId,
      instructorName: ins?.displayName ?? slot.instructorName,
      capacity,
      status,
    });
  }

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <ModalHeader title="Edit class slot" subtitle={`${slot.dayOfWeek} — ${formatDisplayDate(slot.date)}`} onClose={onClose} />
        <SlotForm
          classId={classId}
          setClassId={setClassId}
          instructorId={instructorId}
          setInstructorId={setInstructorId}
          startTime={startTime}
          setStartTime={setStartTime}
          endTime={endTime}
          capacity={capacity}
          setCapacity={setCapacity}
          classes={classes}
          instructors={instructors}
        />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 16 }}>
          <label className="field-label">Status</label>
          <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
            Cancelled slots stay in the ops schedule but are hidden on fiitco.ca.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          <button
            type="button"
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "var(--radius-pill)",
              border: "1px solid #D32F2F",
              background: "transparent",
              color: "#D32F2F",
              fontWeight: 600,
              cursor: "pointer",
            }}
            onClick={onDelete}
          >
            Delete
          </button>
          <button type="button" className="btn-primary" style={{ flex: 1 }} onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
}

// ── Shared bits ────────────────────────────────────────────────────────────
function ModalHeader({ title, subtitle, onClose }: { title: string; subtitle: string; onClose: () => void }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>{title}</h2>
        <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>{subtitle}</p>
      </div>
      <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
    </div>
  );
}

function SlotForm({
  classId,
  setClassId,
  instructorId,
  setInstructorId,
  startTime,
  setStartTime,
  endTime,
  capacity,
  setCapacity,
  classes,
  instructors,
}: {
  classId: string;
  setClassId: (v: string) => void;
  instructorId: string;
  setInstructorId: (v: string) => void;
  startTime: string;
  setStartTime: (v: string) => void;
  endTime: string;
  capacity: number;
  setCapacity: (v: number) => void;
  classes: ClassOption[];
  instructors: InstructorOption[];
}) {
  const s: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={s}>
        <label className="field-label">Class</label>
        <select className="field-input" value={classId} onChange={(e) => setClassId(e.target.value)}>
          {classes.map((c) => (
            <option key={c.classId} value={c.classId}>
              {c.name} ({c.categoryName}) — {c.durationMinutes} min
            </option>
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
          <label className="field-label">Start time</label>
          <input type="time" className="field-input" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
        </div>
        <div style={s}>
          <label className="field-label">End time (auto)</label>
          <input type="time" className="field-input" value={endTime} readOnly />
        </div>
      </div>
      <div style={s}>
        <label className="field-label">Capacity</label>
        <input
          type="number"
          min={1}
          max={100}
          className="field-input"
          value={capacity}
          onChange={(e) => setCapacity(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
