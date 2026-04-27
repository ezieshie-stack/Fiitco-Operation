"use client";

/**
 * Website Class Formats admin — manages the 12 class cards on the Programs
 * page of the customer website. Split into two sections (FIIT group
 * classes + Boxing Academy) by the `category` field.
 */

import { useState, useRef } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type ClassFormat = {
  _id: Id<"classFormats">;
  slug: string;
  num: string;
  tag: string;
  title: string;
  category: string;
  imageUrl?: string;
  includes: string[];
  who: string;
  displayOrder: number;
  active: boolean;
};

type FormState = {
  slug: string; num: string; tag: string; title: string; category: string;
  imageUrl: string; includesText: string; who: string; displayOrder: string;
};

const emptyForm = (): FormState => ({
  slug: "", num: "", tag: "", title: "", category: "fiit",
  imageUrl: "", includesText: "", who: "", displayOrder: "99",
});

function slugify(n: string): string {
  return n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export default function WebsiteClassFormatsPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const formats = useQuery(api.websiteContent.listClassFormats);
  const createClassFormat = useMutation(api.websiteContent.createClassFormat);
  const updateClassFormat = useMutation(api.websiteContent.updateClassFormat);
  const deleteClassFormat = useMutation(api.websiteContent.deleteClassFormat);
  const reorderClassFormats = useMutation(api.websiteContent.reorderClassFormats);
  const generateUploadUrl = useMutation(api.websiteContent.generateUploadUrl);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<ClassFormat | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingStorageIdRef = useRef<Id<"_storage"> | null>(null);

  const fiitCount = formats?.filter((f) => f.category === "fiit" && f.active).length ?? 0;
  const academyCount = formats?.filter((f) => f.category === "academy" && f.active).length ?? 0;

  function openAdd() { setEditTarget(null); setForm(emptyForm()); setShowModal(true); }
  function openEdit(f: ClassFormat) {
    setEditTarget(f);
    setForm({
      slug: f.slug, num: f.num, tag: f.tag, title: f.title, category: f.category,
      imageUrl: f.imageUrl ?? "", includesText: f.includes.join("\n"),
      who: f.who, displayOrder: String(f.displayOrder),
    });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditTarget(null); setForm(emptyForm()); pendingStorageIdRef.current = null; }

  async function handlePhotoUpload(file: File) {
    if (!isAdmin) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { storageId } = await res.json();
      if (editTarget) {
        await updateClassFormat({ id: editTarget._id, imageStorageId: storageId as Id<"_storage"> });
      } else {
        pendingStorageIdRef.current = storageId as Id<"_storage">;
        setForm((f) => ({ ...f, imageUrl: URL.createObjectURL(file) }));
      }
      setStatusMsg({ type: "ok", text: "Image uploaded" });
      setTimeout(() => setStatusMsg(null), 2000);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Upload failed" });
    } finally { setUploading(false); }
  }

  async function handleSave() {
    if (!form.title.trim() || !form.tag.trim() || !form.who.trim()) {
      setStatusMsg({ type: "err", text: "Title, tag, and who-it's-for are required" });
      return;
    }
    if (!isAdmin) return;
    setSaving(true);
    try {
      const slug = form.slug.trim() || slugify(form.title);
      const includes = form.includesText.split("\n").map((s) => s.trim()).filter(Boolean);
      const base = {
        slug, num: form.num.trim() || String(Math.floor(Number(form.displayOrder) || 99)).padStart(2, "0"),
        tag: form.tag.trim(), title: form.title.trim(), category: form.category,
        includes, who: form.who.trim(),
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editTarget) {
        await updateClassFormat({ id: editTarget._id, ...base,
          ...(form.imageUrl && !form.imageUrl.startsWith("blob:") ? { imageUrl: form.imageUrl } : {}) });
      } else {
        await createClassFormat({ ...base,
          ...(pendingStorageIdRef.current ? { imageStorageId: pendingStorageIdRef.current }
            : form.imageUrl ? { imageUrl: form.imageUrl } : {}) });
      }
      setStatusMsg({ type: "ok", text: "Saved ✓" });
      closeModal();
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally { setSaving(false); }
  }

  async function handleDelete(f: ClassFormat) {
    if (!isAdmin) return;
    if (!window.confirm(`Hide "${f.title}" from the website?`)) return;
    await deleteClassFormat({ id: f._id });
    setStatusMsg({ type: "ok", text: `Hidden: ${f.title}` });
    setTimeout(() => setStatusMsg(null), 2500);
  }

  async function handleMove(f: ClassFormat, dir: "up" | "down") {
    if (!formats || !isAdmin) return;
    const sorted = [...formats].sort((a, b) => a.displayOrder - b.displayOrder);
    const i = sorted.findIndex((x) => x._id === f._id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    await reorderClassFormats({ orderedIds: sorted.map((x) => x._id) });
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Class Formats
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Class cards shown on the Programs page. Split into FIIT group classes + Boxing Academy by category.
          </p>
        </div>
        {isAdmin && <button onClick={openAdd} style={primaryBtnStyle(false)}>+ Add Class</button>}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="FIIT Classes" value={fiitCount} />
        <StatCard label="Boxing Academy" value={academyCount} />
      </div>

      {statusMsg && <StatusBanner msg={statusMsg} />}

      {formats === undefined ? (<p>Loading…</p>)
       : formats.length === 0 ? (<p style={{ color: "var(--text-muted)" }}>No classes yet.</p>)
       : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
            <thead>
              <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th style={th}>Order</th>
                <th style={th}>Image</th>
                <th style={th}>Title</th>
                <th style={th}>Tag</th>
                <th style={th}>Category</th>
                <th style={th}>Active</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...formats].sort((a, b) => a.displayOrder - b.displayOrder).map((f, i, arr) => (
                <tr key={f._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: f.active ? 1 : 0.5 }}>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button disabled={i === 0 || !isAdmin} onClick={() => handleMove(f, "up")} style={reorderBtnStyle(i === 0 || !isAdmin)}>↑</button>
                      <button disabled={i === arr.length - 1 || !isAdmin} onClick={() => handleMove(f, "down")} style={reorderBtnStyle(i === arr.length - 1 || !isAdmin)}>↓</button>
                    </div>
                  </td>
                  <td style={td}>
                    {f.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={f.imageUrl} alt={f.title} style={{ width: 56, height: 36, borderRadius: 4, objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 56, height: 36, borderRadius: 4, background: "#EAE4DB", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#8B7F72" }}>—</div>
                    )}
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{f.num} · {f.title}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)", maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.who}</div>
                  </td>
                  <td style={td}>{f.tag}</td>
                  <td style={td}>
                    <span style={chipStyle(f.category === "academy" ? "#FFE4E4" : "#E3F2FD", f.category === "academy" ? "#B71C1C" : "#0D47A1")}>
                      {f.category}
                    </span>
                  </td>
                  <td style={td}>
                    <input type="checkbox" checked={f.active} onChange={() => updateClassFormat({ id: f._id, active: !f.active })} disabled={!isAdmin} />
                  </td>
                  <td style={td}>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(f)} style={actionBtnStyle}>Edit</button>
                        <button onClick={() => handleDelete(f)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>Hide</button>
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
              {editTarget ? "Edit Class Format" : "Add Class Format"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Title" required>
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="FIIT Hybrid" />
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                <Field label="Number" hint='"01"-style card number'>
                  <input type="text" value={form.num} onChange={(e) => setForm({ ...form, num: e.target.value })} style={inputStyle} placeholder="01" />
                </Field>
                <Field label="Tag" required hint="Eyebrow label">
                  <input type="text" value={form.tag} onChange={(e) => setForm({ ...form, tag: e.target.value })} style={inputStyle} placeholder="Hybrid" />
                </Field>
                <Field label="Category">
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
                    <option value="fiit">FIIT</option>
                    <option value="academy">Boxing Academy</option>
                  </select>
                </Field>
                <Field label="Order">
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <Field label="Slug" hint="URL slug. Auto-generated from title if blank.">
                <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} style={inputStyle} placeholder={form.title ? slugify(form.title) : "class-slug"} />
              </Field>

              <Field label="Includes / Bullet Points" hint="One per line. Shown as bulleted list on the card.">
                <textarea value={form.includesText} onChange={(e) => setForm({ ...form, includesText: e.target.value })} style={{ ...inputStyle, minHeight: 100, resize: "vertical", fontFamily: "monospace", fontSize: 13 }} placeholder="Boxing drills&#10;4 functional rounds&#10;Race-inspired format&#10;Team energy" />
              </Field>

              <Field label="Who It's For / Tagline" required hint="One-line description under the bullets.">
                <textarea value={form.who} onChange={(e) => setForm({ ...form, who: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Playfully known as Hybox: boxing drills meet functional stations over four rounds." />
              </Field>

              <Field label="Image">
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {form.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={form.imageUrl} alt="" style={{ width: 140, height: 90, borderRadius: 6, objectFit: "cover" }} />
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePhotoUpload(f); }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ ...actionBtnStyle, padding: "8px 14px" }}>
                    {uploading ? "Uploading…" : form.imageUrl ? "Replace Image" : "Upload Image"}
                  </button>
                  {form.imageUrl && (
                    <button onClick={() => { pendingStorageIdRef.current = null; setForm({ ...form, imageUrl: "" }); }} style={{ ...actionBtnStyle, padding: "8px 14px", color: "#B71C1C" }}>Remove</button>
                  )}
                </div>
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Class"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (<div style={{ padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", minWidth: 140 }}>
    <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text-main)" }}>{value}</div>
    <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{label}</div>
  </div>);
}
function StatusBanner({ msg }: { msg: { type: "ok" | "err"; text: string } }) {
  return <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 14, background: msg.type === "ok" ? "#E8F5E9" : "#FFEBEE", color: msg.type === "ok" ? "#1B5E20" : "#B71C1C", border: `1px solid ${msg.type === "ok" ? "#A5D6A7" : "#EF9A9A"}` }}>{msg.text}</div>;
}
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (<div>
    <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-main)", marginBottom: 6 }}>{label}{required && <span style={{ color: "#D92B2B", marginLeft: 4 }}>*</span>}</label>
    {children}
    {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>}
  </div>);
}
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff" };
const actionBtnStyle: React.CSSProperties = { padding: "6px 12px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "var(--text-main)" };
function reorderBtnStyle(disabled: boolean): React.CSSProperties { return { ...actionBtnStyle, padding: "4px 8px", opacity: disabled ? 0.3 : 1, cursor: disabled ? "not-allowed" : "pointer" }; }
function primaryBtnStyle(saving: boolean): React.CSSProperties { return { padding: "10px 20px", background: "var(--ui-dark, #1E1812)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }; }
function chipStyle(bg: string, fg: string): React.CSSProperties { return { fontSize: 11, padding: "3px 8px", borderRadius: 10, background: bg, color: fg, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }; }
const th: React.CSSProperties = { textAlign: "left", padding: "14px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, color: "var(--text-main)", verticalAlign: "middle" };
const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalInnerStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 32, maxWidth: 780, width: "100%", maxHeight: "90vh", overflow: "auto" };
