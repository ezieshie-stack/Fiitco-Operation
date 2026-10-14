"use client";

/**
 * Website Schedule admin — manages the recurring weekly schedule rendered
 * on fiitco.ca's "FIIT Co Schedule" homepage section.
 *
 * Reads/writes the `websiteSchedule` Convex table (recurring template,
 * one row per class per day of week). Deliberately separate from the
 * date-specific `weeklySchedule` the ops /schedule page edits.
 *
 * Scope: light editor — day of week, time, class, category, instructor,
 * display order, active toggle. Delete hard-removes a row. Customers
 * see edits on fiitco.ca within seconds (the public listActiveWebsiteSchedule
 * query is unauthenticated).
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
const DAYS_OF_WEEK = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
] as const;
type DayOfWeek = (typeof DAYS_OF_WEEK)[number];

type ScheduleEntry = {
  _id: Id<"websiteSchedule">;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  className: string;
  categoryName: string;
  instructorName: string;
  displayOrder: number;
  active: boolean;
};

function to12Hour(time: string): string {
  const [hStr, m] = time.split(":");
  const h = Number(hStr);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return m === "00" ? `${hour12}${period}` : `${hour12}:${m}${period}`;
}

// ── page ───────────────────────────────────────────────────────────────────
export default function WebsiteSchedulePage() {
  const { ready } = useRequireAdmin();

  const entries = useQuery(api.websiteContent.listWebsiteSchedule) as
    | ScheduleEntry[]
    | undefined;

  const createEntry = useMutation(api.websiteContent.createWebsiteScheduleEntry);
  const updateEntry = useMutation(api.websiteContent.updateWebsiteScheduleEntry);
  const deleteEntry = useMutation(api.websiteContent.deleteWebsiteScheduleEntry);

  const [addState, setAddState] = useState<{ dayOfWeek: DayOfWeek } | null>(null);
  const [editState, setEditState] = useState<ScheduleEntry | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const grouped = useMemo(() => {
    const map: Record<string, ScheduleEntry[]> = {};
    if (!entries) return map;
    for (const e of entries) {
      if (!map[e.dayOfWeek]) map[e.dayOfWeek] = [];
      map[e.dayOfWeek].push(e);
    }
    for (const k of Object.keys(map)) {
      map[k].sort((a, b) => a.startTime.localeCompare(b.startTime));
    }
    return map;
  }, [entries]);

  function flash(type: "ok" | "err", text: string) {
    setStatusMsg({ type, text });
    setTimeout(() => setStatusMsg(null), 3500);
  }

  async function handleAdd(data: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    className: string;
    categoryName: string;
    instructorName: string;
    displayOrder: number;
    active: boolean;
  }) {
    try {
      await createEntry(data);
      setAddState(null);
      flash("ok", `Added ${data.className} on ${data.dayOfWeek}.`);
    } catch (e) {
      flash("err", (e as Error).message ?? "Failed to add entry.");
    }
  }

  async function handleUpdate(data: {
    id: Id<"websiteSchedule">;
    dayOfWeek: string;
    startTime: string;
    endTime: string;
    className: string;
    categoryName: string;
    instructorName: string;
    displayOrder: number;
    active: boolean;
  }) {
    try {
      await updateEntry(data);
      setEditState(null);
      flash("ok", "Saved.");
    } catch (e) {
      flash("err", (e as Error).message ?? "Failed to save.");
    }
  }

  async function handleDelete(id: Id<"websiteSchedule">) {
    const yes = window.confirm(
      "Delete this slot? This removes it from fiitco.ca immediately.",
    );
    if (!yes) return;
    try {
      await deleteEntry({ id });
      setEditState(null);
      flash("ok", "Deleted.");
    } catch (e) {
      flash("err", (e as Error).message ?? "Failed to delete.");
    }
  }

  if (!ready) return null;
  const loading = entries === undefined;

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
          Recurring weekly schedule shown on fiitco.ca. Edits appear on the
          public site within seconds. Toggle a row inactive to hide it
          without deleting; delete removes it everywhere.
        </p>
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
          {DAYS_OF_WEEK.map((day) => {
            const dayEntries = grouped[day] ?? [];
            return (
              <div
                key={day}
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
                    {day.slice(0, 3)}
                  </p>
                  <p style={{ fontSize: 15, fontWeight: 600 }}>{day}</p>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
                  {dayEntries.map((entry) => (
                    <button
                      key={entry._id}
                      type="button"
                      onClick={() => setEditState(entry)}
                      style={{
                        textAlign: "left",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid rgba(0,0,0,0.08)",
                        background: entry.active ? "white" : "rgba(0,0,0,0.04)",
                        opacity: entry.active ? 1 : 0.55,
                        cursor: "pointer",
                        fontFamily: "inherit",
                      }}
                    >
                      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>
                        {to12Hour(entry.startTime)}–{to12Hour(entry.endTime)}
                      </p>
                      <p style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.25 }}>
                        {entry.className}
                      </p>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        {entry.instructorName}
                      </p>
                      {!entry.active && (
                        <p style={{ fontSize: 10, color: "var(--text-muted)", marginTop: 4, fontStyle: "italic" }}>
                          Hidden from site
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setAddState({ dayOfWeek: day })}
                  style={{
                    marginTop: 8,
                    padding: "6px 10px",
                    borderRadius: 8,
                    border: "1px dashed rgba(0,0,0,0.15)",
                    background: "transparent",
                    color: "var(--text-muted)",
                    fontSize: 12,
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                >
                  + Add slot
                </button>
              </div>
            );
          })}
        </div>
      )}

      {addState && (
        <EntryModal
          mode="add"
          initial={{
            dayOfWeek: addState.dayOfWeek,
            startTime: "09:00",
            endTime: "10:00",
            className: "",
            categoryName: "",
            instructorName: "",
            displayOrder: 0,
            active: true,
          }}
          onClose={() => setAddState(null)}
          onSave={(data) => handleAdd(data)}
        />
      )}

      {editState && (
        <EntryModal
          mode="edit"
          initial={{
            dayOfWeek: editState.dayOfWeek,
            startTime: editState.startTime,
            endTime: editState.endTime,
            className: editState.className,
            categoryName: editState.categoryName,
            instructorName: editState.instructorName,
            displayOrder: editState.displayOrder,
            active: editState.active,
          }}
          onClose={() => setEditState(null)}
          onSave={(data) => handleUpdate({ id: editState._id, ...data })}
          onDelete={() => handleDelete(editState._id)}
        />
      )}
    </div>
  );
}

// ── Add / Edit modal ──────────────────────────────────────────────────────
type Form = {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  className: string;
  categoryName: string;
  instructorName: string;
  displayOrder: number;
  active: boolean;
};

function EntryModal({
  mode,
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  mode: "add" | "edit";
  initial: Form;
  onClose: () => void;
  onSave: (data: Form) => void;
  onDelete?: () => void;
}) {
  const [f, setF] = useState<Form>(initial);
  const s: React.CSSProperties = { display: "flex", flexDirection: "column", gap: 6 };

  function set<K extends keyof Form>(k: K, v: Form[K]) {
    setF((prev) => ({ ...prev, [k]: v }));
  }

  const canSave = f.className.trim() && f.instructorName.trim() && f.startTime < f.endTime;

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>
              {mode === "add" ? "Add schedule entry" : "Edit schedule entry"}
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: 14, marginTop: 4 }}>
              Recurring weekly — shows on fiitco.ca immediately
            </p>
          </div>
          <button type="button" onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={s}>
            <label className="field-label">Day of week</label>
            <select className="field-input" value={f.dayOfWeek} onChange={(e) => set("dayOfWeek", e.target.value)}>
              {DAYS_OF_WEEK.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div style={s}>
              <label className="field-label">Start time</label>
              <input type="time" className="field-input" value={f.startTime} onChange={(e) => set("startTime", e.target.value)} />
            </div>
            <div style={s}>
              <label className="field-label">End time</label>
              <input type="time" className="field-input" value={f.endTime} onChange={(e) => set("endTime", e.target.value)} />
            </div>
          </div>

          <div style={s}>
            <label className="field-label">Class name</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. FIIT Hybrid"
              value={f.className}
              onChange={(e) => set("className", e.target.value)}
            />
          </div>

          <div style={s}>
            <label className="field-label">Category</label>
            <input
              type="text"
              className="field-input"
              placeholder="e.g. Hybrid, Boxing, Strength"
              value={f.categoryName}
              onChange={(e) => set("categoryName", e.target.value)}
            />
          </div>

          <div style={s}>
            <label className="field-label">Instructor name</label>
            <input
              type="text"
              className="field-input"
              placeholder="Shown on the card"
              value={f.instructorName}
              onChange={(e) => set("instructorName", e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, alignItems: "end" }}>
            <div style={s}>
              <label className="field-label">Display order</label>
              <input
                type="number"
                className="field-input"
                value={f.displayOrder}
                onChange={(e) => set("displayOrder", Number(e.target.value))}
              />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", paddingBottom: 10 }}>
              <input type="checkbox" checked={f.active} onChange={(e) => set("active", e.target.checked)} />
              <span style={{ fontSize: 14, fontWeight: 500 }}>Active (visible on fiitco.ca)</span>
            </label>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button type="button" className="btn-ghost" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
          {mode === "edit" && onDelete && (
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
          )}
          <button
            type="button"
            className="btn-primary"
            style={{ flex: 1 }}
            disabled={!canSave}
            onClick={() => canSave && onSave(f)}
          >
            {mode === "add" ? "Add" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
