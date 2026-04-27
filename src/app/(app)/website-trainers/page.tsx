"use client";

/**
 * Website Trainers admin page.
 *
 * Manages the public-facing trainer roster that powers the homepage team
 * showcase and About page trainer list on the customer website. Separate
 * from the ops `instructors` table — this is marketing content (bios,
 * photos, tags, display order), while instructors tracks operational
 * data (email, phone, join date).
 *
 * Write flow for photos (Convex file storage):
 *   1. generateUploadUrl() → signed POST URL
 *   2. fetch(url, { method: POST, body: file }) → { storageId }
 *   3. create/update mutation called with photoStorageId → server
 *      resolves storageId to a CDN URL and stores it on the record.
 */

import { useState, useRef } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type Trainer = {
  _id: Id<"trainers">;
  slug: string;
  name: string;
  role: string;
  category: string;
  bio: string;
  fullBio: string[];
  tags: string[];
  photoUrl?: string;
  displayOrder: number;
  active: boolean;
  updatedAt: string;
};

type FormState = {
  slug: string;
  name: string;
  role: string;
  category: string;
  bio: string;
  fullBioText: string;      // multi-line textarea → split on blank lines to array
  tagsText: string;         // comma-separated → array
  photoUrl: string;
  displayOrder: string;     // kept as string for form input, cast on save
};

const emptyForm = (): FormState => ({
  slug: "",
  name: "",
  role: "",
  category: "fiit",
  bio: "",
  fullBioText: "",
  tagsText: "",
  photoUrl: "",
  displayOrder: "99",
});

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function initials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function WebsiteTrainersPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const trainers = useQuery(api.websiteContent.listTrainers);
  const createTrainer = useMutation(api.websiteContent.createTrainer);
  const updateTrainer = useMutation(api.websiteContent.updateTrainer);
  const deleteTrainer = useMutation(api.websiteContent.deleteTrainer);
  const reorderTrainers = useMutation(api.websiteContent.reorderTrainers);
  const generateUploadUrl = useMutation(api.websiteContent.generateUploadUrl);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Trainer | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fiitCount = trainers?.filter((t) => t.category === "fiit" && t.active).length ?? 0;
  const academyCount = trainers?.filter((t) => t.category === "academy" && t.active).length ?? 0;
  const inactiveCount = trainers?.filter((t) => !t.active).length ?? 0;

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(t: Trainer) {
    setEditTarget(t);
    setForm({
      slug: t.slug,
      name: t.name,
      role: t.role,
      category: t.category,
      bio: t.bio,
      fullBioText: t.fullBio.join("\n\n"),
      tagsText: t.tags.join(", "),
      photoUrl: t.photoUrl ?? "",
      displayOrder: String(t.displayOrder),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm());
  }

  async function handlePhotoUpload(file: File) {
    if (!isAdmin) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { storageId } = await res.json();

      // Finalize via create/update so the URL resolves and persists.
      if (editTarget) {
        await updateTrainer({
          id: editTarget._id,
          photoStorageId: storageId as Id<"_storage">,
        });
      } else {
        // For a new trainer, stash the storageId; we'll include it on save.
        // Since the form doesn't hold storage ids directly, we do a quick
        // create-now approach: if the trainer is brand new and name is set,
        // create the trainer immediately with the photo attached. Otherwise
        // we just show a preview and re-upload on save.
        // Simpler: just require fill-in-form then save. Show preview only.
        const previewUrl = URL.createObjectURL(file);
        setForm((f) => ({ ...f, photoUrl: previewUrl }));
        // Store the storageId on a ref so save picks it up.
        pendingStorageIdRef.current = storageId as Id<"_storage">;
      }

      setStatusMsg({ type: "ok", text: "Photo uploaded" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  }

  const pendingStorageIdRef = useRef<Id<"_storage"> | null>(null);

  async function handleSave() {
    if (!form.name.trim() || !form.role.trim() || !form.bio.trim()) {
      setStatusMsg({ type: "err", text: "Name, role, and bio are required" });
      return;
    }
    if (!isAdmin) {
      setStatusMsg({ type: "err", text: "Only admins can save changes" });
      return;
    }

    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.name);
      const tags = form.tagsText
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const fullBio = form.fullBioText
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean);
      const displayOrder = Number(form.displayOrder) || 99;

      if (editTarget) {
        await updateTrainer({
          id: editTarget._id,
          slug,
          name: form.name.trim(),
          role: form.role.trim(),
          category: form.category,
          bio: form.bio.trim(),
          fullBio: fullBio.length > 0 ? fullBio : [form.bio.trim()],
          tags,
          displayOrder,
          ...(form.photoUrl && !form.photoUrl.startsWith("blob:")
            ? { photoUrl: form.photoUrl }
            : {}),
        });
      } else {
        await createTrainer({
          slug,
          name: form.name.trim(),
          role: form.role.trim(),
          category: form.category,
          bio: form.bio.trim(),
          fullBio: fullBio.length > 0 ? fullBio : [form.bio.trim()],
          tags,
          displayOrder,
          ...(pendingStorageIdRef.current
            ? { photoStorageId: pendingStorageIdRef.current }
            : form.photoUrl
            ? { photoUrl: form.photoUrl }
            : {}),
        });
        pendingStorageIdRef.current = null;
      }

      setStatusMsg({ type: "ok", text: "Saved ✓" });
      closeModal();
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(t: Trainer) {
    if (!isAdmin) return;
    const confirmed = window.confirm(
      `Hide "${t.name}" from the website? They'll be marked inactive but the record stays in the database. You can reactivate later.`
    );
    if (!confirmed) return;
    try {
      await deleteTrainer({ id: t._id });
      setStatusMsg({ type: "ok", text: `Hidden: ${t.name}` });
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Delete failed",
      });
    }
  }

  async function handleToggleActive(t: Trainer) {
    if (!isAdmin) return;
    try {
      await updateTrainer({ id: t._id, active: !t.active });
    } catch (err) {
      setStatusMsg({
        type: "err",
        text: err instanceof Error ? err.message : "Toggle failed",
      });
    }
  }

  async function handleMove(t: Trainer, direction: "up" | "down") {
    if (!trainers || !isAdmin) return;
    const sorted = [...trainers].sort((a, b) => a.displayOrder - b.displayOrder);
    const idx = sorted.findIndex((x) => x._id === t._id);
    if (idx === -1) return;
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= sorted.length) return;
    [sorted[idx], sorted[swapIdx]] = [sorted[swapIdx], sorted[idx]];
    await reorderTrainers({ orderedIds: sorted.map((x) => x._id) });
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Trainers
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Trainer bios + photos shown on the customer website. Separate from the internal instructor roster.
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openAdd}
            style={{
              padding: "10px 20px",
              background: "var(--ui-dark, #1E1812)",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            + Add Trainer
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="FIIT Trainers" value={fiitCount} />
        <StatCard label="Boxing Academy" value={academyCount} />
        <StatCard label="Hidden" value={inactiveCount} />
      </div>

      {/* Status message */}
      {statusMsg && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 6,
            marginBottom: 16,
            fontSize: 14,
            background: statusMsg.type === "ok" ? "#E8F5E9" : "#FFEBEE",
            color: statusMsg.type === "ok" ? "#1B5E20" : "#B71C1C",
            border: `1px solid ${statusMsg.type === "ok" ? "#A5D6A7" : "#EF9A9A"}`,
          }}
        >
          {statusMsg.text}
        </div>
      )}

      {/* Trainer table */}
      {trainers === undefined ? (
        <p>Loading…</p>
      ) : trainers.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>
          No trainers yet. Click &quot;Add Trainer&quot; to create the first one.
        </p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th style={th}>Order</th>
                <th style={th}>Photo</th>
                <th style={th}>Name</th>
                <th style={th}>Role</th>
                <th style={th}>Category</th>
                <th style={th}>Active</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...trainers]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((t, i, arr) => (
                  <tr key={t._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: t.active ? 1 : 0.5 }}>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button
                          disabled={i === 0 || !isAdmin}
                          onClick={() => handleMove(t, "up")}
                          style={reorderBtnStyle(i === 0 || !isAdmin)}
                          aria-label="Move up"
                        >
                          ↑
                        </button>
                        <button
                          disabled={i === arr.length - 1 || !isAdmin}
                          onClick={() => handleMove(t, "down")}
                          style={reorderBtnStyle(i === arr.length - 1 || !isAdmin)}
                          aria-label="Move down"
                        >
                          ↓
                        </button>
                      </div>
                    </td>
                    <td style={td}>
                      {t.photoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={t.photoUrl}
                          alt={t.name}
                          style={{ width: 44, height: 44, borderRadius: "50%", objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "#EAE4DB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: 14,
                            fontWeight: 600,
                            color: "#8B7F72",
                          }}
                        >
                          {initials(t.name)}
                        </div>
                      )}
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 500 }}>{t.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.slug}</div>
                    </td>
                    <td style={td}>{t.role}</td>
                    <td style={td}>
                      <span
                        style={{
                          fontSize: 11,
                          padding: "3px 8px",
                          borderRadius: 10,
                          background: t.category === "academy" ? "#FFE4E4" : "#E3F2FD",
                          color: t.category === "academy" ? "#B71C1C" : "#0D47A1",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                        }}
                      >
                        {t.category}
                      </span>
                    </td>
                    <td style={td}>
                      <label style={{ display: "inline-flex", alignItems: "center", cursor: isAdmin ? "pointer" : "default" }}>
                        <input
                          type="checkbox"
                          checked={t.active}
                          onChange={() => handleToggleActive(t)}
                          disabled={!isAdmin}
                        />
                      </label>
                    </td>
                    <td style={td}>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openEdit(t)} style={actionBtnStyle}>
                            Edit
                          </button>
                          <button onClick={() => handleDelete(t)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>
                            Hide
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit modal */}
      {showModal && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 32,
              maxWidth: 720,
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
          >
            <h2 className="font-serif" style={{ fontSize: 24, margin: "0 0 24px", fontWeight: 500 }}>
              {editTarget ? "Edit Trainer" : "Add Trainer"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Name" required>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  style={inputStyle}
                  placeholder="Jason Battiste"
                />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Role" required>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    style={inputStyle}
                    placeholder="Owner & Founder"
                  />
                </Field>
                <Field label="Category">
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={inputStyle}
                  >
                    <option value="fiit">FIIT Trainer</option>
                    <option value="academy">Boxing Academy</option>
                  </select>
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Field label="Slug" hint="URL anchor on About page. Auto-generated from name if blank.">
                  <input
                    type="text"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    style={inputStyle}
                    placeholder={form.name ? slugify(form.name) : "jason"}
                  />
                </Field>
                <Field label="Display Order" hint="Lower numbers show first.">
                  <input
                    type="number"
                    value={form.displayOrder}
                    onChange={(e) => setForm({ ...form, displayOrder: e.target.value })}
                    style={inputStyle}
                  />
                </Field>
              </div>

              <Field label="Short Bio (1 line, hover card)" required>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                  placeholder="Former Canadian Super Middleweight Kickboxing Champion with 37+ years in combat training."
                />
              </Field>

              <Field label="Full Bio (About page)" hint="Multi-paragraph. Separate paragraphs with a blank line.">
                <textarea
                  value={form.fullBioText}
                  onChange={(e) => setForm({ ...form, fullBioText: e.target.value })}
                  style={{ ...inputStyle, minHeight: 140, resize: "vertical" }}
                  placeholder="Jason Battiste is the founder of FIIT Co. and the reason the studio exists...&#10;&#10;He opened FIIT Co. in Leslieville because..."
                />
              </Field>

              <Field label="Tags" hint="Comma-separated. Shown as chips on the About page.">
                <input
                  type="text"
                  value={form.tagsText}
                  onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
                  style={inputStyle}
                  placeholder="Boxing, Kickboxing, Founder"
                />
              </Field>

              <Field label="Photo">
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {form.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={form.photoUrl}
                      alt="Current"
                      style={{ width: 72, height: 72, borderRadius: "50%", objectFit: "cover" }}
                    />
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: "none" }}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handlePhotoUpload(f);
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    style={{ ...actionBtnStyle, padding: "8px 14px" }}
                  >
                    {uploading ? "Uploading…" : form.photoUrl ? "Replace Photo" : "Upload Photo"}
                  </button>
                  {form.photoUrl && (
                    <button
                      onClick={() => {
                        pendingStorageIdRef.current = null;
                        setForm({ ...form, photoUrl: "" });
                      }}
                      style={{ ...actionBtnStyle, padding: "8px 14px", color: "#B71C1C" }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: "10px 20px",
                  background: "var(--ui-dark, #1E1812)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: saving ? "not-allowed" : "pointer",
                  opacity: saving ? 0.6 : 1,
                }}
              >
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Trainer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Small presentational helpers ─────────────────────────────────────────

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: "16px 20px",
        background: "#fff",
        borderRadius: 12,
        border: "1px solid rgba(0,0,0,0.06)",
        minWidth: 140,
      }}
    >
      <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text-main)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-main)", marginBottom: 6 }}>
        {label}
        {required && <span style={{ color: "#D92B2B", marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid rgba(0,0,0,0.15)",
  borderRadius: 6,
  fontSize: 14,
  fontFamily: "inherit",
  outline: "none",
  background: "#fff",
};

const actionBtnStyle: React.CSSProperties = {
  padding: "6px 12px",
  border: "1px solid rgba(0,0,0,0.12)",
  background: "#fff",
  borderRadius: 6,
  fontSize: 13,
  cursor: "pointer",
  color: "var(--text-main)",
};

function reorderBtnStyle(disabled: boolean): React.CSSProperties {
  return {
    ...actionBtnStyle,
    padding: "4px 8px",
    opacity: disabled ? 0.3 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
  };
}

const th: React.CSSProperties = {
  textAlign: "left",
  padding: "14px 16px",
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  color: "var(--text-muted)",
  fontWeight: 600,
};

const td: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: 14,
  color: "var(--text-main)",
  verticalAlign: "middle",
};
