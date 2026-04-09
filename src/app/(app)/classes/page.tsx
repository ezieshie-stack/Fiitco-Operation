"use client";
import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

const CAT_TAG: Record<string, { bg: string; color: string; emoji: string }> = {
  "Strength & Conditioning": { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)",    emoji: "💪" },
  Boxing:                    { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)",   emoji: "🥊" },
  Hybrid:                    { bg: "var(--tag-purple-bg)", color: "var(--tag-purple-txt)", emoji: "🔀" },
  Pilates:                   { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)", emoji: "🧘" },
  Yoga:                      { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)",  emoji: "🌿" },
};

const TIER_STYLE: Record<string, { bg: string; color: string }> = {
  Beginner:     { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
  Intermediate: { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
  Advanced:     { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  "All Levels": { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
};

type ClassDoc = {
  _id: Id<"classes">;
  classId: string;
  categoryId: string;
  categoryName: string;
  subcategoryName?: string;
  name: string;
  tier: string;
  durationMinutes: number;
  description: string;
  active: boolean;
};

type CategoryDoc = {
  _id: Id<"categories">;
  categoryId: string;
  name: string;
};

type PathwayDoc = {
  _id: Id<"pathways">;
  pathwayId: string;
  title: string;
  category: string;
  targetTier: string;
  durationWeeks: number;
  goal: string;
  description: string;
  active: boolean;
};

const EMPTY_FORM = {
  name: "",
  categoryId: "",
  categoryName: "",
  subcategoryName: "",
  tier: "All Levels",
  durationMinutes: 60,
  description: "",
};

export default function ClassesPage() {
  const classes     = useQuery(api.queries.getClasses);
  const categories  = useQuery(api.queries.getCategories);
  const pathways    = useQuery(api.queries.getPathways);

  const { currentUser } = useAuth();
  const submitChange = useMutation(api.mutations.submitPendingChange);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  const addClassMutation    = useMutation(api.mutations.addClass);
  const updateClassMutation = useMutation(api.mutations.updateClass);
  const deleteClassMutation = useMutation(api.mutations.deleteClass);

  function showStatus(msg: { type: "success" | "pending" | "error"; text: string }) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  const [hoveredId, setHoveredId]       = useState<string | null>(null);
  const [slideOver, setSlideOver]       = useState<ClassDoc | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget]     = useState<ClassDoc | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ClassDoc | null>(null);
  const [form, setForm]                 = useState(EMPTY_FORM);
  const [saving, setSaving]             = useState(false);

  const classList = classes ?? [];
  const catList   = (categories ?? []) as CategoryDoc[];
  const pathList  = (pathways ?? []) as PathwayDoc[];

  const totalClasses  = classList.length;
  const uniqueCats    = new Set(classList.map((c) => c.categoryName)).size;
  const avgDuration   = totalClasses
    ? Math.round(classList.reduce((sum, c) => sum + c.durationMinutes, 0) / totalClasses)
    : 0;

  function openAdd() {
    setForm(EMPTY_FORM);
    setShowAddModal(true);
  }

  function openEdit(c: ClassDoc) {
    setForm({
      name:            c.name,
      categoryId:      c.categoryId,
      categoryName:    c.categoryName,
      subcategoryName: c.subcategoryName ?? "",
      tier:            c.tier,
      durationMinutes: c.durationMinutes,
      description:     c.description,
    });
    setEditTarget(c);
  }

  function handleCategoryChange(catId: string) {
    const cat = catList.find((c) => c.categoryId === catId);
    setForm((f) => ({ ...f, categoryId: catId, categoryName: cat?.name ?? "" }));
  }

  async function handleSave() {
    if (!form.name || !form.categoryId) return;
    setSaving(true);
    try {
      if (editTarget) {
        const updatePayload = {
          id:              editTarget._id,
          name:            form.name,
          categoryId:      form.categoryId,
          categoryName:    form.categoryName,
          subcategoryName: form.subcategoryName || undefined,
          tier:            form.tier,
          durationMinutes: Number(form.durationMinutes),
          description:     form.description,
        };
        if (currentUser?.role === "admin") {
          await updateClassMutation(updatePayload);
          showStatus({ type: "success", text: "Class updated successfully." });
        } else {
          await submitChange({
            tableName: "classes",
            action: "update",
            entityId: String(editTarget._id),
            payload: updatePayload,
            submittedBy: currentUser?.id ?? "",
            submittedByName: currentUser?.displayName ?? "",
            description: `Update class: ${form.name}`,
          });
          showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
        }
        setEditTarget(null);
      } else {
        const newId = `CLS-${String(classList.length + 1).padStart(2, "0")}`;
        const addPayload = {
          classId:         newId,
          categoryId:      form.categoryId,
          categoryName:    form.categoryName,
          subcategoryName: form.subcategoryName || undefined,
          name:            form.name,
          tier:            form.tier,
          durationMinutes: Number(form.durationMinutes),
          description:     form.description,
        };
        if (currentUser?.role === "admin") {
          await addClassMutation(addPayload);
          showStatus({ type: "success", text: "Class added successfully." });
        } else {
          await submitChange({
            tableName: "classes",
            action: "add",
            payload: addPayload,
            submittedBy: currentUser?.id ?? "",
            submittedByName: currentUser?.displayName ?? "",
            description: `Add class: ${form.name}`,
          });
          showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
        }
        setShowAddModal(false);
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setSaving(true);
    try {
      if (currentUser?.role === "admin") {
        await deleteClassMutation({ id: deleteTarget._id });
        showStatus({ type: "success", text: "Class deleted." });
      } else {
        await submitChange({
          tableName: "classes",
          action: "delete",
          entityId: String(deleteTarget._id),
          payload: {},
          submittedBy: currentUser?.id ?? "",
          submittedByName: currentUser?.displayName ?? "",
          description: `Delete class: ${deleteTarget.name}`,
        });
        showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
      }
      setDeleteTarget(null);
      if (slideOver?._id === deleteTarget._id) setSlideOver(null);
    } finally {
      setSaving(false);
    }
  }

  const isModalOpen = showAddModal || !!editTarget;

  return (
    <div style={{ maxWidth: 1100, position: "relative" }}>
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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 40, fontWeight: 500, letterSpacing: "-0.02em", marginBottom: 8 }}>
            Class Library
          </h1>
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            Master list of all classes — browse, edit, and manage every class offered at FIIT Co.
          </p>
        </div>
        <button className="btn-primary" onClick={openAdd} style={{ whiteSpace: "nowrap" }}>
          + Add Class
        </button>
      </div>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
        {[
          { label: "Total Classes",    value: totalClasses },
          { label: "Categories",       value: uniqueCats },
          { label: "Avg Duration",     value: `${avgDuration} min` },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="stat-card"
            style={{
              background: "var(--bg-panel)",
              borderRadius: "var(--radius-card)",
              padding: "20px 24px",
              border: "1px solid var(--border-soft)",
            }}
          >
            <p className="stat-label" style={{ color: "var(--text-muted)", fontSize: 12, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
              {label}
            </p>
            <p className="stat-value font-serif" style={{ fontSize: 32, fontWeight: 500, color: "var(--text-main)" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Card grid */}
      {!classes ? (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{ borderRadius: "var(--radius-card)", background: "var(--bg-beige)", height: 140, opacity: 0.5 }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          {classList.map((c) => {
            const classDoc = c as ClassDoc;
            const cat  = CAT_TAG[classDoc.categoryName] ?? { bg: "#f0f0f0", color: "#666", emoji: "📋" };
            const tier = TIER_STYLE[classDoc.tier]      ?? { bg: "#f0f0f0", color: "#666" };
            const isHovered = hoveredId === classDoc._id;

            return (
              <div
                key={classDoc._id}
                style={{
                  background:    "var(--bg-panel)",
                  borderRadius:  "var(--radius-card)",
                  padding:       "20px 24px",
                  border:        "1px solid var(--border-soft)",
                  cursor:        "pointer",
                  transition:    "box-shadow 0.15s",
                  boxShadow:     isHovered ? "0 6px 24px rgba(0,0,0,0.07)" : "0 2px 12px rgba(0,0,0,0.02)",
                  position:      "relative",
                }}
                onMouseEnter={() => setHoveredId(classDoc._id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => setSlideOver(classDoc)}
              >
                {/* Hover action buttons */}
                {isHovered && (
                  <div
                    style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => openEdit(classDoc)}
                      style={{
                        fontSize: 12, fontWeight: 600, padding: "4px 10px",
                        borderRadius: "var(--radius-pill)", border: "1px solid var(--border-soft)",
                        background: "var(--bg-panel)", color: "var(--text-main)", cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(classDoc)}
                      style={{
                        fontSize: 12, fontWeight: 600, padding: "4px 10px",
                        borderRadius: "var(--radius-pill)", border: "none",
                        background: "var(--tag-red-bg)", color: "var(--tag-red-txt)", cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </div>
                )}

                {/* Top row: emoji + tier */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <span style={{ fontSize: 28 }}>{cat.emoji}</span>
                  <span style={{ background: tier.bg, color: tier.color, fontSize: 12, fontWeight: 600, padding: "4px 10px", borderRadius: "var(--radius-pill)" }}>
                    {classDoc.tier}
                  </span>
                </div>

                {/* Name */}
                <p className="font-serif" style={{ fontSize: 18, fontWeight: 500, color: "var(--text-main)", marginBottom: 4 }}>
                  {classDoc.name}
                </p>

                {/* Subcategory */}
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 16 }}>
                  {classDoc.subcategoryName ?? classDoc.categoryName}
                </p>

                {/* Bottom row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{
                    background: cat.bg, color: cat.color, fontSize: 12, fontWeight: 600,
                    padding: "5px 10px", borderRadius: "var(--radius-pill)",
                    display: "inline-flex", alignItems: "center", gap: 5,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: cat.color }} />
                    {classDoc.categoryName}
                  </span>
                  <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 500 }}>
                    {classDoc.durationMinutes} min
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Slide-over detail panel ── */}
      {slideOver && (
        <>
          <div
            style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(0,0,0,0.18)" }}
            onClick={() => setSlideOver(null)}
          />
          <div
            style={{
              position:     "fixed",
              top:          0,
              right:        0,
              width:        420,
              height:       "100vh",
              background:   "#fff",
              zIndex:       100,
              boxShadow:    "-8px 0 40px rgba(0,0,0,0.10)",
              borderRadius: "var(--radius-card) 0 0 var(--radius-card)",
              overflowY:    "auto",
              padding:      "36px 32px",
            }}
          >
            {/* Close */}
            <button
              onClick={() => setSlideOver(null)}
              style={{
                position: "absolute", top: 20, right: 20,
                background: "none", border: "none",
                fontSize: 22, cursor: "pointer", color: "var(--text-muted)",
                lineHeight: 1,
              }}
            >
              ×
            </button>

            {/* Class name */}
            <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 500, color: "var(--text-main)", marginBottom: 16, paddingRight: 32 }}>
              {slideOver.name}
            </h2>

            {/* Category tag + tier + duration */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
              {(() => {
                const cat  = CAT_TAG[slideOver.categoryName] ?? { bg: "#f0f0f0", color: "#666", emoji: "📋" };
                const tier = TIER_STYLE[slideOver.tier]      ?? { bg: "#f0f0f0", color: "#666" };
                return (
                  <>
                    <span style={{ background: cat.bg, color: cat.color, fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: "var(--radius-pill)", display: "inline-flex", alignItems: "center", gap: 5 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: cat.color }} />
                      {slideOver.categoryName}
                    </span>
                    <span style={{ background: tier.bg, color: tier.color, fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: "var(--radius-pill)" }}>
                      {slideOver.tier}
                    </span>
                    <span style={{ background: "var(--bg-beige)", color: "var(--text-muted)", fontSize: 12, fontWeight: 600, padding: "5px 10px", borderRadius: "var(--radius-pill)" }}>
                      {slideOver.durationMinutes} min
                    </span>
                  </>
                );
              })()}
            </div>

            {/* Description */}
            {slideOver.description && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                  Description
                </p>
                <p style={{ fontSize: 15, color: "var(--text-main)", lineHeight: 1.65 }}>
                  {slideOver.description}
                </p>
              </div>
            )}

            {/* Subcategory */}
            {slideOver.subcategoryName && (
              <div style={{ marginBottom: 28 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 }}>
                  Subcategory
                </p>
                <p style={{ fontSize: 15, color: "var(--text-main)" }}>{slideOver.subcategoryName}</p>
              </div>
            )}

            {/* Linked Pathways */}
            <div>
              <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 12 }}>
                Linked Pathways
              </p>
              {(() => {
                const linked = pathList.filter((p) => p.category === slideOver.categoryName);
                if (linked.length === 0) {
                  return <p style={{ fontSize: 14, color: "var(--text-muted)" }}>No pathways linked to this category yet.</p>;
                }
                return linked.map((p) => {
                  const tier = TIER_STYLE[p.targetTier] ?? { bg: "#f0f0f0", color: "#666" };
                  return (
                    <div
                      key={p._id}
                      style={{
                        background:   "var(--bg-beige)",
                        borderRadius: "var(--radius-card)",
                        padding:      "14px 16px",
                        marginBottom: 10,
                        border:       "1px solid var(--border-soft)",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text-main)", flex: 1 }}>{p.title}</p>
                        <span style={{ background: tier.bg, color: tier.color, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: "var(--radius-pill)", whiteSpace: "nowrap" }}>
                          {p.targetTier}
                        </span>
                      </div>
                      <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>{p.durationWeeks} weeks</p>
                    </div>
                  );
                });
              })()}
            </div>
          </div>
        </>
      )}

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => { setShowAddModal(false); setEditTarget(null); }}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 500, marginBottom: 24 }}>
              {editTarget ? "Edit Class" : "Add Class"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Name */}
              <div>
                <label className="field-label">Class Name</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Upper Body Lift"
                />
              </div>

              {/* Category */}
              <div>
                <label className="field-label">Category</label>
                <select
                  className="field-input"
                  value={form.categoryId}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                >
                  <option value="">Select category…</option>
                  {catList.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                  ))}
                </select>
                <p style={{ fontSize: 11, color: "var(--tag-blue-txt)", marginTop: 5, cursor: "pointer", fontWeight: 500 }}
                  onClick={() => window.open("/categories", "_blank")}>
                  + Manage categories ↗
                </p>
              </div>

              {/* Subcategory */}
              <div>
                <label className="field-label">Subcategory</label>
                <input
                  className="field-input"
                  type="text"
                  value={form.subcategoryName}
                  onChange={(e) => setForm((f) => ({ ...f, subcategoryName: e.target.value }))}
                  placeholder="e.g. Upper Body"
                />
              </div>

              {/* Tier */}
              <div>
                <label className="field-label">Tier</label>
                <select
                  className="field-input"
                  value={form.tier}
                  onChange={(e) => setForm((f) => ({ ...f, tier: e.target.value }))}
                >
                  {["Beginner", "Intermediate", "Advanced", "All Levels"].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* Duration */}
              <div>
                <label className="field-label">Duration</label>
                <select
                  className="field-input"
                  value={form.durationMinutes}
                  onChange={(e) => setForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                >
                  {[5,10,15,20,25,30,45,60,75,90,105,120,135,150,165,180].map((mins) => {
                    const hrs = Math.floor(mins / 60);
                    const rem = mins % 60;
                    const label = hrs > 0
                      ? (rem > 0 ? `${hrs}hr ${rem} min` : `${hrs}hr`)
                      : `${mins} min`;
                    return <option key={mins} value={mins}>{label}</option>;
                  })}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="field-label">Description</label>
                <textarea
                  className="field-input"
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Brief class description…"
                  style={{ resize: "vertical" }}
                />
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 28 }}>
              <button
                className="btn-ghost"
                onClick={() => { setShowAddModal(false); setEditTarget(null); }}
              >
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Class"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-panel" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 400 }}>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 12 }}>
              Delete class?
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-muted)", marginBottom: 28, lineHeight: 1.5 }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--text-main)" }}>{deleteTarget.name}</strong>? This cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
              <button className="btn-ghost" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                style={{
                  background: "var(--tag-red-bg)", color: "var(--tag-red-txt)",
                  border: "none", padding: "10px 20px", borderRadius: "var(--radius-pill)",
                  fontSize: 14, fontWeight: 600, cursor: "pointer",
                }}
              >
                {saving ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
