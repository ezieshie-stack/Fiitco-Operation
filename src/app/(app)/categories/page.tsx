"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

interface CategoryDoc {
  _id: Id<"categories">;
  categoryId: string; name: string; colorCode: string;
  emoji: string; description: string; active: boolean;
}

const PRESET_COLORS = [
  { label: "Blue",   hex: "D6E8F5" }, { label: "Red",    hex: "FDDBD5" },
  { label: "Purple", hex: "EDE7F6" }, { label: "Pink",   hex: "FCE4EC" },
  { label: "Teal",   hex: "E0F2F1" }, { label: "Yellow", hex: "FFF9C4" },
  { label: "Green",  hex: "E8F5E9" }, { label: "Orange", hex: "FFF3E0" },
];

const CAT_TAG: Record<string, { bg: string; color: string }> = {
  "Strength & Conditioning": { bg: "var(--tag-red-bg)",    color: "var(--tag-red-txt)" },
  Boxing:                    { bg: "var(--tag-blue-bg)",   color: "var(--tag-blue-txt)" },
  Hybrid:                    { bg: "var(--tag-purple-bg)", color: "var(--tag-purple-txt)" },
  Pilates:                   { bg: "var(--tag-yellow-bg)", color: "var(--tag-yellow-txt)" },
  Yoga:                      { bg: "var(--tag-green-bg)",  color: "var(--tag-green-txt)" },
};

function CategoryModal({ initial, onClose, onSave }: {
  initial?: CategoryDoc;
  onClose: () => void;
  onSave: (data: { name: string; emoji: string; colorCode: string; description: string }) => void;
}) {
  const [name, setName]             = useState(initial?.name ?? "");
  const [emoji, setEmoji]           = useState(initial?.emoji ?? "🏋️");
  const [colorCode, setColorCode]   = useState(initial?.colorCode ?? "E0F2F1");
  const [description, setDescription] = useState(initial?.description ?? "");

  return (
    <div className="modal-overlay">
      <div className="modal-panel">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500 }}>
            {initial ? "Edit Category" : "New Category"}
          </h2>
          <button onClick={onClose} style={{ background: "none", border: "none", fontSize: 24, cursor: "pointer", color: "var(--text-muted)", lineHeight: 1 }}>×</button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "72px 1fr", gap: 12 }}>
            <div>
              <label className="field-label">Emoji</label>
              <input type="text" maxLength={2} className="field-input"
                style={{ textAlign: "center", fontSize: 24, padding: "8px" }}
                value={emoji} onChange={(e) => setEmoji(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Name</label>
              <input type="text" className="field-input" placeholder="e.g. Strength & Conditioning"
                value={name} onChange={(e) => setName(e.target.value)} />
            </div>
          </div>

          <div>
            <label className="field-label" style={{ marginBottom: 10 }}>Colour</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {PRESET_COLORS.map((c) => (
                <button key={c.hex} onClick={() => setColorCode(c.hex)} title={c.label}
                  style={{
                    width: 32, height: 32, borderRadius: "50%",
                    backgroundColor: `#${c.hex}`, border: "none", cursor: "pointer",
                    outline: colorCode === c.hex ? "3px solid var(--ui-dark)" : "3px solid transparent",
                    outlineOffset: 2,
                    transform: colorCode === c.hex ? "scale(1.15)" : "scale(1)",
                    transition: "all 0.15s",
                  }} />
              ))}
            </div>
          </div>

          <div>
            <label className="field-label">Description</label>
            <textarea rows={3} className="field-input" placeholder="What does this category cover?"
              style={{ resize: "none" }}
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          {name && (
            <div style={{ borderRadius: 14, padding: "14px 16px", display: "flex", alignItems: "center", gap: 14, backgroundColor: `#${colorCode}` }}>
              <span style={{ fontSize: 28 }}>{emoji}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: 15, color: "var(--text-main)" }}>{name}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>{description || "No description yet"}</p>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
          <button onClick={onClose} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
          <button onClick={() => onSave({ name, emoji, colorCode, description })}
            className="btn-primary" style={{ flex: 1 }} disabled={!name.trim()}>
            {initial ? "Save Changes" : "Create Category"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const categories    = (useQuery(api.queries.getCategories) ?? []) as CategoryDoc[];
  const classes       = useQuery(api.queries.getClasses) ?? [];
  const subcategories = useQuery(api.queries.getSubcategories) ?? [];
  const addCategory   = useMutation(api.mutations.addCategory);
  const updateCategory = useMutation(api.mutations.updateCategory);
  const deleteCategory = useMutation(api.mutations.deleteCategory);

  const [tab, setTab]                   = useState<"categories" | "subcategories">("categories");
  const [showModal, setShowModal]       = useState(false);
  const [editTarget, setEditTarget]     = useState<CategoryDoc | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<CategoryDoc | null>(null);

  const classesFor = (name: string) => classes.filter((c) => c.categoryName === name);

  async function handleCreate(data: { name: string; emoji: string; colorCode: string; description: string }) {
    await addCategory({ categoryId: `CAT-${String(categories.length + 1).padStart(2, "0")}`, ...data });
    setShowModal(false);
  }
  async function handleUpdate(data: { name: string; emoji: string; colorCode: string; description: string }) {
    if (!editTarget) return;
    await updateCategory({ id: editTarget._id, ...data, active: editTarget.active });
    setEditTarget(null);
  }
  async function handleDelete(cat: CategoryDoc) {
    await deleteCategory({ id: cat._id });
    setDeleteConfirm(null);
  }

  return (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div>
          <h1 className="page-title">Categories</h1>
          <p className="page-subtitle" style={{ marginBottom: 0 }}>Source-of-truth library — all classes reference a category here.</p>
        </div>
        {tab === "categories" && <button onClick={() => setShowModal(true)} className="btn-primary">+ New Category</button>}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 32 }}>
        {(["categories", "subcategories"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "8px 20px", borderRadius: "var(--radius-pill)", fontSize: 14, fontWeight: 500,
              border: "none", cursor: "pointer", transition: "all 0.15s",
              background: tab === t ? "var(--ui-dark)" : "var(--bg-beige)",
              color: tab === t ? "#fff" : "var(--text-muted)",
            }}>
            {t === "categories" ? `Categories (${categories.length})` : `Subcategories (${subcategories.length})`}
          </button>
        ))}
      </div>

      {/* Stats */}
      {(() => {
        const stats = tab === "categories" ? [
          { label: "Total Categories",   value: categories.length,                        color: "var(--text-main)" },
          { label: "Active",             value: categories.filter((c) => c.active).length, color: "var(--tag-green-txt)" },
          { label: "Classes Mapped",     value: classes.length,                            color: "var(--tag-blue-txt)" },
        ] : [
          { label: "Total Subcategories", value: subcategories.length,                                 color: "var(--text-main)" },
          { label: "Active",              value: subcategories.filter((s) => s.active).length,         color: "var(--tag-green-txt)" },
          { label: "Categories Covered",  value: new Set(subcategories.map((s) => s.categoryId)).size, color: "var(--tag-blue-txt)" },
        ];
        return (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 32 }}>
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <p className="stat-label">{s.label}</p>
                <p className="stat-value" style={{ color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* Subcategories tab */}
      {tab === "subcategories" && (
        <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", overflow: "hidden", overflowX: "auto", WebkitOverflowScrolling: "touch", boxShadow: "0 2px 12px rgba(0,0,0,0.03)" }}>
          <div style={{ display: "grid", gridTemplateColumns: "80px 180px 180px 1fr 70px", padding: "12px 28px", background: "var(--ui-dark)", minWidth: 600 }}>
            {["ID", "Subcategory", "Category", "Description", "Status"].map(h => (
              <p key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "rgba(255,255,255,0.55)" }}>{h}</p>
            ))}
          </div>
          {subcategories.map((sub, i) => {
            const tag = CAT_TAG[sub.categoryName] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
            return (
              <div key={sub._id}
                style={{ display: "grid", gridTemplateColumns: "80px 180px 180px 1fr 70px", padding: "16px 28px", borderBottom: i < subcategories.length - 1 ? "1px solid var(--border-soft)" : "none", alignItems: "center", transition: "background 0.1s", minWidth: 600 }}
                onMouseEnter={e => (e.currentTarget.style.background = "var(--bg-beige)")}
                onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
              >
                <p style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>{sub.subcategoryId}</p>
                <p className="font-serif" style={{ fontSize: 15, fontWeight: 500, color: "var(--text-main)" }}>{sub.name}</p>
                <span style={{ fontSize: 11, fontWeight: 700, background: tag.bg, color: tag.color, padding: "4px 10px", borderRadius: "var(--radius-pill)", width: "fit-content" }}>{sub.categoryName}</span>
                <p style={{ fontSize: 13, color: "var(--text-muted)", paddingRight: 16 }}>{sub.description}</p>
                <span style={{ fontSize: 11, fontWeight: 600, color: sub.active ? "var(--tag-green-txt)" : "var(--text-muted)" }}>{sub.active ? "Active" : "Inactive"}</span>
              </div>
            );
          })}
          {subcategories.length === 0 && (
            <div style={{ padding: "60px 40px", textAlign: "center" }}>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>No subcategories found — click Reload Data on the dashboard to seed</p>
            </div>
          )}
        </div>
      )}

      {/* Category cards */}
      {tab === "categories" && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            {categories.map((cat) => {
              const tag   = CAT_TAG[cat.name] ?? { bg: "var(--bg-beige)", color: "var(--text-muted)" };
              const linked = classesFor(cat.name);
              return (
                <div
                  key={cat._id}
                  style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "24px 28px", display: "flex", gap: 20, boxShadow: "0 2px 12px rgba(0,0,0,0.03)", position: "relative" }}
                  className="group"
                >
                  <div style={{ width: 56, height: 56, borderRadius: 16, background: `#${cat.colorCode}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, flexShrink: 0 }}>
                    {cat.emoji}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <p className="font-serif" style={{ fontSize: 18, fontWeight: 500, color: "var(--text-main)", marginBottom: 4 }}>{cat.name}</p>
                      <div style={{ display: "flex", gap: 6, opacity: 0 }} className="group-actions">
                        <button onClick={() => setEditTarget(cat)}
                          style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "var(--tag-blue-txt)", cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}>Edit</button>
                        <button onClick={() => setDeleteConfirm(cat)}
                          style={{ background: "none", border: "none", fontSize: 13, fontWeight: 600, color: "var(--tag-red-txt)", cursor: "pointer", padding: "4px 8px", borderRadius: 8 }}>Delete</button>
                      </div>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.5, marginBottom: 14 }}>{cat.description}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 12, fontWeight: 600, color: cat.active ? "var(--tag-green-txt)" : "var(--text-muted)" }}>
                        {cat.active ? "Active" : "Inactive"}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{linked.length} {linked.length === 1 ? "class" : "classes"}</span>
                      {linked.slice(0, 3).map((cl) => (
                        <span key={cl.classId} className="cat-tag" style={{ background: tag.bg, color: tag.color, fontSize: 11 }}>{cl.name}</span>
                      ))}
                      {linked.length > 3 && <span style={{ fontSize: 12, color: "var(--text-muted)" }}>+{linked.length - 3} more</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {categories.length === 0 && (
            <div style={{ background: "var(--bg-panel)", borderRadius: "var(--radius-card)", padding: "80px 40px", textAlign: "center" }}>
              <p style={{ fontSize: 48, marginBottom: 16 }}>📂</p>
              <p className="font-serif" style={{ fontSize: 20, fontWeight: 500, marginBottom: 8 }}>No categories yet</p>
              <p style={{ color: "var(--text-muted)", fontSize: 14 }}>Add your first category to get started</p>
            </div>
          )}
        </>
      )}

      {showModal && <CategoryModal onClose={() => setShowModal(false)} onSave={handleCreate} />}
      {editTarget && <CategoryModal initial={editTarget} onClose={() => setEditTarget(null)} onSave={handleUpdate} />}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-panel" style={{ maxWidth: 400 }}>
            <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 500, marginBottom: 12 }}>Delete Category?</h2>
            <p style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 12 }}>
              You are about to delete <strong style={{ color: "var(--text-main)" }}>{deleteConfirm.name}</strong>.
            </p>
            <div style={{ background: "var(--tag-yellow-bg)", borderRadius: 12, padding: 14, fontSize: 13, color: "var(--tag-yellow-txt)", fontWeight: 500 }}>
              ⚠️ This will not remove classes linked to this category. Update those separately.
            </div>
            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button onClick={() => setDeleteConfirm(null)} className="btn-ghost" style={{ flex: 1 }}>Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)}
                style={{ flex: 1, background: "var(--tag-red-txt)", color: "#fff", border: "none", padding: "12px", borderRadius: "var(--radius-pill)", fontSize: 14, fontWeight: 500, cursor: "pointer", fontFamily: "inherit" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`.group:hover .group-actions { opacity: 1 !important; transition: opacity 0.15s; }`}</style>
    </div>
  );
}
