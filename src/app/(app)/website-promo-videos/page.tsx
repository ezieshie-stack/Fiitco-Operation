"use client";

/**
 * Website Promo Videos admin — manages the scroll-to-autoplay YouTube
 * embeds placed into named slots across the customer website.
 *
 * Slot naming: "<page>:<position>" — e.g. "home:after-testimonials".
 * The fiit-website has a <PromoSlot name="..."/> component at each of
 * these positions; editing here pushes changes live within ~60 seconds
 * (homepage uses client-side useQuery so it's ~1 second).
 */

import { useState } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type PromoVideo = {
  _id: Id<"promoVideos">;
  title: string;
  youtubeId: string;
  pageSlot: string;
  headline?: string;
  subheadline?: string;
  displayOrder: number;
  active: boolean;
};

// Predefined slots per page — keep in sync with <PromoSlot/> placements
// on fiit-website. When adding a new slot, also add it to the website side.
const SLOT_OPTIONS: { page: string; value: string; label: string }[] = [
  // ── Home ─────────────────────────────────────────────────────────────
  { page: "Home",        value: "home:after-hero",         label: "After hero / marquee" },
  { page: "Home",        value: "home:after-schedule",     label: "After schedule widget" },
  { page: "Home",        value: "home:after-pillars",      label: "After Three Pillars" },
  { page: "Home",        value: "home:after-team",         label: "After Team showcase" },
  { page: "Home",        value: "home:after-testimonials", label: "After testimonials (default promo)" },
  { page: "Home",        value: "home:after-stats",        label: "After stats row" },
  { page: "Home",        value: "home:after-faq",          label: "After FAQ" },
  // ── About ────────────────────────────────────────────────────────────
  { page: "About",       value: "about:after-hero",        label: "After hero" },
  { page: "About",       value: "about:after-story",       label: "After 'The Story'" },
  { page: "About",       value: "about:after-team",        label: "After team section" },
  // ── Programs ─────────────────────────────────────────────────────────
  { page: "Programs",    value: "programs:after-hero",         label: "After hero" },
  { page: "Programs",    value: "programs:after-classes",      label: "After class formats" },
  { page: "Programs",    value: "programs:after-memberships",  label: "After memberships (A)" },
  { page: "Programs",    value: "programs:after-kids",         label: "After kids (A.3)" },
  { page: "Programs",    value: "programs:after-pt",           label: "After personal training (C)" },
  { page: "Programs",    value: "programs:after-academy",      label: "After Boxing Academy (D)" },
  // ── Studio ───────────────────────────────────────────────────────────
  { page: "Studio",      value: "studio:after-hero",       label: "After hero" },
  { page: "Studio",      value: "studio:after-location",   label: "After location block" },
  { page: "Studio",      value: "studio:after-gallery",    label: "After gallery" },
  { page: "Studio",      value: "studio:after-equipment",  label: "After equipment list" },
  // ── Community ────────────────────────────────────────────────────────
  { page: "Community",   value: "community:after-hero",          label: "After hero" },
  { page: "Community",   value: "community:after-collaborators", label: "After collaborators" },
  // ── Journal ──────────────────────────────────────────────────────────
  { page: "Journal",     value: "journal:after-hero",      label: "After hero" },
];

type FormState = {
  title: string;
  youtubeInput: string;
  pageSlot: string;
  headline: string;
  subheadline: string;
  displayOrder: string;
};

const emptyForm = (): FormState => ({
  title: "", youtubeInput: "", pageSlot: "home:after-testimonials",
  headline: "", subheadline: "", displayOrder: "99",
});

/**
 * Extract a YouTube video ID from any of the common URL shapes Arden might
 * paste: https://youtu.be/ID, https://www.youtube.com/watch?v=ID,
 * https://www.youtube.com/embed/ID, or just the bare ID.
 */
function extractYoutubeId(input: string): string | null {
  const s = input.trim();
  if (!s) return null;
  // Bare 11-char id
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  // youtu.be short link
  const short = s.match(/youtu\.be\/([A-Za-z0-9_-]{11})/);
  if (short) return short[1];
  // youtube.com/watch?v=ID
  const watch = s.match(/[?&]v=([A-Za-z0-9_-]{11})/);
  if (watch) return watch[1];
  // youtube.com/embed/ID
  const embed = s.match(/embed\/([A-Za-z0-9_-]{11})/);
  if (embed) return embed[1];
  return null;
}

export default function WebsitePromoVideosPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const videos = useQuery(api.websiteContent.listPromoVideos);
  const createPromoVideo = useMutation(api.websiteContent.createPromoVideo);
  const updatePromoVideo = useMutation(api.websiteContent.updatePromoVideo);
  const deletePromoVideo = useMutation(api.websiteContent.deletePromoVideo);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<PromoVideo | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const activeCount = videos?.filter((v) => v.active).length ?? 0;
  const inactiveCount = videos?.filter((v) => !v.active).length ?? 0;
  const slotsInUse = new Set(videos?.filter((v) => v.active).map((v) => v.pageSlot)).size;

  function openAdd() { setEditTarget(null); setForm(emptyForm()); setShowModal(true); }
  function openEdit(v: PromoVideo) {
    setEditTarget(v);
    setForm({
      title: v.title,
      youtubeInput: `https://youtu.be/${v.youtubeId}`,
      pageSlot: v.pageSlot,
      headline: v.headline ?? "",
      subheadline: v.subheadline ?? "",
      displayOrder: String(v.displayOrder),
    });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditTarget(null); setForm(emptyForm()); }

  async function handleSave() {
    if (!form.title.trim()) {
      setStatusMsg({ type: "err", text: "Title is required" });
      return;
    }
    const ytId = extractYoutubeId(form.youtubeInput);
    if (!ytId) {
      setStatusMsg({ type: "err", text: "Could not extract a YouTube ID from that URL" });
      return;
    }
    if (!isAdmin) return;

    setSaving(true);
    try {
      const base = {
        title: form.title.trim(),
        youtubeId: ytId,
        pageSlot: form.pageSlot,
        ...(form.headline.trim() ? { headline: form.headline.trim() } : {}),
        ...(form.subheadline.trim() ? { subheadline: form.subheadline.trim() } : {}),
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editTarget) {
        await updatePromoVideo({ id: editTarget._id, ...base });
      } else {
        await createPromoVideo(base);
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

  async function handleDelete(v: PromoVideo) {
    if (!isAdmin) return;
    if (!window.confirm(`Hide "${v.title}" from the website?`)) return;
    await deletePromoVideo({ id: v._id });
    setStatusMsg({ type: "ok", text: `Hidden: ${v.title}` });
    setTimeout(() => setStatusMsg(null), 2500);
  }

  const slotLabel = (slot: string): string =>
    SLOT_OPTIONS.find((s) => s.value === slot)?.label ?? slot;

  const slotPage = (slot: string): string =>
    SLOT_OPTIONS.find((s) => s.value === slot)?.page ?? slot.split(":")[0];

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Promo Videos
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            YouTube videos embedded into named slots across the customer website. Scroll-into-view autoplay (muted).
          </p>
        </div>
        {isAdmin && <button onClick={openAdd} style={primaryBtnStyle(false)}>+ Add Promo Video</button>}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="Active" value={activeCount} />
        <StatCard label="Slots In Use" value={slotsInUse} />
        <StatCard label="Hidden" value={inactiveCount} />
      </div>

      {statusMsg && <StatusBanner msg={statusMsg} />}

      {videos === undefined ? (
        <p>Loading…</p>
      ) : videos.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No promo videos yet.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th style={th}>Thumbnail</th>
                <th style={th}>Title</th>
                <th style={th}>YouTube</th>
                <th style={th}>Page</th>
                <th style={th}>Slot</th>
                <th style={th}>Active</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {videos.map((v) => (
                <tr key={v._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: v.active ? 1 : 0.5 }}>
                  <td style={td}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={`https://img.youtube.com/vi/${v.youtubeId}/default.jpg`}
                      alt=""
                      style={{ width: 80, height: 45, borderRadius: 4, objectFit: "cover", background: "#000" }}
                    />
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{v.title}</div>
                    {v.headline && (
                      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                        H: {v.headline.split("\n")[0]}{v.headline.includes("\n") ? "…" : ""}
                      </div>
                    )}
                  </td>
                  <td style={td}>
                    <a href={`https://youtu.be/${v.youtubeId}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: "monospace", fontSize: 12, color: "#0A66C2" }}>
                      {v.youtubeId}
                    </a>
                  </td>
                  <td style={td}>
                    <span style={chipStyle("#E3F2FD", "#0D47A1")}>{slotPage(v.pageSlot)}</span>
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{slotLabel(v.pageSlot)}</span>
                  </td>
                  <td style={td}>
                    <input type="checkbox" checked={v.active} onChange={() => updatePromoVideo({ id: v._id, active: !v.active })} disabled={!isAdmin} />
                  </td>
                  <td style={td}>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(v)} style={actionBtnStyle}>Edit</button>
                        <button onClick={() => handleDelete(v)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>Hide</button>
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
              {editTarget ? "Edit Promo Video" : "Add Promo Video"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Title" required hint="Internal label — not shown on the website. Used to identify the video in the admin.">
                <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} placeholder="Summer Intro Promo 2026" />
              </Field>

              <Field label="YouTube URL or ID" required hint="Paste a youtu.be or youtube.com link — we extract the ID automatically.">
                <input type="text" value={form.youtubeInput} onChange={(e) => setForm({ ...form, youtubeInput: e.target.value })} style={inputStyle} placeholder="https://youtu.be/EQ3KwKC5Ec8" />
                {form.youtubeInput && (() => {
                  const id = extractYoutubeId(form.youtubeInput);
                  return id ? (
                    <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={`https://img.youtube.com/vi/${id}/default.jpg`} alt="" style={{ width: 80, height: 45, borderRadius: 4, background: "#000" }} />
                      <span style={{ fontSize: 12, color: "#1B5E20" }}>✓ Detected ID: <strong style={{ fontFamily: "monospace" }}>{id}</strong></span>
                    </div>
                  ) : (
                    <div style={{ marginTop: 6, fontSize: 12, color: "#B71C1C" }}>⚠ Couldn&apos;t detect a YouTube ID in that input.</div>
                  );
                })()}
              </Field>

              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16 }}>
                <Field label="Page & Position" required hint="Where on the customer website this video appears.">
                  <select value={form.pageSlot} onChange={(e) => setForm({ ...form, pageSlot: e.target.value })} style={inputStyle}>
                    {SLOT_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.page} · {s.label}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Display Order" hint="For multiple videos in same slot. Lower = first.">
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <Field label="Headline" hint="Shown above the video. Leave blank to hide. Use \n for line break.">
                <textarea value={form.headline} onChange={(e) => setForm({ ...form, headline: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="See FIIT Co.&#10;In Action." />
              </Field>

              <Field label="Subheadline" hint="Short description below the headline.">
                <input type="text" value={form.subheadline} onChange={(e) => setForm({ ...form, subheadline: e.target.value })} style={inputStyle} placeholder="A minute inside the studio. The floor, the coaches, the community." />
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Promo Video"}
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
function chipStyle(bg: string, fg: string): React.CSSProperties { return { fontSize: 11, padding: "3px 8px", borderRadius: 10, background: bg, color: fg, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }; }
const th: React.CSSProperties = { textAlign: "left", padding: "14px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, color: "var(--text-main)", verticalAlign: "middle" };
const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalInnerStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 32, maxWidth: 720, width: "100%", maxHeight: "90vh", overflow: "auto" };
