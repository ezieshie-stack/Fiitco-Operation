"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type WeekEntry = {
  weekNumber: number;
  classId: string;
  className: string;
  focus: string;
  notes?: string;
};

type JourneyDoc = {
  _id: Id<"clientJourneys">;
  journeyId: string;
  title: string;
  goalType: string;
  pathwayId: string;
  weeks: WeekEntry[];
  active: boolean;
};

type PathwayDoc = {
  _id: Id<"pathways">;
  pathwayId: string;
  title: string;
  durationWeeks: number;
  category: string;
  targetTier: string;
  goal: string;
  description: string;
  active: boolean;
};

type ClassDoc = {
  _id: Id<"classes">;
  classId: string;
  name: string;
  categoryName: string;
  tier: string;
  durationMinutes: number;
  active: boolean;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const GOAL_TYPES = [
  "Skill Building",
  "Strength & Muscle",
  "Flexibility & Recovery",
  "Cardio & Conditioning",
] as const;

const GOAL_COLOR: Record<string, { bg: string; color: string }> = {
  "Skill Building":         { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
  "Strength & Muscle":      { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  "Flexibility & Recovery": { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
  "Cardio & Conditioning":  { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
};

// ─── Empty week factory ───────────────────────────────────────────────────────

function makeEmptyWeek(weekNumber: number): WeekEntry {
  return { weekNumber, classId: "", className: "", focus: "", notes: "" };
}

// ─── Journey Modal ────────────────────────────────────────────────────────────

interface JourneyModalProps {
  editing: JourneyDoc | null;
  journeyCount: number;
  pathways: PathwayDoc[];
  classes: ClassDoc[];
  onClose: () => void;
  onSave: (data: {
    journeyId?: string;
    id?: Id<"clientJourneys">;
    title: string;
    goalType: string;
    pathwayId: string;
    weeks: WeekEntry[];
    active: boolean;
  }) => Promise<void>;
}

function JourneyModal({ editing, journeyCount, pathways, classes, onClose, onSave }: JourneyModalProps) {
  const [title, setTitle]       = useState(editing?.title ?? "");
  const [goalType, setGoalType] = useState(editing?.goalType ?? GOAL_TYPES[0]);
  const [pathwayId, setPathwayId] = useState(editing?.pathwayId ?? (pathways[0]?.pathwayId ?? ""));
  const [active, setActive]     = useState(editing?.active ?? true);
  const [weeks, setWeeks]       = useState<WeekEntry[]>(
    editing?.weeks?.length
      ? editing.weeks.map((w, i) => ({ ...w, weekNumber: i + 1 }))
      : [makeEmptyWeek(1)]
  );
  const [saving, setSaving] = useState(false);

  // Week builder helpers
  const addWeek = () => setWeeks(prev => [...prev, makeEmptyWeek(prev.length + 1)]);

  const removeWeek = (index: number) =>
    setWeeks(prev => prev.filter((_, i) => i !== index).map((w, i) => ({ ...w, weekNumber: i + 1 })));

  const updateWeek = <K extends keyof WeekEntry>(index: number, key: K, value: WeekEntry[K]) =>
    setWeeks(prev => prev.map((w, i) => i === index ? { ...w, [key]: value } : w));

  const handleClassChange = (index: number, classId: string) => {
    const found = classes.find(c => c.classId === classId);
    setWeeks(prev => prev.map((w, i) =>
      i === index ? { ...w, classId, className: found?.name ?? "" } : w
    ));
  };

  const handleSave = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      const cleanedWeeks = weeks.map(w => ({
        weekNumber: w.weekNumber,
        classId: w.classId,
        className: w.className,
        focus: w.focus,
        ...(w.notes ? { notes: w.notes } : {}),
      }));
      if (editing) {
        await onSave({ id: editing._id, title, goalType, pathwayId, weeks: cleanedWeeks, active });
      } else {
        const num = String(journeyCount + 1).padStart(2, "0");
        await onSave({ journeyId: `JRN-${num}`, title, goalType, pathwayId, weeks: cleanedWeeks, active: true });
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 640, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 500, color: "var(--text-main)" }}>
            {editing ? "Edit Journey" : "New Client Journey"}
          </h2>
          <button
            onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--text-muted)", lineHeight: 1 }}
          >
            ×
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Title</label>
          <input
            className="field-input"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="e.g. New to Boxing — 6-Week Starter"
          />
        </div>

        {/* Goal Type + Linked Pathway */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label className="field-label">Goal Type</label>
            <select className="field-input" value={goalType} onChange={e => setGoalType(e.target.value)}>
              {GOAL_TYPES.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Linked Pathway</label>
            <select className="field-input" value={pathwayId} onChange={e => setPathwayId(e.target.value)}>
              <option value="">— No pathway —</option>
              {pathways.map(p => (
                <option key={p.pathwayId} value={p.pathwayId}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Active checkbox (edit mode only) */}
        {editing && (
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "var(--text-main)" }}>
              <input
                type="checkbox"
                checked={active}
                onChange={e => setActive(e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--ui-dark)", cursor: "pointer" }}
              />
              Active
            </label>
          </div>
        )}

        {/* Week Builder */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <label className="field-label" style={{ margin: 0 }}>Weeks</label>
            <button
              type="button"
              onClick={addWeek}
              style={{
                fontSize: 13, fontWeight: 600, padding: "5px 14px",
                borderRadius: "var(--radius-pill)", border: "1px solid var(--border-soft)",
                background: "var(--bg-beige)", color: "var(--text-main)", cursor: "pointer",
              }}
            >
              + Add Week
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {weeks.map((week, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "32px 1fr 1fr 1fr 28px",
                  gap: 8,
                  alignItems: "center",
                  background: "var(--bg-beige)",
                  borderRadius: 10,
                  padding: "10px 12px",
                }}
              >
                {/* Week number badge */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: "var(--ui-dark)", color: "#fff",
                  fontSize: 11, fontWeight: 700,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {week.weekNumber}
                </div>

                {/* Class select */}
                <select
                  className="field-input"
                  style={{ fontSize: 13, padding: "6px 10px" }}
                  value={week.classId}
                  onChange={e => handleClassChange(index, e.target.value)}
                >
                  <option value="">Select class…</option>
                  {classes.map(c => (
                    <option key={c.classId} value={c.classId}>{c.name}</option>
                  ))}
                </select>

                {/* Focus */}
                <input
                  className="field-input"
                  style={{ fontSize: 13, padding: "6px 10px" }}
                  value={week.focus}
                  onChange={e => updateWeek(index, "focus", e.target.value)}
                  placeholder="Focus…"
                />

                {/* Notes */}
                <input
                  className="field-input"
                  style={{ fontSize: 13, padding: "6px 10px" }}
                  value={week.notes ?? ""}
                  onChange={e => updateWeek(index, "notes", e.target.value)}
                  placeholder="Notes (optional)"
                />

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => removeWeek(index)}
                  style={{
                    width: 24, height: 24, borderRadius: "50%",
                    border: "none", background: "var(--tag-red-bg)", color: "var(--tag-red-txt)",
                    fontSize: 16, cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ×
                </button>
              </div>
            ))}

            {weeks.length === 0 && (
              <p style={{ fontSize: 13, color: "var(--text-muted)", padding: "10px 0", textAlign: "center" }}>
                No weeks added yet — click &quot;+ Add Week&quot; above.
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose} disabled={saving}>Cancel</button>
          <button
            onClick={handleSave}
            disabled={saving || !title.trim()}
            style={{
              padding: "9px 22px", borderRadius: "var(--radius-pill)", fontSize: 14, fontWeight: 600,
              background: "var(--ui-dark)", color: "#fff", border: "none",
              cursor: saving || !title.trim() ? "not-allowed" : "pointer",
              opacity: saving || !title.trim() ? 0.6 : 1,
            }}
          >
            {saving ? "Saving…" : editing ? "Save Changes" : "Create Journey"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ClientJourneyPage() {
  const { currentUser } = useAuth();

  const journeys = (useQuery(api.queries.getClientJourneys) ?? []) as JourneyDoc[];
  const pathways = (useQuery(api.queries.getPathways)       ?? []) as PathwayDoc[];
  const classes  = (useQuery(api.queries.getClasses)        ?? []) as ClassDoc[];

  const addJourney    = useMutation(api.mutations.addClientJourney);
  const updateJourney = useMutation(api.mutations.updateClientJourney);
  const deleteJourney = useMutation(api.mutations.deleteClientJourney);
  const submitChange  = useMutation(api.mutations.submitPendingChange);

  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [showModal, setShowModal]   = useState(false);
  const [editing, setEditing]       = useState<JourneyDoc | null>(null);

  // Inline delete confirm state: stores the _id of the journey pending confirmation
  const [confirmDeleteId, setConfirmDeleteId] = useState<Id<"clientJourneys"> | null>(null);

  const [statusMsg, setStatusMsg] = useState<{
    type: "success" | "pending" | "error";
    text: string;
  } | null>(null);

  function showStatus(msg: { type: "success" | "pending" | "error"; text: string }) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  // Build a lookup map for pathway names
  const pathwayMap = new Map(pathways.map(p => [p.pathwayId, p]));

  // ── Save handler ───────────────────────────────────────────────────────────

  const handleSave = async (data: {
    journeyId?: string;
    id?: Id<"clientJourneys">;
    title: string;
    goalType: string;
    pathwayId: string;
    weeks: WeekEntry[];
    active: boolean;
  }) => {
    const { id, journeyId, title, goalType, pathwayId, weeks, active } = data;

    if (currentUser?.role === "admin") {
      if (id) {
        await updateJourney({ id, title, goalType, pathwayId, weeks, active });
      } else {
        const num = String(journeys.length + 1).padStart(2, "0");
        await addJourney({ journeyId: journeyId ?? `JRN-${num}`, title, goalType, pathwayId, weeks });
      }
      showStatus({ type: "success", text: "Journey saved successfully" });
    } else {
      await submitChange({
        tableName: "clientJourneys",
        action: id ? "update" : "add",
        entityId: id ? String(id) : undefined,
        payload: id
          ? { title, goalType, pathwayId, weeks, active }
          : { journeyId: journeyId ?? `JRN-${Date.now()}`, title, goalType, pathwayId, weeks, active: true },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `${id ? "Update" : "Add"} journey: ${title}`,
      });
      showStatus({ type: "pending", text: "Submitted for admin review ✓" });
    }

    setShowModal(false);
    setEditing(null);
  };

  // ── Delete handler ─────────────────────────────────────────────────────────

  const handleDelete = async (id: Id<"clientJourneys">) => {
    if (currentUser?.role === "admin") {
      await deleteJourney({ id });
      showStatus({ type: "success", text: "Journey deleted successfully" });
    } else {
      await submitChange({
        tableName: "clientJourneys",
        action: "delete",
        entityId: String(id),
        payload: { id },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: "Delete journey",
      });
      showStatus({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setConfirmDeleteId(null);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div style={{ width: "100%" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h1 className="font-serif page-title">Client Journey</h1>
          <p className="page-subtitle">
            Structured member progression paths — from first class to advanced training.
          </p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowModal(true); }}
          style={{
            marginTop: 8,
            padding: "10px 20px",
            borderRadius: "var(--radius-pill)",
            background: "var(--ui-dark)",
            color: "#fff",
            border: "none",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            flexShrink: 0,
            whiteSpace: "nowrap",
          }}
        >
          + New Journey
        </button>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div
          style={{
            padding: "10px 16px",
            borderRadius: 8,
            marginBottom: 16,
            fontSize: 14,
            fontWeight: 500,
            background:
              statusMsg.type === "success" ? "#E8F5E9"
              : statusMsg.type === "pending" ? "#E3F2FD"
              : "#FFEBEE",
            color:
              statusMsg.type === "success" ? "#2E7D32"
              : statusMsg.type === "pending" ? "#1565C0"
              : "#C62828",
            border: `1px solid ${
              statusMsg.type === "success" ? "#A5D6A7"
              : statusMsg.type === "pending" ? "#90CAF9"
              : "#EF9A9A"
            }`,
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Empty state */}
      {journeys.length === 0 ? (
        <div
          className="hatch"
          style={{
            borderRadius: 16,
            minHeight: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            No journeys yet — click New Journey to create one
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
          {journeys.map(journey => {
            const goalStyle = GOAL_COLOR[journey.goalType] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
            const linkedPathway = pathwayMap.get(journey.pathwayId);
            const isHovered = hoveredId === journey._id;
            const isPendingDelete = confirmDeleteId === journey._id;

            return (
              <div
                key={journey._id}
                style={{
                  background: "var(--bg-panel)",
                  borderRadius: "var(--radius-card)",
                  overflow: "hidden",
                  boxShadow: isHovered ? "0 4px 20px rgba(0,0,0,0.07)" : "0 2px 12px rgba(0,0,0,0.04)",
                  transition: "box-shadow 0.15s",
                  position: "relative",
                }}
                onMouseEnter={() => setHoveredId(journey._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Goal type accent bar */}
                <div style={{ height: 4, background: goalStyle.color }} />

                {/* Card header */}
                <div
                  style={{
                    padding: "20px 26px 16px",
                    borderBottom: "1px solid var(--border-soft)",
                    position: "relative",
                  }}
                >
                  {/* Edit / Delete controls — visible on hover */}
                  <div
                    style={{
                      position: "absolute",
                      top: 16,
                      right: 20,
                      display: "flex",
                      gap: 8,
                      alignItems: "center",
                      opacity: isHovered ? 1 : 0,
                      transition: "opacity 0.15s",
                      pointerEvents: isHovered ? "auto" : "none",
                      zIndex: 2,
                    }}
                  >
                    {isPendingDelete ? (
                      // Inline delete confirm
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, color: "var(--tag-red-txt)", fontWeight: 600 }}>
                          Confirm delete?
                        </span>
                        <button
                          onClick={() => handleDelete(journey._id)}
                          style={{
                            fontSize: 12, fontWeight: 700, padding: "4px 10px",
                            borderRadius: "var(--radius-pill)", border: "none",
                            background: "var(--tag-red-bg)", color: "var(--tag-red-txt)", cursor: "pointer",
                          }}
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          style={{
                            fontSize: 12, fontWeight: 600, padding: "4px 10px",
                            borderRadius: "var(--radius-pill)", border: "1px solid var(--border-soft)",
                            background: "var(--bg-beige)", color: "var(--text-muted)", cursor: "pointer",
                          }}
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={() => { setEditing(journey); setShowModal(true); }}
                          title="Edit"
                          style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: "var(--bg-beige)", border: "none",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 14, color: "var(--text-muted)",
                          }}
                        >
                          ✏
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(journey._id)}
                          title="Delete"
                          style={{
                            width: 30, height: 30, borderRadius: "50%",
                            background: "var(--tag-red-bg)", border: "none",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 16, color: "var(--tag-red-txt)",
                          }}
                        >
                          ×
                        </button>
                      </>
                    )}
                  </div>

                  {/* Tags row */}
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8, flexWrap: "wrap" }}>
                    {/* Goal type badge */}
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700,
                        background: goalStyle.bg, color: goalStyle.color,
                        padding: "4px 10px", borderRadius: "var(--radius-pill)",
                      }}
                    >
                      {journey.goalType}
                    </span>

                    {/* Active badge */}
                    <span
                      style={{
                        fontSize: 11, fontWeight: 700,
                        background: journey.active ? "var(--tag-green-bg)" : "var(--bg-beige)",
                        color: journey.active ? "var(--tag-green-txt)" : "var(--text-muted)",
                        padding: "4px 10px", borderRadius: "var(--radius-pill)",
                      }}
                    >
                      {journey.active ? "Active" : "Inactive"}
                    </span>

                    {/* Week count */}
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                      {journey.weeks.length} week{journey.weeks.length !== 1 ? "s" : ""}
                    </span>

                    {/* Journey ID */}
                    <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>
                      {journey.journeyId}
                    </span>
                  </div>

                  {/* Title */}
                  <p
                    className="font-serif"
                    style={{ fontSize: 20, fontWeight: 500, color: "var(--text-main)", marginBottom: 4, lineHeight: 1.2 }}
                  >
                    {journey.title}
                  </p>

                  {/* Linked pathway */}
                  {linkedPathway && (
                    <p style={{ fontSize: 12, color: "var(--text-muted)", fontWeight: 500 }}>
                      Pathway: {linkedPathway.title}
                      {linkedPathway.durationWeeks ? ` · ${linkedPathway.durationWeeks}w` : ""}
                    </p>
                  )}
                </div>

                {/* Week grid */}
                {journey.weeks.length > 0 && (
                  <div style={{ padding: "18px 26px 22px" }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fill, minmax(155px, 1fr))",
                        gap: 10,
                      }}
                    >
                      {journey.weeks.map((week, i) => (
                        <div
                          key={i}
                          style={{
                            background: "var(--bg-app)",
                            borderRadius: 12,
                            padding: "12px 14px",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                            <span
                              style={{
                                width: 22, height: 22, borderRadius: "50%",
                                background: goalStyle.color, color: "#fff",
                                fontSize: 10, fontWeight: 700,
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                              }}
                            >
                              {week.weekNumber}
                            </span>
                            <p style={{ fontSize: 12, fontWeight: 600, color: "var(--text-main)", lineHeight: 1.3 }}>
                              {week.focus || <span style={{ color: "var(--text-muted)", fontStyle: "italic" }}>No focus set</span>}
                            </p>
                          </div>
                          {week.className && (
                            <p style={{ fontSize: 11, color: "var(--tag-blue-txt)", fontWeight: 500, marginBottom: week.notes ? 4 : 0 }}>
                              {week.className}
                            </p>
                          )}
                          {week.notes && (
                            <p style={{ fontSize: 10, color: "var(--text-muted)", lineHeight: 1.4, fontStyle: "italic" }}>
                              {week.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <JourneyModal
          editing={editing}
          journeyCount={journeys.length}
          pathways={pathways}
          classes={classes}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
