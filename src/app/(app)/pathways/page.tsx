"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

// ─── Constants ────────────────────────────────────────────────────────────────

const CAT_TAG: Record<string, { bg: string; color: string }> = {
  "Strength & Conditioning": { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  Boxing:                    { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
  Hybrid:                    { bg: "var(--tag-purple-bg)", color: "var(--tag-purple-txt)" },
  Pilates:                   { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
  Yoga:                      { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
};

const TIER_COLOR: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
  Intermediate: { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
  Advanced:     { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  "All Levels": { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
};

const CATEGORIES = [
  "Strength & Conditioning",
  "Boxing",
  "Hybrid",
  "Pilates",
  "Yoga",
];

const TIERS = ["Beginner", "Intermediate", "Advanced", "All Levels"];

// ─── Pathway Modal ────────────────────────────────────────────────────────────

interface PathwayFormData {
  title: string;
  category: string;
  targetTier: string;
  durationWeeks: number;
  goal: string;
  description: string;
  active: boolean;
}

interface ModalProps {
  pathway?: {
    _id: Id<"pathways">;
    title: string;
    category: string;
    targetTier: string;
    durationWeeks: number;
    goal: string;
    description: string;
    active: boolean;
  } | null;
  existingCount: number;
  onClose: () => void;
  onSave: (data: PathwayFormData & { pathwayId?: string; id?: Id<"pathways"> }) => Promise<void>;
}

function PathwayModal({ pathway, existingCount, onClose, onSave }: ModalProps) {
  const [form, setForm] = useState<PathwayFormData>({
    title:         pathway?.title         ?? "",
    category:      pathway?.category      ?? CATEGORIES[0],
    targetTier:    pathway?.targetTier    ?? TIERS[0],
    durationWeeks: pathway?.durationWeeks ?? 4,
    goal:          pathway?.goal          ?? "",
    description:   pathway?.description   ?? "",
    active:        pathway?.active        ?? true,
  });
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof PathwayFormData>(key: K, value: PathwayFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title || !form.goal) return;
    setSaving(true);
    if (pathway) {
      await onSave({ ...form, id: pathway._id });
    } else {
      const num = String(existingCount + 1).padStart(2, "0");
      await onSave({ ...form, pathwayId: `PTH-${num}` });
    }
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 560, width: "100%" }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 500, color: "var(--text-main)" }}>
            {pathway ? "Edit Pathway" : "New Training Pathway"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 22, color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Title</label>
          <input
            className="field-input"
            value={form.title}
            onChange={e => set("title", e.target.value)}
            placeholder="e.g. 8-Week Boxing Foundation"
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <label className="field-label">Category</label>
            <select className="field-input" value={form.category} onChange={e => set("category", e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Target Tier</label>
            <select className="field-input" value={form.targetTier} onChange={e => set("targetTier", e.target.value)}>
              {TIERS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="field-label">Duration (weeks)</label>
            <input
              className="field-input"
              type="number"
              min={1}
              max={52}
              value={form.durationWeeks}
              onChange={e => set("durationWeeks", Math.min(52, Math.max(1, Number(e.target.value))))}
            />
          </div>
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 14, color: "var(--text-main)", paddingBottom: 2 }}>
              <input
                type="checkbox"
                checked={form.active}
                onChange={e => set("active", e.target.checked)}
                style={{ width: 16, height: 16, accentColor: "var(--ui-orange)", cursor: "pointer" }}
              />
              Active
            </label>
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label className="field-label">Goal</label>
          <input
            className="field-input"
            value={form.goal}
            onChange={e => set("goal", e.target.value)}
            placeholder="Short goal statement (e.g. Build aerobic base and boxing fundamentals)"
          />
        </div>

        <div style={{ marginBottom: 24 }}>
          <label className="field-label">Description</label>
          <textarea
            className="field-input"
            rows={3}
            value={form.description}
            onChange={e => set("description", e.target.value)}
            style={{ resize: "vertical" }}
            placeholder="Describe this pathway in detail…"
          />
        </div>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || !form.title || !form.goal}
          >
            {saving ? "Saving…" : "Save Pathway"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Modal ─────────────────────────────────────────────────────────────

function DeleteModal({ onConfirm, onClose }: { onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-panel"
        style={{ maxWidth: 400, width: "100%", padding: 32 }}
        onClick={e => e.stopPropagation()}
      >
        <h3 className="font-serif" style={{ fontSize: 20, marginBottom: 10, color: "var(--text-main)" }}>Delete this pathway?</h3>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.6 }}>
          This action cannot be undone.
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

export default function PathwaysPage() {
  const { currentUser } = useAuth();

  const pathways       = useQuery(api.queries.getPathways)       ?? [];
  const deliveryLogs   = useQuery(api.queries.getDeliveryLog)    ?? [];
  const clientJourneys = useQuery(api.queries.getClientJourneys) ?? [];

  const addPathway    = useMutation(api.mutations.addPathway);
  const updatePathway = useMutation(api.mutations.updatePathway);
  const deletePathway = useMutation(api.mutations.deletePathway);
  const submitChange  = useMutation(api.mutations.submitPendingChange);

  const [hoveredId, setHoveredId]    = useState<string | null>(null);
  const [showModal, setShowModal]    = useState(false);
  const [editingPathway, setEditing] = useState<typeof pathways[number] | null>(null);
  const [deletingId, setDeletingId]  = useState<Id<"pathways"> | null>(null);
  const [statusMsg, setStatusMsg]    = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  const activeCount  = pathways.filter(p => p.active).length;
  const avgDuration  = pathways.length
    ? Math.round(pathways.reduce((s, p) => s + p.durationWeeks, 0) / pathways.length)
    : 0;
  const categoryCount = new Set(pathways.map(p => p.category)).size;

  // Build a map: pathwayId → Set of classIds (from clientJourneys)
  const pathwayClassIds = useMemo(() => {
    const map: Record<string, Set<string>> = {};
    for (const j of clientJourneys) {
      if (!map[j.pathwayId]) map[j.pathwayId] = new Set();
      for (const w of j.weeks) map[j.pathwayId].add(w.classId);
    }
    return map;
  }, [clientJourneys]);

  function getProgressForPathway(pathway: { pathwayId: string; durationWeeks: number }) {
    const classIds = pathwayClassIds[pathway.pathwayId] ?? new Set();
    const logged   = deliveryLogs.filter(l => classIds.has(l.classId)).length;
    const expected = pathway.durationWeeks;
    return { logged, expected, pct: Math.min(100, Math.round((logged / Math.max(1, expected)) * 100)) };
  }

  const handleSave = async (data: {
    title: string;
    category: string;
    targetTier: string;
    durationWeeks: number;
    goal: string;
    description: string;
    active: boolean;
    pathwayId?: string;
    id?: Id<"pathways">;
  }) => {
    if (currentUser?.role === "admin") {
      if (data.id) {
        const { pathwayId: _pid, ...rest } = data;
        await updatePathway(rest as { id: Id<"pathways">; title: string; category: string; targetTier: string; durationWeeks: number; goal: string; description: string; active: boolean });
      } else {
        const { id: _id, ...rest } = data;
        await addPathway(rest as { pathwayId: string; title: string; category: string; targetTier: string; durationWeeks: number; goal: string; description: string });
      }
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "pathways",
        action: data.id ? "update" : "add",
        entityId: data.id ? String(data.id) : undefined,
        payload: data,
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: data.id
          ? `Update pathway: ${data.title}`
          : `Add pathway: ${data.title}`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setShowModal(false);
    setEditing(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    if (currentUser?.role === "admin") {
      await deletePathway({ id: deletingId });
      setStatusMsg({ type: "success", text: "Saved successfully" });
    } else {
      await submitChange({
        tableName: "pathways",
        action: "delete",
        entityId: String(deletingId),
        payload: { id: deletingId },
        submittedBy: currentUser!.id,
        submittedByName: currentUser!.displayName,
        description: `Delete pathway`,
      });
      setStatusMsg({ type: "pending", text: "Submitted for admin review ✓" });
    }
    setDeletingId(null);
    setTimeout(() => setStatusMsg(null), 3000);
  };

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
        <div>
          <h1 className="font-serif page-title" style={{ fontSize: 40 }}>Training Pathways</h1>
          <p className="page-subtitle">Structured multi-week programmes guiding members from beginner to advanced.</p>
        </div>
        <button
          className="btn-primary"
          style={{ marginTop: 8, flexShrink: 0 }}
          onClick={() => { setEditing(null); setShowModal(true); }}
        >
          + New Pathway
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
      <div className="lesson-stat-grid" style={{ display: "grid", gap: 14, marginBottom: 32 }}>
        {[
          { label: "Total Pathways",  value: pathways.length,          color: "var(--text-main)" },
          { label: "Active",          value: activeCount,               color: "var(--tag-green-txt)" },
          { label: "Avg Duration",    value: pathways.length ? `${avgDuration}w` : "—", color: "var(--tag-blue-txt)" },
          { label: "Categories",      value: categoryCount,             color: "var(--tag-purple-txt)" },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <p className="stat-label">{s.label}</p>
            <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Cards */}
      {pathways.length === 0 ? (
        <div className="hatch" style={{ borderRadius: 16, minHeight: 140, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>No pathways yet — click &quot;+ New Pathway&quot; to create one.</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {pathways.map(p => {
            const cat      = CAT_TAG[p.category]     ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
            const tier     = TIER_COLOR[p.targetTier] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
            const isHovered = hoveredId === p._id;

            return (
              <div
                key={p._id}
                style={{
                  background: "var(--bg-panel)", borderRadius: "var(--radius-card)",
                  overflow: "hidden", boxShadow: "0 2px 14px rgba(0,0,0,0.04)",
                  position: "relative",
                }}
                onMouseEnter={() => setHoveredId(p._id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                {/* Top accent bar */}
                <div style={{ height: 4, background: cat.color }} />

                {/* Edit / Delete — visible on hover */}
                <div
                  style={{
                    position: "absolute", top: 14, right: 14,
                    display: "flex", gap: 6,
                    opacity: isHovered ? 1 : 0, transition: "opacity 0.15s",
                    pointerEvents: isHovered ? "auto" : "none",
                    zIndex: 2,
                  }}
                >
                  <button
                    onClick={() => { setEditing(p); setShowModal(true); }}
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
                    onClick={() => setDeletingId(p._id)}
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

                <div style={{ padding: "22px 26px 26px" }}>
                  {/* Tags row */}
                  <div style={{ display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 11, fontWeight: 700, background: cat.bg, color: cat.color, padding: "4px 10px", borderRadius: "var(--radius-pill)" }}>
                      {p.category}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: tier.bg, color: tier.color, padding: "4px 10px", borderRadius: "var(--radius-pill)" }}>
                      {p.targetTier}
                    </span>
                    <span style={{ fontSize: 11, fontWeight: 700, background: "var(--bg-beige)", color: "var(--text-muted)", padding: "4px 10px", borderRadius: "var(--radius-pill)", marginLeft: "auto" }}>
                      {p.durationWeeks} weeks
                    </span>
                  </div>

                  {/* Title */}
                  <p className="font-serif" style={{ fontSize: 22, fontWeight: 500, color: "var(--text-main)", marginBottom: 8, lineHeight: 1.2 }}>
                    {p.title}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--tag-blue-txt)", fontWeight: 600, marginBottom: 10 }}>
                    Goal: {p.goal}
                  </p>
                  <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6 }}>{p.description}</p>

                  {/* Sessions Logged progress */}
                  {(() => {
                    const { logged, expected, pct } = getProgressForPathway(p);
                    return (
                      <div style={{ marginTop: 14, paddingTop: 14, borderTop: "1px solid var(--border-soft)" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                            Sessions Logged
                          </span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-main)" }}>
                            {logged} / {expected}
                          </span>
                        </div>
                        <div style={{ height: 6, background: "var(--bg-beige)", borderRadius: 6, overflow: "hidden" }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            borderRadius: 6,
                            background: pct >= 100 ? "var(--tag-green-txt)" : pct >= 50 ? "var(--tag-blue-txt)" : "var(--tag-yellow-txt)",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                        {pct >= 100 && (
                          <p style={{ fontSize: 11, color: "var(--tag-green-txt)", fontWeight: 600, marginTop: 4 }}>&#10003; Complete</p>
                        )}
                      </div>
                    );
                  })()}

                  {/* Week timeline */}
                  <div style={{ marginTop: 20 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "var(--text-muted)", marginBottom: 8 }}>
                      Week Timeline
                    </p>
                    <div style={{ display: "flex", gap: 3 }}>
                      {Array.from({ length: p.durationWeeks }, (_, i) => (
                        <div
                          key={i}
                          style={{
                            flex: 1, height: 6, borderRadius: 3,
                            background: i < Math.ceil(p.durationWeeks / 3)
                              ? cat.color
                              : i < Math.ceil(2 * p.durationWeeks / 3)
                              ? cat.color + "99"
                              : cat.color + "44",
                          }}
                        />
                      ))}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Wk 1</span>
                      <span style={{ fontSize: 10, color: "var(--text-muted)" }}>Wk {p.durationWeeks}</span>
                    </div>
                  </div>

                  {/* Footer */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16 }}>
                    <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{p.pathwayId}</p>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: "var(--radius-pill)",
                      background: p.active ? "var(--tag-green-bg)" : "var(--bg-beige)",
                      color: p.active ? "var(--tag-green-txt)" : "var(--text-muted)",
                    }}>
                      {p.active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showModal && (
        <PathwayModal
          pathway={editingPathway}
          existingCount={pathways.length}
          onClose={() => { setShowModal(false); setEditing(null); }}
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
