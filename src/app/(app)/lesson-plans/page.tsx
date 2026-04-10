"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  Draft:     { bg: "var(--bg-beige)",      color: "var(--text-muted)",     label: "Draft" },
  Submitted: { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)", label: "Pending Review" },
  Approved:  { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)",  label: "Approved" },
};

const BLOCK_COLOR: Record<string, string> = {
  "Warm-Up":   "var(--tag-green-txt)",
  Technique:   "var(--tag-blue-txt)",
  Strength:    "var(--tag-red-txt)",
  Accessory:   "var(--tag-purple-txt)",
  Boxing:      "var(--tag-blue-txt)",
  Circuit:     "var(--tag-purple-txt)",
  Main:        "var(--tag-red-txt)",
  Core:        "var(--tag-yellow-txt)",
  "Cool-Down": "var(--text-muted)",
};

const BLOCK_TYPES = [
  "Warm-Up", "Technique", "Strength", "Accessory",
  "Boxing", "Circuit", "Main", "Core", "Cool-Down",
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Block {
  blockType: string;
  exerciseName?: string;
  durationMinutes: number;
  description: string;
  instructions: string;
  equipment: string[];
}

interface BlockDraft {
  blockType: string;
  exerciseName: string;
  durationMinutes: number;
  description: string;
  instructions: string;
  equipment: string;
}

const emptyBlock = (): BlockDraft => ({
  blockType: "Warm-Up",
  exerciseName: "",
  durationMinutes: 10,
  description: "",
  instructions: "",
  equipment: "",
});

// ─── Modal ────────────────────────────────────────────────────────────────────

interface ModalProps {
  plan?: {
    _id: Id<"classPrograms">;
    classId: string;
    className: string;
    instructorId: string;
    instructorName: string;
    weekOf: string;
    status: string;
    notes?: string;
    blocks: Block[];
  } | null;
  classes: { _id: Id<"classes">; name: string }[];
  instructors: { _id: Id<"instructors">; name: string }[];
  onClose: () => void;
  onSave: (data: {
    classId: string;
    className: string;
    instructorId: string;
    instructorName: string;
    weekOf: string;
    status: string;
    notes?: string;
    blocks: Block[];
  }) => Promise<void>;
}

function PlanModal({ plan, classes, instructors, onClose, onSave }: ModalProps) {
  const [classId, setClassId]           = useState(plan?.classId ?? (classes[0]?._id ?? ""));
  const [instructorId, setInstructorId] = useState(plan?.instructorId ?? (instructors[0]?._id ?? ""));
  const [weekOf, setWeekOf]             = useState(plan?.weekOf ?? "");
  const [status, setStatus]             = useState(plan?.status ?? "Draft");
  const [notes, setNotes]               = useState(plan?.notes ?? "");
  const [blocks, setBlocks]             = useState<BlockDraft[]>(
    plan?.blocks.map(b => ({
      blockType: b.blockType,
      exerciseName: b.exerciseName ?? "",
      durationMinutes: b.durationMinutes,
      description: b.description,
      instructions: b.instructions,
      equipment: b.equipment.join(", "),
    })) ?? [emptyBlock()]
  );
  const [saving, setSaving] = useState(false);

  const updateBlock = (i: number, field: keyof BlockDraft, value: string | number) => {
    setBlocks(prev => prev.map((b, idx) => idx === i ? { ...b, [field]: value } : b));
  };

  const removeBlock = (i: number) => setBlocks(prev => prev.filter((_, idx) => idx !== i));
  const addBlock    = () => setBlocks(prev => [...prev, emptyBlock()]);

  const handleSave = async () => {
    if (!classId || !instructorId || !weekOf) return;
    const selectedClass      = classes.find(c => c._id === classId);
    const selectedInstructor = instructors.find(i => i._id === instructorId);
    if (!selectedClass || !selectedInstructor) return;

    setSaving(true);
    await onSave({
      classId,
      className: selectedClass.name,
      instructorId,
      instructorName: selectedInstructor.name,
      weekOf,
      status,
      notes: notes || undefined,
      blocks: blocks.map(b => ({
        blockType: b.blockType,
        exerciseName: b.exerciseName || undefined,
        durationMinutes: Number(b.durationMinutes),
        description: b.description,
        instructions: b.instructions,
        equipment: b.equipment ? b.equipment.split(",").map(e => e.trim()).filter(Boolean) : [],
      })),
    });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 680, width: "100%", maxHeight: "90vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 500, color: "var(--text-main)" }}>
            {plan ? "Edit Plan" : "New Lesson Plan"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        {/* Core fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
          <div>
            <label className="field-label">Class</label>
            <select className="field-input" value={classId} onChange={e => setClassId(e.target.value)}>
              {classes.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Instructor</label>
            <select className="field-input" value={instructorId} onChange={e => setInstructorId(e.target.value)}>
              {instructors.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Week Of</label>
            <input className="field-input" type="date" value={weekOf} onChange={e => setWeekOf(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Status</label>
            <select className="field-input" value={status} onChange={e => setStatus(e.target.value)}>
              <option value="Draft">Draft</option>
              <option value="Submitted">Submitted</option>
            </select>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="field-label">Notes (optional)</label>
          <textarea
            className="field-input"
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            style={{ resize: "vertical" }}
            placeholder="Any notes or context for this plan…"
          />
        </div>

        {/* Blocks */}
        <div style={{ borderTop: "1px solid var(--border-soft)", paddingTop: 20, marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
            <p style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)" }}>Blocks</p>
            <button
              type="button"
              onClick={addBlock}
              style={{
                fontSize: 12, fontWeight: 600, padding: "5px 14px", borderRadius: "var(--radius-pill)",
                background: "var(--bg-beige)", border: "none", cursor: "pointer", color: "var(--text-main)",
              }}
            >
              + Add Block
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {blocks.map((b, i) => {
              const col = BLOCK_COLOR[b.blockType] ?? "var(--text-muted)";
              return (
                <div key={i} style={{ background: "var(--bg-app)", borderRadius: 12, padding: "14px 16px", borderLeft: `3px solid ${col}` }}>
                  <div style={{ display: "flex", gap: 10, marginBottom: 10, alignItems: "center" }}>
                    <select
                      className="field-input"
                      value={b.blockType}
                      onChange={e => updateBlock(i, "blockType", e.target.value)}
                      style={{ flex: "0 0 160px" }}
                    >
                      {BLOCK_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <input
                      className="field-input"
                      type="number"
                      min={1}
                      value={b.durationMinutes}
                      onChange={e => updateBlock(i, "durationMinutes", e.target.value)}
                      style={{ flex: "0 0 90px" }}
                      placeholder="Mins"
                    />
                    <input
                      className="field-input"
                      value={b.exerciseName}
                      onChange={e => updateBlock(i, "exerciseName", e.target.value)}
                      style={{ flex: 1 }}
                      placeholder="Exercise name (optional)"
                    />
                    <button
                      type="button"
                      onClick={() => removeBlock(i)}
                      style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)", flexShrink: 0, lineHeight: 1, padding: "0 4px" }}
                    >×</button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 8 }}>
                    <input
                      className="field-input"
                      value={b.description}
                      onChange={e => updateBlock(i, "description", e.target.value)}
                      placeholder="Description"
                    />
                    <input
                      className="field-input"
                      value={b.instructions}
                      onChange={e => updateBlock(i, "instructions", e.target.value)}
                      placeholder="Instructions"
                    />
                  </div>
                  <input
                    className="field-input"
                    value={b.equipment}
                    onChange={e => updateBlock(i, "equipment", e.target.value)}
                    placeholder="Equipment (comma-separated)"
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !classId || !instructorId || !weekOf}
          >
            {saving ? "Saving…" : "Save Plan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm Modal ─────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 400, width: "100%", padding: 32 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-serif" style={{ fontSize: 20, marginBottom: 10, color: "var(--text-main)" }}>Delete Lesson Plan?</h3>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
          This action cannot be undone. All blocks in this plan will be permanently removed.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            onClick={onConfirm}
            style={{
              padding: "9px 22px", borderRadius: "var(--radius-pill)", fontSize: 14, fontWeight: 600,
              background: "var(--tag-red-bg)", color: "var(--tag-red-txt)", border: "none", cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LessonPlansPage() {
  const { currentUser } = useAuth();

  const plans          = useQuery(api.queries.getClassPrograms) ?? [];
  const classes        = useQuery(api.queries.getClasses)       ?? [];
  const instructorsRaw = useQuery(api.queries.getInstructors)   ?? [];
  const instructors    = instructorsRaw.map(i => ({ _id: i._id, name: i.fullName }));

  const addPlan      = useMutation(api.mutations.addClassProgram);
  const updatePlan   = useMutation(api.mutations.updateClassProgram);
  const deletePlan   = useMutation(api.mutations.deleteClassProgram);
  const approvePlan  = useMutation(api.mutations.approveClassProgram);
  const submitChange = useMutation(api.mutations.submitPendingChange);

  const [filterStatus, setFilterStatus] = useState("All");
  const [expanded, setExpanded]         = useState<string | null>(null);
  const [hoveredId, setHoveredId]       = useState<string | null>(null);
  const [statusMsg, setStatusMsg]       = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  const [showModal, setShowModal]         = useState(false);
  const [editingPlan, setEditingPlan]     = useState<typeof plans[number] | null>(null);
  const [deletingId, setDeletingId]       = useState<Id<"classPrograms"> | null>(null);

  const statuses = ["All", "Approved", "Submitted", "Draft"];

  const filtered = plans
    .filter(p => filterStatus === "All" || p.status === filterStatus)
    .sort((a, b) => {
      const order: Record<string, number> = { Submitted: 0, Draft: 1, Approved: 2 };
      return (order[a.status] ?? 3) - (order[b.status] ?? 3);
    });

  const approved = plans.filter(p => p.status === "Approved").length;
  const pending  = plans.filter(p => p.status === "Submitted").length;
  const drafts   = plans.filter(p => p.status === "Draft").length;

  const handleSave = async (data: {
    classId: string;
    className: string;
    instructorId: string;
    instructorName: string;
    weekOf: string;
    status: string;
    notes?: string;
    blocks: {
      blockType: string;
      exerciseName?: string;
      durationMinutes: number;
      description: string;
      instructions: string;
      equipment: string[];
    }[];
  }) => {
    if (currentUser?.role === "admin") {
      if (editingPlan) {
        await updatePlan({ id: editingPlan._id, ...data });
      } else {
        await addPlan(data);
      }
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "classPrograms",
        action: editingPlan ? "update" : "add",
        entityId: editingPlan ? String(editingPlan._id) : undefined,
        payload: editingPlan ? { id: editingPlan._id, ...data } : data,
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: editingPlan
          ? `Update lesson plan: ${data.className}`
          : `Add lesson plan: ${data.className}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setShowModal(false);
    setEditingPlan(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    if (currentUser?.role === "admin") {
      await deletePlan({ id: deletingId });
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "classPrograms",
        action: "delete",
        entityId: String(deletingId),
        payload: { id: deletingId },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Delete lesson plan: ${deletingId}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setDeletingId(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleApprove = async (id: Id<"classPrograms">) => {
    await approvePlan({ id, approvedBy: "Arden" });
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h1 className="font-serif page-title" style={{ fontSize: 40 }}>Lesson Plans</h1>
          <p className="page-subtitle">Instructor-submitted class programmes — review and approve before each session.</p>
        </div>
        <button
          className="btn-primary"
          style={{ marginTop: 8, flexShrink: 0 }}
          onClick={() => { setEditingPlan(null); setShowModal(true); }}
        >
          + New Plan
        </button>
      </div>

      {/* Status banner */}
      {statusMsg && (
        <div style={{
          padding: "10px 16px",
          borderRadius: 8,
          marginBottom: 16,
          fontSize: 14,
          background: statusMsg.type === "success" ? "#E8F5E9" : statusMsg.type === "pending" ? "#E3F2FD" : "#FFEBEE",
          color: statusMsg.type === "success" ? "#2E7D32" : statusMsg.type === "pending" ? "#1565C0" : "#C62828",
          border: `1px solid ${statusMsg.type === "success" ? "#A5D6A7" : statusMsg.type === "pending" ? "#90CAF9" : "#EF9A9A"}`,
        }}>
          {statusMsg.text}
        </div>
      )}

      {/* Stat row */}
      <div className="lesson-stat-grid" style={{ display: "grid", gap: 14, marginBottom: 28 }}>
        {[
          { label: "Total Plans",    value: plans.length, color: "var(--text-main)" },
          { label: "Approved",       value: approved,     color: "var(--tag-green-txt)" },
          { label: "Pending Review", value: pending,      color: "var(--tag-yellow-txt)" },
          { label: "Drafts",         value: drafts,       color: "var(--text-muted)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24 }}>
        {statuses.map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: "7px 18px", borderRadius: "var(--radius-pill)", fontSize: 13, fontWeight: 500,
              border: "none", cursor: "pointer", transition: "all 0.15s",
              background: filterStatus === s ? "var(--ui-dark)" : "var(--bg-beige)",
              color: filterStatus === s ? "#fff" : "var(--text-muted)",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Plan list */}
      {filtered.length === 0 ? (
        <div className="hatch" style={{ borderRadius: 16, minHeight: 120, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No plans found — add a new plan or change the filter.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map(plan => {
            const ss        = STATUS_STYLE[plan.status] ?? STATUS_STYLE.Draft;
            const isOpen    = expanded === plan._id;
            const isHovered = hoveredId === plan._id;
            const totalMins = plan.blocks.reduce((s, b) => s + b.durationMinutes, 0);

            return (
              <div
                key={plan._id}
                style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.03)", position: "relative" }}
                onMouseEnter={() => setHoveredId(plan._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Collapsed header */}
                <div className="plan-card-header" style={{ display: "flex", alignItems: "center" }}>
                  {/* Clickable area */}
                  <button
                    className="plan-card-btn"
                    onClick={() => setExpanded(isOpen ? null : plan._id)}
                    style={{ display: "flex", alignItems: "center", background: "none", border: "none", cursor: "pointer", textAlign: "left", flex: 1, minWidth: 0 }}
                  >
                    <span className="plan-card-badge" style={{ fontSize: 11, fontWeight: 700, background: ss.bg, color: ss.color, padding: "5px 12px", borderRadius: "var(--radius-pill)" }}>
                      {ss.label}
                    </span>
                    <p className="font-serif plan-card-title" style={{ fontSize: 18, fontWeight: 500, color: "var(--text-main)", flex: 1, textAlign: "left" }}>
                      {plan.className}
                    </p>
                    <div className="plan-card-meta" style={{ display: "flex", alignItems: "center" }}>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>{plan.instructorName}</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Week of {plan.weekOf}</p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>{plan.blocks.length} blocks</p>
                        <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{totalMins} min total</p>
                      </div>
                      <span style={{ fontSize: 18, color: "var(--text-muted)", transition: "transform 0.2s", display: "block", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
                    </div>
                  </button>

                  {/* Action buttons — visible on hover */}
                  <div
                    style={{
                      display: "flex", gap: 6, alignItems: "center", flexShrink: 0,
                      opacity: isHovered ? 1 : 0, transition: "opacity 0.15s",
                      pointerEvents: isHovered ? "auto" : "none",
                    }}
                  >
                    {plan.status === "Submitted" && (
                      <button
                        onClick={() => handleApprove(plan._id)}
                        title="Approve"
                        style={{
                          fontSize: 12, fontWeight: 700, padding: "5px 12px", borderRadius: "var(--radius-pill)",
                          background: "var(--tag-green-bg)", color: "var(--tag-green-txt)", border: "none", cursor: "pointer",
                        }}
                      >
                        Approve
                      </button>
                    )}
                    <button
                      onClick={() => { setEditingPlan(plan); setShowModal(true); }}
                      title="Edit"
                      style={{
                        width: 30, height: 30, borderRadius: "50%", background: "var(--bg-beige)",
                        border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, color: "var(--text-muted)",
                      }}
                    >
                      ✏
                    </button>
                    <button
                      onClick={() => setDeletingId(plan._id)}
                      title="Delete"
                      style={{
                        width: 30, height: 30, borderRadius: "50%", background: "var(--tag-red-bg)",
                        border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, color: "var(--tag-red-txt)",
                      }}
                    >
                      ×
                    </button>
                  </div>
                </div>

                {/* Expanded content */}
                {isOpen && (
                  <div style={{ borderTop: "1px solid var(--border-soft)", padding: "20px 26px 26px" }}>
                    {plan.approvedAt && (
                      <p style={{ fontSize: 12, color: "var(--tag-green-txt)", fontWeight: 500, marginBottom: 16 }}>
                        Approved by {plan.approvedBy} · {new Date(plan.approvedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    )}

                    {/* Block timeline bar */}
                    {totalMins > 0 && (
                      <div style={{ display: "flex", gap: 8, marginBottom: 20, alignItems: "stretch" }}>
                        {plan.blocks.map((b, i) => {
                          const pct = Math.round((b.durationMinutes / totalMins) * 100);
                          const col = BLOCK_COLOR[b.blockType] ?? "var(--text-muted)";
                          return (
                            <div key={i} style={{ flex: b.durationMinutes, minWidth: 0 }}>
                              <div style={{ height: 6, borderRadius: 3, background: col, marginBottom: 4 }} />
                              <p style={{ fontSize: 9, color: col, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {b.blockType}
                              </p>
                              <p style={{ fontSize: 9, color: "var(--text-muted)" }}>{b.durationMinutes}m · {pct}%</p>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Block detail rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {plan.blocks.map((b, i) => {
                        const col = BLOCK_COLOR[b.blockType] ?? "var(--text-muted)";
                        return (
                          <div key={i} style={{ display: "flex", gap: 14, padding: "12px 16px", background: "var(--bg-app)", borderRadius: 12, alignItems: "flex-start" }}>
                            <div style={{ width: 3, borderRadius: 2, background: col, alignSelf: "stretch", flexShrink: 0 }} />
                            <div style={{ flex: 1 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                                <span style={{ fontSize: 11, fontWeight: 700, color: col, textTransform: "uppercase", letterSpacing: "0.06em" }}>{b.blockType}</span>
                                <span style={{ fontSize: 11, color: "var(--text-muted)" }}>·</span>
                                <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-main)" }}>{b.description}</span>
                                <span style={{ fontSize: 11, color: "var(--text-muted)", marginLeft: "auto" }}>{b.durationMinutes} min</span>
                              </div>
                              {b.exerciseName && (
                                <p style={{ fontSize: 12, color: "var(--tag-blue-txt)", fontWeight: 500, marginBottom: 3 }}>
                                  {b.exerciseName}
                                </p>
                              )}
                              {b.instructions && (
                                <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{b.instructions}</p>
                              )}
                              {b.equipment.length > 0 && (
                                <div style={{ display: "flex", gap: 4, marginTop: 6, flexWrap: "wrap" }}>
                                  {b.equipment.map(eq => (
                                    <span key={eq} style={{ fontSize: 10, background: "var(--bg-beige)", color: "var(--text-muted)", padding: "2px 7px", borderRadius: 4, fontWeight: 500 }}>
                                      {eq}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
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
        <PlanModal
          plan={editingPlan}
          classes={classes}
          instructors={instructors}
          onClose={() => { setShowModal(false); setEditingPlan(null); }}
          onSave={handleSave}
        />
      )}

      {/* Delete Confirm Modal */}
      {deletingId && (
        <DeleteModal
          onConfirm={handleDelete}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
