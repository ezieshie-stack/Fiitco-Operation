"use client";

/**
 * Website Images admin — manages hero backgrounds, studio gallery, and
 * other site-wide imagery not handled by module-specific tables (trainers,
 * blog posts, class formats, etc.).
 *
 * Layout: images grouped by `group` (hero / gallery) and `page` so Arden
 * sees them clustered meaningfully. Each row = one slot. Clicking "Edit"
 * opens an upload form.
 */

import { useState, useRef } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type WebsiteImage = {
  _id: Id<"websiteImages">;
  slot: string;
  label: string;
  group: string;
  page: string;
  imageUrl?: string;
  altText: string;
  displayOrder: number;
  active: boolean;
};

type FormState = {
  slot: string;
  label: string;
  group: string;
  page: string;
  imageUrl: string;
  altText: string;
  displayOrder: string;
};

const emptyForm = (): FormState => ({
  slot: "", label: "", group: "hero", page: "home",
  imageUrl: "", altText: "", displayOrder: "99",
});

const FIIT_WEBSITE_ORIGIN = "https://fiit-website-liart.vercel.app";
function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined;
  if (url.startsWith("http") || url.startsWith("blob:") || url.startsWith("data:")) return url;
  if (url.startsWith("/")) return `${FIIT_WEBSITE_ORIGIN}${url}`;
  return url;
}

export default function WebsiteImagesPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const images = useQuery(api.websiteContent.listWebsiteImages);
  const createWebsiteImage = useMutation(api.websiteContent.createWebsiteImage);
  const updateWebsiteImage = useMutation(api.websiteContent.updateWebsiteImage);
  const deleteWebsiteImage = useMutation(api.websiteContent.deleteWebsiteImage);
  const generateUploadUrl = useMutation(api.websiteContent.generateUploadUrl);

  const [editTarget, setEditTarget] = useState<WebsiteImage | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pendingStorageIdRef = useRef<Id<"_storage"> | null>(null);

  const heroCount = images?.filter((i) => i.group === "hero" && i.active).length ?? 0;
  const galleryCount = images?.filter((i) => i.group === "gallery" && i.active).length ?? 0;

  // Group images for display
  const grouped = images
    ? images.reduce<Record<string, WebsiteImage[]>>((acc, img) => {
        const key = `${img.group}:${img.page}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(img);
        return acc;
      }, {})
    : null;

  function openAdd() { setEditTarget(null); setForm(emptyForm()); setShowModal(true); }
  function openEdit(img: WebsiteImage) {
    setEditTarget(img);
    setForm({
      slot: img.slot, label: img.label, group: img.group, page: img.page,
      imageUrl: img.imageUrl ?? "", altText: img.altText,
      displayOrder: String(img.displayOrder),
    });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditTarget(null); setForm(emptyForm()); pendingStorageIdRef.current = null; }

  async function handleUpload(file: File) {
    if (!isAdmin) return;
    setUploading(true);
    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, { method: "POST", headers: { "Content-Type": file.type }, body: file });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const { storageId } = await res.json();
      if (editTarget) {
        await updateWebsiteImage({ id: editTarget._id, imageStorageId: storageId as Id<"_storage"> });
        setForm((f) => ({ ...f, imageUrl: URL.createObjectURL(file) }));
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
    if (!form.slot.trim() || !form.label.trim()) {
      setStatusMsg({ type: "err", text: "Slot and label are required" });
      return;
    }
    if (!isAdmin) return;
    setSaving(true);
    try {
      const base = {
        slot: form.slot.trim(),
        label: form.label.trim(),
        group: form.group,
        page: form.page,
        altText: form.altText.trim(),
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editTarget) {
        await updateWebsiteImage({
          id: editTarget._id, ...base,
          ...(form.imageUrl && !form.imageUrl.startsWith("blob:") ? { imageUrl: form.imageUrl } : {}),
        });
      } else {
        await createWebsiteImage({
          ...base,
          ...(pendingStorageIdRef.current
            ? { imageStorageId: pendingStorageIdRef.current }
            : form.imageUrl ? { imageUrl: form.imageUrl } : {}),
        });
      }
      setStatusMsg({ type: "ok", text: "Saved ✓" });
      closeModal();
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally { setSaving(false); }
  }

  async function handleDelete(img: WebsiteImage) {
    if (!isAdmin) return;
    if (!window.confirm(`Hide image "${img.label}"? The slot will fall back to its hardcoded default.`)) return;
    await deleteWebsiteImage({ id: img._id });
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Images
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Hero backgrounds + studio gallery. Images in trainer cards, blog covers, class formats etc. are edited in their own admin pages.
          </p>
        </div>
        {isAdmin && <button onClick={openAdd} style={primaryBtnStyle(false)}>+ Add Image Slot</button>}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="Hero Slots" value={heroCount} />
        <StatCard label="Gallery Slots" value={galleryCount} />
      </div>

      {statusMsg && <StatusBanner msg={statusMsg} />}

      {grouped === null ? (
        <p>Loading…</p>
      ) : Object.keys(grouped).length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No image slots yet.</p>
      ) : (
        Object.entries(grouped).map(([key, slots]) => {
          const [group, page] = key.split(":");
          return (
            <div key={key} style={{ marginBottom: 32 }}>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-main)", margin: "0 0 12px 0", textTransform: "capitalize" }}>
                {group} — {page}
              </h3>
              <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                {slots.map((img) => (
                  <div key={img._id} style={{ background: "#fff", border: "1px solid rgba(0,0,0,0.08)", borderRadius: 12, overflow: "hidden", opacity: img.active ? 1 : 0.5 }}>
                    {img.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImageUrl(img.imageUrl)} alt={img.altText} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", aspectRatio: "16/9", background: "#F9F5F0", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 13 }}>
                        No image
                      </div>
                    )}
                    <div style={{ padding: 14 }}>
                      <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 4 }}>{img.label}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)", fontFamily: "monospace", marginBottom: 10 }}>{img.slot}</div>
                      {isAdmin && (
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={() => openEdit(img)} style={{ ...actionBtnStyle, flex: 1 }}>Edit / Replace</button>
                          <button onClick={() => handleDelete(img)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>Hide</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}

      {showModal && (
        <div onClick={closeModal} style={modalOverlayStyle}>
          <div onClick={(e) => e.stopPropagation()} style={modalInnerStyle}>
            <h2 className="font-serif" style={{ fontSize: 24, margin: "0 0 24px", fontWeight: 500 }}>
              {editTarget ? "Edit Image Slot" : "Add Image Slot"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Image" required>
                <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                  {form.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={resolveImageUrl(form.imageUrl)} alt="" style={{ width: 160, height: 90, borderRadius: 6, objectFit: "cover" }} />
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                  <button onClick={() => fileInputRef.current?.click()} disabled={uploading} style={{ ...actionBtnStyle, padding: "8px 14px" }}>
                    {uploading ? "Uploading…" : form.imageUrl ? "Replace" : "Upload"}
                  </button>
                </div>
              </Field>

              <Field label="Alt Text" required hint="Accessibility description + SEO. Describe what's in the image.">
                <textarea value={form.altText} onChange={(e) => setForm({ ...form, altText: e.target.value })} style={{ ...inputStyle, minHeight: 50, resize: "vertical" }} placeholder="FIIT Co. boxing studio training floor in Leslieville Toronto" />
              </Field>

              <details style={{ border: "1px dashed rgba(0,0,0,0.1)", padding: "12px 16px", borderRadius: 6 }}>
                <summary style={{ cursor: "pointer", fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>
                  Advanced (slot ID, grouping) — usually not needed
                </summary>
                <div style={{ marginTop: 12, display: "grid", gap: 12 }}>
                  <Field label="Slot ID" required hint="Unique identifier matching a <LiveImage slot='...'/> on the website.">
                    <input type="text" value={form.slot} onChange={(e) => setForm({ ...form, slot: e.target.value })} style={inputStyle} placeholder="home-hero" readOnly={!!editTarget} />
                  </Field>
                  <Field label="Label" required hint="Human-readable name for this slot.">
                    <input type="text" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} style={inputStyle} placeholder="Homepage Hero Background" />
                  </Field>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                    <Field label="Group">
                      <select value={form.group} onChange={(e) => setForm({ ...form, group: e.target.value })} style={inputStyle}>
                        <option value="hero">Hero</option>
                        <option value="gallery">Gallery</option>
                      </select>
                    </Field>
                    <Field label="Page">
                      <select value={form.page} onChange={(e) => setForm({ ...form, page: e.target.value })} style={inputStyle}>
                        <option value="home">Home</option>
                        <option value="about">About</option>
                        <option value="programs">Programs</option>
                        <option value="studio">Studio</option>
                        <option value="community">Community</option>
                        <option value="blog">Blog</option>
                      </select>
                    </Field>
                    <Field label="Order">
                      <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} style={inputStyle} />
                    </Field>
                  </div>
                </div>
              </details>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
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
function primaryBtnStyle(saving: boolean): React.CSSProperties { return { padding: "10px 20px", background: "var(--ui-dark, #1E1812)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }; }
const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalInnerStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 32, maxWidth: 720, width: "100%", maxHeight: "90vh", overflow: "auto" };
