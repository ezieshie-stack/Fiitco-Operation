"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";

const CATEGORIES = [
  "Boxing",
  "Strength & Conditioning",
  "Hybrid",
  "Cardio",
  "Pilates",
  "Yoga",
] as const;

type Category = (typeof CATEGORIES)[number];

const CAT_TAG: Record<string, { bg: string; color: string }> = {
  "Strength & Conditioning": { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  Boxing:                    { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
  Hybrid:                    { bg: "var(--tag-purple-bg)", color: "var(--tag-purple-txt)" },
  Pilates:                   { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
  Yoga:                      { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
  Cardio:                    { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
};

const GROUP_ORDER: Category[] = [
  "Boxing",
  "Strength & Conditioning",
  "Hybrid",
  "Cardio",
  "Pilates",
  "Yoga",
];

const STAT_CATS: Category[] = ["Boxing", "Strength & Conditioning", "Hybrid", "Cardio", "Pilates"];

interface Exercise {
  _id: Id<"exercises">;
  exerciseId: string;
  name: string;
  category: string;
  description: string;
  equipment: string[];
  active: boolean;
}

interface FormState {
  name: string;
  category: Category;
  description: string;
  equipment: string;
}

const EMPTY_FORM: FormState = {
  name: "",
  category: "Boxing",
  description: "",
  equipment: "",
};

export default function ExercisesPage() {
  const exercises = (useQuery(api.queries.getExercises) ?? []) as Exercise[];

  const { currentUser } = useAuth();
  const submitChange = useMutation(api.mutations.submitPendingChange);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "pending" | "error"; text: string } | null>(null);

  const addExercise    = useMutation(api.mutations.addExercise);
  const updateExercise = useMutation(api.mutations.updateExercise);
  const deleteExercise = useMutation(api.mutations.deleteExercise);

  function showStatus(msg: { type: "success" | "pending" | "error"; text: string }) {
    setStatusMsg(msg);
    setTimeout(() => setStatusMsg(null), 3000);
  }

  const [search, setSearch]       = useState("");
  const [catFilter, setCatFilter] = useState("All");

  // Modal state
  const [modalOpen, setModalOpen]   = useState(false);
  const [editTarget, setEditTarget] = useState<Exercise | null>(null);
  const [form, setForm]             = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Exercise | null>(null);
  const [deleting, setDeleting]         = useState(false);

  // Derived data
  const filtered = exercises.filter((e) => {
    const matchCat    = catFilter === "All" || e.category === catFilter;
    const q           = search.toLowerCase();
    const matchSearch =
      !q ||
      e.name.toLowerCase().includes(q) ||
      e.description.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  const grouped: Record<string, Exercise[]> = {};
  for (const e of filtered) {
    if (!grouped[e.category]) grouped[e.category] = [];
    grouped[e.category].push(e);
  }
  const orderedGroups = GROUP_ORDER.filter((g) => grouped[g]?.length > 0);

  // Handlers — Add
  function openAdd() {
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  }

  // Handlers — Edit
  function openEdit(ex: Exercise) {
    setEditTarget(ex);
    setForm({
      name:        ex.name,
      category:    (CATEGORIES.includes(ex.category as Category) ? ex.category : "Boxing") as Category,
      description: ex.description,
      equipment:   ex.equipment.join(", "),
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
  }

  async function handleSave() {
    if (!form.name.trim()) return;
    setSaving(true);
    const equipmentArr = form.equipment
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      if (editTarget) {
        const updatePayload = {
          id:          editTarget._id,
          name:        form.name.trim(),
          category:    form.category,
          description: form.description.trim(),
          equipment:   equipmentArr,
          active:      editTarget.active,
        };
        if (currentUser?.role === "admin") {
          await updateExercise(updatePayload);
          showStatus({ type: "success", text: "Exercise updated successfully." });
        } else {
          await submitChange({
            tableName: "exercises",
            action: "update",
            entityId: String(editTarget._id),
            payload: updatePayload,
            submittedBy: currentUser?.id ?? "",
            submittedByName: currentUser?.displayName ?? "",
            description: `Update exercise: ${form.name.trim()}`,
          });
          showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
        }
      } else {
        const exerciseId = `EXC-${String(exercises.length + 1).padStart(2, "0")}`;
        const addPayload = {
          exerciseId,
          name:        form.name.trim(),
          category:    form.category,
          description: form.description.trim(),
          equipment:   equipmentArr,
        };
        if (currentUser?.role === "admin") {
          await addExercise(addPayload);
          showStatus({ type: "success", text: "Exercise added successfully." });
        } else {
          await submitChange({
            tableName: "exercises",
            action: "add",
            payload: addPayload,
            submittedBy: currentUser?.id ?? "",
            submittedByName: currentUser?.displayName ?? "",
            description: `Add exercise: ${form.name.trim()}`,
          });
          showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
        }
      }
      closeModal();
    } finally {
      setSaving(false);
    }
  }

  // Handlers — Delete
  function openDelete(ex: Exercise) {
    setDeleteTarget(ex);
  }

  function closeDelete() {
    setDeleteTarget(null);
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (currentUser?.role === "admin") {
        await deleteExercise({ id: deleteTarget._id });
        showStatus({ type: "success", text: "Exercise deleted." });
      } else {
        await submitChange({
          tableName: "exercises",
          action: "delete",
          entityId: String(deleteTarget._id),
          payload: {},
          submittedBy: currentUser?.id ?? "",
          submittedByName: currentUser?.displayName ?? "",
          description: `Delete exercise: ${deleteTarget.name}`,
        });
        showStatus({ type: "pending", text: "Submitted for review — admin will approve" });
      }
      closeDelete();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div style={{ width: "100%" }}>
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

      {/* ── Header ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 8,
        }}
      >
        <div>
          <h1
            className="font-serif"
            style={{ fontSize: 40, fontWeight: 700, color: "var(--text-main)", lineHeight: 1.1, marginBottom: 6 }}
          >
            Exercise Library
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-muted)" }}>
            Master reference for all exercises used in class programming.
          </p>
        </div>
        <div style={{ paddingTop: 8 }}>
          <button className="btn-primary" onClick={openAdd}>
            + Add Exercise
          </button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 12,
          marginTop: 28,
          marginBottom: 28,
        }}
      >
        {STAT_CATS.map((cat) => {
          const count   = exercises.filter((e) => e.category === cat).length;
          const tag     = CAT_TAG[cat] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
          const active  = catFilter === cat;
          return (
            <div
              key={cat}
              onClick={() => setCatFilter(active ? "All" : cat)}
              style={{ cursor: "pointer" }}
            >
              <div
                style={{
                  background:    "var(--bg-panel)",
                  borderRadius:  16,
                  padding:       "16px 20px",
                  boxShadow:     "0 2px 10px rgba(0,0,0,0.03)",
                  border:        active ? `1.5px solid ${tag.color}` : "1.5px solid transparent",
                  transition:    "all 0.15s",
                }}
              >
                <p
                  style={{
                    fontSize:    28,
                    fontWeight:  600,
                    color:       tag.color,
                    lineHeight:  1,
                    marginBottom: 4,
                  }}
                >
                  {count}
                </p>
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>{cat}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Filter row ── */}
      <div
        style={{
          display:    "flex",
          gap:        12,
          marginBottom: 28,
          alignItems: "center",
          flexWrap:   "wrap",
        }}
      >
        <input
          placeholder="Search exercises…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="field-input"
          style={{ width: 240, fontSize: 14 }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {(["All", ...CATEGORIES] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCatFilter(c)}
              style={{
                padding:       "7px 16px",
                borderRadius:  "var(--radius-pill)",
                fontSize:      13,
                fontWeight:    500,
                border:        "none",
                cursor:        "pointer",
                transition:    "all 0.15s",
                background:    catFilter === c ? "var(--ui-dark)" : "var(--bg-beige)",
                color:         catFilter === c ? "#fff" : "var(--text-muted)",
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {orderedGroups.length === 0 ? (
        <div
          className="hatch"
          style={{
            borderRadius: 16,
            minHeight:    140,
            display:      "flex",
            alignItems:   "center",
            justifyContent: "center",
          }}
        >
          <p style={{ color: "var(--text-muted)", fontSize: 15 }}>
            No exercises match your search
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {orderedGroups.map((cat) => {
            const tag  = CAT_TAG[cat] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
            const rows = grouped[cat];
            return (
              <div
                key={cat}
                style={{
                  background:   "var(--bg-panel)",
                  borderRadius: "var(--radius-card)",
                  overflow:     "hidden",
                  overflowX:    "auto" as const,
                  WebkitOverflowScrolling: "touch" as const,
                  boxShadow:    "0 2px 12px rgba(0,0,0,0.03)",
                }}
              >
                {/* Group header */}
                <div
                  style={{
                    padding:      "18px 28px 14px",
                    borderBottom: "1px solid var(--border-soft)",
                    display:      "flex",
                    alignItems:   "center",
                    gap:          10,
                  }}
                >
                  <span
                    style={{
                      background:   tag.bg,
                      color:        tag.color,
                      fontSize:     12,
                      fontWeight:   700,
                      padding:      "4px 12px",
                      borderRadius: "var(--radius-pill)",
                    }}
                  >
                    {cat}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {rows.length} exercise{rows.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* Table header */}
                <div
                  style={{
                    display:             "grid",
                    gridTemplateColumns: "80px 200px 1fr 180px 120px",
                    gap:                 0,
                    padding:             "10px 28px",
                    background:          "var(--ui-dark)",
                    minWidth:            650,
                  }}
                >
                  {["ID", "Exercise", "Description", "Equipment", "Actions"].map((h) => (
                    <p
                      key={h}
                      style={{
                        fontSize:       10,
                        fontWeight:     700,
                        textTransform:  "uppercase",
                        letterSpacing:  "0.08em",
                        color:          "rgba(255,255,255,0.55)",
                      }}
                    >
                      {h}
                    </p>
                  ))}
                </div>

                {/* Exercise rows */}
                {rows.map((ex, i) => (
                  <div
                    key={ex._id}
                    style={{
                      display:             "grid",
                      gridTemplateColumns: "80px 200px 1fr 180px 120px",
                      gap:                 0,
                      padding:             "16px 28px",
                      minWidth:            650,
                      alignItems:          "start",
                      borderBottom:
                        i < rows.length - 1 ? "1px solid var(--border-soft)" : "none",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--bg-beige)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    {/* ID */}
                    <p
                      style={{
                        fontSize:   11,
                        color:      "var(--text-muted)",
                        fontWeight: 600,
                        paddingTop: 2,
                      }}
                    >
                      {ex.exerciseId}
                    </p>

                    {/* Name */}
                    <p
                      className="font-serif"
                      style={{
                        fontSize:   16,
                        fontWeight: 500,
                        color:      "var(--text-main)",
                      }}
                    >
                      {ex.name}
                    </p>

                    {/* Description */}
                    <p
                      style={{
                        fontSize:    13,
                        color:       "var(--text-muted)",
                        lineHeight:  1.5,
                        paddingRight: 16,
                      }}
                    >
                      {ex.description}
                    </p>

                    {/* Equipment */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                      {ex.equipment.length === 0 ? (
                        <span
                          style={{
                            fontSize:   12,
                            color:      "var(--text-muted)",
                            fontStyle:  "italic",
                          }}
                        >
                          No equipment
                        </span>
                      ) : (
                        ex.equipment.map((eq) => (
                          <span
                            key={eq}
                            style={{
                              fontSize:     11,
                              background:   "var(--bg-beige)",
                              color:        "var(--text-muted)",
                              padding:      "3px 8px",
                              borderRadius: 6,
                              fontWeight:   500,
                            }}
                          >
                            {eq}
                          </span>
                        ))
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <button
                        onClick={() => openEdit(ex)}
                        style={{
                          fontSize:     12,
                          fontWeight:   600,
                          color:        "var(--tag-blue-txt)",
                          background:   "var(--tag-blue-bg)",
                          border:       "none",
                          borderRadius: 6,
                          padding:      "5px 12px",
                          cursor:       "pointer",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => openDelete(ex)}
                        style={{
                          fontSize:     12,
                          fontWeight:   600,
                          color:        "var(--tag-red-txt)",
                          background:   "var(--tag-red-bg)",
                          border:       "none",
                          borderRadius: 6,
                          padding:      "5px 12px",
                          cursor:       "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add / Edit Modal ── */}
      {modalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-panel"
            style={{ maxWidth: 560, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div
              style={{
                borderBottom: "1px solid var(--border-soft)",
                paddingBottom: 16,
                marginBottom:  20,
              }}
            >
              <h2
                className="font-serif"
                style={{ fontSize: 22, fontWeight: 700, color: "var(--text-main)" }}
              >
                {editTarget ? "Edit Exercise" : "Add Exercise"}
              </h2>
            </div>

            {/* Fields */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Name */}
              <div>
                <label className="field-label">
                  Name <span style={{ color: "var(--ui-orange)" }}>*</span>
                </label>
                <input
                  className="field-input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Jab-Cross Combo"
                />
              </div>

              {/* Category */}
              <div>
                <label className="field-label">Category</label>
                <select
                  className="field-input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                  value={form.category}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, category: e.target.value as Category }))
                  }
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="field-label">Description</label>
                <textarea
                  className="field-input"
                  rows={3}
                  style={{ width: "100%", boxSizing: "border-box", resize: "vertical" }}
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Brief description of the exercise…"
                />
              </div>

              {/* Equipment */}
              <div>
                <label className="field-label">Equipment</label>
                <input
                  className="field-input"
                  style={{ width: "100%", boxSizing: "border-box" }}
                  value={form.equipment}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, equipment: e.target.value }))
                  }
                  placeholder="e.g. Heavy Bag, Boxing Gloves"
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                  Comma-separated list of required equipment.
                </p>
              </div>
            </div>

            {/* Modal footer */}
            <div
              style={{
                display:        "flex",
                justifyContent: "flex-end",
                gap:            10,
                marginTop:      24,
                paddingTop:     16,
                borderTop:      "1px solid var(--border-soft)",
              }}
            >
              <button className="btn-ghost" onClick={closeModal} disabled={saving}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSave}
                disabled={saving || !form.name.trim()}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteTarget && (
        <div className="modal-overlay" onClick={closeDelete}>
          <div
            className="modal-panel"
            style={{ maxWidth: 420, width: "100%" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              className="font-serif"
              style={{
                fontSize:     20,
                fontWeight:   700,
                color:        "var(--text-main)",
                marginBottom: 10,
              }}
            >
              Delete exercise?
            </h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24 }}>
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--text-main)" }}>
                {deleteTarget.name}
              </strong>
              ? This action cannot be undone.
            </p>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button className="btn-ghost" onClick={closeDelete} disabled={deleting}>
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                style={{
                  padding:      "9px 20px",
                  borderRadius: "var(--radius-pill)",
                  fontSize:     14,
                  fontWeight:   600,
                  border:       "none",
                  cursor:       deleting ? "not-allowed" : "pointer",
                  background:   "var(--tag-red-bg)",
                  color:        "var(--tag-red-txt)",
                  opacity:      deleting ? 0.6 : 1,
                }}
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
