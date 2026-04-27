"use client";

/**
 * Website Community admin — manages local business collaborator cards
 * shown on the /community page of the customer website.
 *
 * Follows the same CRUD + photo-upload pattern as /website-trainers.
 */

import { useState, useRef } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type Collaborator = {
  _id: Id<"collaborators">;
  slug: string;
  name: string;
  category: string;
  description: string;
  href?: string;
  location?: string;
  photoUrl?: string;
  confirmed: boolean;
  displayOrder: number;
  active: boolean;
};

type FormState = {
  slug: string;
  name: string;
  category: string;
  description: string;
  href: string;
  location: string;
  photoUrl: string;
  confirmed: boolean;
  displayOrder: string;
};

const emptyForm = (): FormState => ({
  slug: "",
  name: "",
  category: "",
  description: "",
  href: "",
  location: "",
  photoUrl: "",
  confirmed: true,
  displayOrder: "99",
});

function slugify(n: string): string {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function WebsiteCommunityPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const collaborators = useQuery(api.websiteContent.listCollaborators);
  const createCollaborator = useMutation(api.websiteContent.createCollaborator);
  const updateCollaborator = useMutation(api.websiteContent.updateCollaborator);
  const deleteCollaborator = useMutation(api.websiteContent.deleteCollaborator);
  const reorderCollaborators = useMutation(api.websiteContent.reorderCollaborators);
  const generateUploadUrl = useMutation(api.websiteContent.generateUploadUrl);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Collaborator | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingStorageIdRef = useRef<Id<"_storage"> | null>(null);

  const confirmedCount = collaborators?.filter((c) => c.confirmed && c.active).length ?? 0;
  const placeholderCount = collaborators?.filter((c) => !c.confirmed && c.active).length ?? 0;
  const inactiveCount = collaborators?.filter((c) => !c.active).length ?? 0;

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(c: Collaborator) {
    setEditTarget(c);
    setForm({
      slug: c.slug,
      name: c.name,
      category: c.category,
      description: c.description,
      href: c.href ?? "",
      location: c.location ?? "",
      photoUrl: c.photoUrl ?? "",
      confirmed: c.confirmed,
      displayOrder: String(c.displayOrder),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm());
    pendingStorageIdRef.current = null;
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

      if (editTarget) {
        await updateCollaborator({
          id: editTarget._id,
          photoStorageId: storageId as Id<"_storage">,
        });
      } else {
        pendingStorageIdRef.current = storageId as Id<"_storage">;
        setForm((f) => ({ ...f, photoUrl: URL.createObjectURL(file) }));
      }
      setStatusMsg({ type: "ok", text: "Photo uploaded" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    if (!form.name.trim() || !form.category.trim() || !form.description.trim()) {
      setStatusMsg({ type: "err", text: "Name, category, and description are required" });
      return;
    }
    if (!isAdmin) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.name);
      const displayOrder = Number(form.displayOrder) || 99;
      const base = {
        slug,
        name: form.name.trim(),
        category: form.category.trim(),
        description: form.description.trim(),
        ...(form.href.trim() ? { href: form.href.trim() } : {}),
        ...(form.location.trim() ? { location: form.location.trim() } : {}),
        confirmed: form.confirmed,
        displayOrder,
      };

      if (editTarget) {
        await updateCollaborator({
          id: editTarget._id,
          ...base,
          ...(form.photoUrl && !form.photoUrl.startsWith("blob:")
            ? { photoUrl: form.photoUrl }
            : {}),
        });
      } else {
        await createCollaborator({
          ...base,
          ...(pendingStorageIdRef.current
            ? { photoStorageId: pendingStorageIdRef.current }
            : form.photoUrl
            ? { photoUrl: form.photoUrl }
            : {}),
        });
      }

      setStatusMsg({ type: "ok", text: "Saved ✓" });
      closeModal();
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(c: Collaborator) {
    if (!isAdmin) return;
    if (!window.confirm(`Hide "${c.name}" from the website?`)) return;
    await deleteCollaborator({ id: c._id });
    setStatusMsg({ type: "ok", text: `Hidden: ${c.name}` });
    setTimeout(() => setStatusMsg(null), 2500);
  }

  async function handleToggleActive(c: Collaborator) {
    if (!isAdmin) return;
    await updateCollaborator({ id: c._id, active: !c.active });
  }

  async function handleMove(c: Collaborator, dir: "up" | "down") {
    if (!collaborators || !isAdmin) return;
    const sorted = [...collaborators].sort((a, b) => a.displayOrder - b.displayOrder);
    const i = sorted.findIndex((x) => x._id === c._id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    await reorderCollaborators({ orderedIds: sorted.map((x) => x._id) });
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Community
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Local business collaborators shown on the customer website&apos;s /community page.
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
            + Add Collaborator
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="Confirmed" value={confirmedCount} />
        <StatCard label="Placeholders" value={placeholderCount} />
        <StatCard label="Hidden" value={inactiveCount} />
      </div>

      {statusMsg && <StatusBanner msg={statusMsg} />}

      {collaborators === undefined ? (
        <p>Loading…</p>
      ) : collaborators.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No collaborators yet.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th style={th}>Order</th>
                <th style={th}>Name</th>
                <th style={th}>Category</th>
                <th style={th}>Location</th>
                <th style={th}>Status</th>
                <th style={th}>Active</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...collaborators]
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((c, i, arr) => (
                  <tr key={c._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: c.active ? 1 : 0.5 }}>
                    <td style={td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button disabled={i === 0 || !isAdmin} onClick={() => handleMove(c, "up")} style={reorderBtnStyle(i === 0 || !isAdmin)}>↑</button>
                        <button disabled={i === arr.length - 1 || !isAdmin} onClick={() => handleMove(c, "down")} style={reorderBtnStyle(i === arr.length - 1 || !isAdmin)}>↓</button>
                      </div>
                    </td>
                    <td style={td}>
                      <div style={{ fontWeight: 500 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.slug}</div>
                    </td>
                    <td style={td}>{c.category}</td>
                    <td style={td}>{c.location ?? "—"}</td>
                    <td style={td}>
                      {c.confirmed ? (
                        <span style={chipStyle("#E8F5E9", "#1B5E20")}>Confirmed</span>
                      ) : (
                        <span style={chipStyle("#FFF3E0", "#E65100")}>Placeholder</span>
                      )}
                    </td>
                    <td style={td}>
                      <input type="checkbox" checked={c.active} onChange={() => handleToggleActive(c)} disabled={!isAdmin} />
                    </td>
                    <td style={td}>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openEdit(c)} style={actionBtnStyle}>Edit</button>
                          <button onClick={() => handleDelete(c)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>Hide</button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div onClick={closeModal} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalInnerStyle}>
            <h2 className="font-serif" style={{ fontSize: 24, margin: "0 0 24px", fontWeight: 500 }}>
              {editTarget ? "Edit Collaborator" : "Add Collaborator"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Name" required>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} placeholder="The Vatican Gift Shop" />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <Field label="Category" required hint="e.g. Coffee, Nutrition, Wellness, Neighbour">
                  <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle} placeholder="Nutrition" />
                </Field>
                <Field label="Location" hint="Optional — street or area">
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} style={inputStyle} placeholder="Leslieville · Toronto" />
                </Field>
              </div>

              <Field label="Description" required>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} placeholder="One-line description of the collaborator and their relationship with FIIT Co." />
              </Field>

              <Field label="Website URL" hint="Optional — the 'Visit Site' button shows only if set.">
                <input type="url" value={form.href} onChange={(e) => setForm({ ...form, href: e.target.value })} style={inputStyle} placeholder="https://..." />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Field label="Slug" hint="Auto-generated from name if blank.">
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} placeholder={form.name ? slugify(form.name) : "collaborator-slug"} />
                </Field>
                <Field label="Display Order">
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <Field label="Status" hint="Uncheck for 'Coming Soon' placeholder cards.">
                <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14 }}>
                  <input type="checkbox" checked={form.confirmed} onChange={(e) => setForm({ ...form, confirmed: e.target.checked })} />
                  Confirmed partner (shown without &quot;Coming Soon&quot; tag)
                </label>
              </Field>

              <Field label="Photo (optional)">
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {form.photoUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.photoUrl} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover" }} />
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ ...actionBtnStyle, padding: "8px 14px" }}>
                    {uploading ? "Uploading…" : form.photoUrl ? "Replace Photo" : "Upload Photo"}
                  </button>
                  {form.photoUrl && (
                    <button onClick={() => { pendingStorageIdRef.current = null; setForm({ ...form, photoUrl: "" }); }} style={{ ...actionBtnStyle, padding: "8px 14px", color: "#B71C1C" }}>
                      Remove
                    </button>
                  )}
                </div>
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Collaborator"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Shared presentational helpers (identical across CMS admin pages) ──

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", minWidth: 140 }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text-main)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function StatusBanner({ msg }: { msg: { type: "ok" | "err"; text: string } }) {
  return (
    <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 14, background: msg.type === "ok" ? "#E8F5E9" : "#FFEBEE", color: msg.type === "ok" ? "#1B5E20" : "#B71C1C", border: `1px solid ${msg.type === "ok" ? "#A5D6A7" : "#EF9A9A"}` }}>
      {msg.text}
    </div>
  );
}

function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-main)", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#D92B2B", marginLeft: 4 }}>*</span>}
      </label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}

const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff" };
const actionBtnStyle: React.CSSProperties = { padding: "6px 12px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "var(--text-main)" };
function reorderBtnStyle(disabled: boolean): React.CSSProperties { return { ...actionBtnStyle, padding: "4px 8px", opacity: disabled ? 0.3 : 1, cursor: disabled ? "not-allowed" : "pointer" }; }
function primaryBtnStyle(saving: boolean): React.CSSProperties { return { padding: "10px 20px", background: "var(--ui-dark, #1E1812)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }; }
function chipStyle(bg: string, fg: string): React.CSSProperties { return { fontSize: 11, padding: "3px 8px", borderRadius: 10, background: bg, color: fg, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }; }
const th: React.CSSProperties = { textAlign: "left", padding: "14px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, color: "var(--text-main)", verticalAlign: "middle" };
const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalInnerStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 32, maxWidth: 720, width: "100%", maxHeight: "90vh", overflow: "auto" };
