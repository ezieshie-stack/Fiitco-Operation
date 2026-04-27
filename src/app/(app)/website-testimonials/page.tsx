"use client";

/**
 * Website Testimonials admin — manages member quotes shown in the
 * "Members Talk" section on the homepage of the customer website.
 */

import { useState } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type Testimonial = {
  _id: Id<"testimonials">;
  firstName: string;
  lastInitial: string;
  role?: string;
  rating: number;
  text: string;
  source?: string;
  displayOrder: number;
  active: boolean;
};

type FormState = {
  firstName: string;
  lastInitial: string;
  role: string;
  rating: string;
  text: string;
  source: string;
  displayOrder: string;
};

const emptyForm = (): FormState => ({
  firstName: "", lastInitial: "", role: "Member",
  rating: "5", text: "", source: "Google Review",
  displayOrder: "99",
});

export default function WebsiteTestimonialsPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const testimonials = useQuery(api.websiteContent.listTestimonials);
  const createTestimonial = useMutation(api.websiteContent.createTestimonial);
  const updateTestimonial = useMutation(api.websiteContent.updateTestimonial);
  const deleteTestimonial = useMutation(api.websiteContent.deleteTestimonial);
  const reorderTestimonials = useMutation(api.websiteContent.reorderTestimonials);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<Testimonial | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const activeCount = testimonials?.filter((t) => t.active).length ?? 0;
  const inactiveCount = testimonials?.filter((t) => !t.active).length ?? 0;
  const avgRating = testimonials && testimonials.length > 0
    ? (testimonials.reduce((sum, t) => sum + t.rating, 0) / testimonials.length).toFixed(1)
    : "—";

  function openAdd() {
    setEditTarget(null);
    setForm(emptyForm());
    setShowModal(true);
  }

  function openEdit(t: Testimonial) {
    setEditTarget(t);
    setForm({
      firstName: t.firstName,
      lastInitial: t.lastInitial,
      role: t.role ?? "",
      rating: String(t.rating),
      text: t.text,
      source: t.source ?? "",
      displayOrder: String(t.displayOrder),
    });
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditTarget(null);
    setForm(emptyForm());
  }

  async function handleSave() {
    if (!form.firstName.trim() || !form.lastInitial.trim() || !form.text.trim()) {
      setStatusMsg({ type: "err", text: "First name, last initial, and text are required" });
      return;
    }
    if (!isAdmin) return;
    setSaving(true);
    try {
      const rating = Math.max(1, Math.min(5, Number(form.rating) || 5));
      const base = {
        firstName: form.firstName.trim(),
        lastInitial: form.lastInitial.trim().charAt(0).toUpperCase(),
        ...(form.role.trim() ? { role: form.role.trim() } : {}),
        rating,
        text: form.text.trim(),
        ...(form.source.trim() ? { source: form.source.trim() } : {}),
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editTarget) {
        await updateTestimonial({ id: editTarget._id, ...base });
      } else {
        await createTestimonial(base);
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

  async function handleDelete(t: Testimonial) {
    if (!isAdmin) return;
    if (!window.confirm(`Hide "${t.firstName} ${t.lastInitial}." from the website?`)) return;
    await deleteTestimonial({ id: t._id });
    setStatusMsg({ type: "ok", text: `Hidden: ${t.firstName} ${t.lastInitial}.` });
    setTimeout(() => setStatusMsg(null), 2500);
  }

  async function handleMove(t: Testimonial, dir: "up" | "down") {
    if (!testimonials || !isAdmin) return;
    const sorted = [...testimonials].sort((a, b) => a.displayOrder - b.displayOrder);
    const i = sorted.findIndex((x) => x._id === t._id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    await reorderTestimonials({ orderedIds: sorted.map((x) => x._id) });
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website Testimonials
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Member quotes shown in the &quot;Members Talk&quot; section on the homepage.
          </p>
        </div>
        {isAdmin && (
          <button onClick={openAdd} style={primaryBtnStyle(false)}>+ Add Testimonial</button>
        )}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="Active" value={activeCount} />
        <StatCard label="Hidden" value={inactiveCount} />
        <StatCard label="Avg Rating" value={`${avgRating} ★`} />
      </div>

      {statusMsg && <StatusBanner msg={statusMsg} />}

      {testimonials === undefined ? (
        <p>Loading…</p>
      ) : testimonials.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No testimonials yet.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th style={th}>Order</th>
                <th style={th}>Member</th>
                <th style={th}>Rating</th>
                <th style={th}>Quote</th>
                <th style={th}>Source</th>
                <th style={th}>Active</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...testimonials].sort((a, b) => a.displayOrder - b.displayOrder).map((t, i, arr) => (
                <tr key={t._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: t.active ? 1 : 0.5 }}>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button disabled={i === 0 || !isAdmin} onClick={() => handleMove(t, "up")} style={reorderBtnStyle(i === 0 || !isAdmin)}>↑</button>
                      <button disabled={i === arr.length - 1 || !isAdmin} onClick={() => handleMove(t, "down")} style={reorderBtnStyle(i === arr.length - 1 || !isAdmin)}>↓</button>
                    </div>
                  </td>
                  <td style={td}>
                    <div style={{ fontWeight: 500 }}>{t.firstName} {t.lastInitial}.</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.role ?? "—"}</div>
                  </td>
                  <td style={td}><span style={{ color: "#F9A825" }}>{"★".repeat(t.rating)}</span></td>
                  <td style={{ ...td, maxWidth: 420 }}>
                    <div style={{ fontSize: 13, color: "var(--text-main)", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {t.text}
                    </div>
                  </td>
                  <td style={td}>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.source ?? "—"}</span>
                  </td>
                  <td style={td}>
                    <input type="checkbox" checked={t.active} onChange={() => updateTestimonial({ id: t._id, active: !t.active })} disabled={!isAdmin} />
                  </td>
                  <td style={td}>
                    {isAdmin && (
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={() => openEdit(t)} style={actionBtnStyle}>Edit</button>
                        <button onClick={() => handleDelete(t)} style={{ ...actionBtnStyle, color: "#B71C1C" }}>Hide</button>
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
              {editTarget ? "Edit Testimonial" : "Add Testimonial"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 2fr", gap: 12 }}>
                <Field label="First Name" required>
                  <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} style={inputStyle} placeholder="Ahmed" />
                </Field>
                <Field label="Last Initial" required>
                  <input type="text" value={form.lastInitial} onChange={(e) => setForm({ ...form, lastInitial: e.target.value.slice(0, 1).toUpperCase() })} style={inputStyle} placeholder="A" maxLength={1} />
                </Field>
                <Field label="Role" hint="e.g. Member, Member · Parent">
                  <input type="text" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 1fr", gap: 16 }}>
                <Field label="Rating" hint="1–5 stars">
                  <select value={form.rating} onChange={(e) => setForm({ ...form, rating: e.target.value })} style={inputStyle}>
                    <option value="5">5 ★★★★★</option>
                    <option value="4">4 ★★★★</option>
                    <option value="3">3 ★★★</option>
                    <option value="2">2 ★★</option>
                    <option value="1">1 ★</option>
                  </select>
                </Field>
                <Field label="Source" hint="Where the quote came from">
                  <input type="text" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} style={inputStyle} placeholder="Google Review" />
                </Field>
                <Field label="Display Order">
                  <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} style={inputStyle} />
                </Field>
              </div>

              <Field label="Quote" required>
                <textarea value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} style={{ ...inputStyle, minHeight: 140, resize: "vertical" }} placeholder="A welcoming space to exercise with no judgement..." />
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Testimonial"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared helpers (duplicated across CMS pages — cheap abstraction cost,
// keeps each admin page self-contained)
function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div style={{ padding: "16px 20px", background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", minWidth: 140 }}>
      <div style={{ fontSize: 28, fontWeight: 600, color: "var(--text-main)" }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginTop: 4 }}>{label}</div>
    </div>
  );
}
function StatusBanner({ msg }: { msg: { type: "ok" | "err"; text: string } }) {
  return <div style={{ padding: "10px 14px", borderRadius: 6, marginBottom: 16, fontSize: 14, background: msg.type === "ok" ? "#E8F5E9" : "#FFEBEE", color: msg.type === "ok" ? "#1B5E20" : "#B71C1C", border: `1px solid ${msg.type === "ok" ? "#A5D6A7" : "#EF9A9A"}` }}>{msg.text}</div>;
}
function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-main)", marginBottom: 6 }}>{label}{required && <span style={{ color: "#D92B2B", marginLeft: 4 }}>*</span>}</label>
      {children}
      {hint && <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>{hint}</div>}
    </div>
  );
}
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "1px solid rgba(0,0,0,0.15)", borderRadius: 6, fontSize: 14, fontFamily: "inherit", outline: "none", background: "#fff" };
const actionBtnStyle: React.CSSProperties = { padding: "6px 12px", border: "1px solid rgba(0,0,0,0.12)", background: "#fff", borderRadius: 6, fontSize: 13, cursor: "pointer", color: "var(--text-main)" };
function reorderBtnStyle(disabled: boolean): React.CSSProperties { return { ...actionBtnStyle, padding: "4px 8px", opacity: disabled ? 0.3 : 1, cursor: disabled ? "not-allowed" : "pointer" }; }
function primaryBtnStyle(saving: boolean): React.CSSProperties { return { padding: "10px 20px", background: "var(--ui-dark, #1E1812)", color: "#fff", border: "none", borderRadius: 8, fontSize: 14, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }; }
const th: React.CSSProperties = { textAlign: "left", padding: "14px 16px", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.5px", color: "var(--text-muted)", fontWeight: 600 };
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, color: "var(--text-main)", verticalAlign: "middle" };
const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalInnerStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 32, maxWidth: 720, width: "100%", maxHeight: "90vh", overflow: "auto" };
