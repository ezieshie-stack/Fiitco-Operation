"use client";

/**
 * Website FAQ admin — manages the "You've Got Questions" Q&A section
 * shown on the homepage of the customer website.
 */

import { useState } from "react";
import { useAuthedQuery as useQuery, useAuthedMutation as useMutation } from "@/hooks/useAuthedConvex";
import { api } from "../../../../convex/_generated/api";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useAuth } from "@/contexts/AuthContext";
import { useRequireAdmin } from "@/hooks/useRequireAdmin";

type FaqEntry = {
  _id: Id<"faqEntries">;
  question: string;
  answer: string;
  displayOrder: number;
  active: boolean;
};

type FormState = { question: string; answer: string; displayOrder: string };
const emptyForm = (): FormState => ({ question: "", answer: "", displayOrder: "99" });

export default function WebsiteFaqPage() {
  const { ready } = useRequireAdmin();
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === "admin";

  const faqs = useQuery(api.websiteContent.listFaqEntries);
  const createFaqEntry = useMutation(api.websiteContent.createFaqEntry);
  const updateFaqEntry = useMutation(api.websiteContent.updateFaqEntry);
  const deleteFaqEntry = useMutation(api.websiteContent.deleteFaqEntry);
  const reorderFaqEntries = useMutation(api.websiteContent.reorderFaqEntries);

  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<FaqEntry | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const activeCount = faqs?.filter((f) => f.active).length ?? 0;
  const inactiveCount = faqs?.filter((f) => !f.active).length ?? 0;

  function openAdd() { setEditTarget(null); setForm(emptyForm()); setShowModal(true); }
  function openEdit(f: FaqEntry) {
    setEditTarget(f);
    setForm({ question: f.question, answer: f.answer, displayOrder: String(f.displayOrder) });
    setShowModal(true);
  }
  function closeModal() { setShowModal(false); setEditTarget(null); setForm(emptyForm()); }

  async function handleSave() {
    if (!form.question.trim() || !form.answer.trim()) {
      setStatusMsg({ type: "err", text: "Question and answer are required" });
      return;
    }
    if (!isAdmin) return;
    setSaving(true);
    try {
      const base = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        displayOrder: Number(form.displayOrder) || 99,
      };
      if (editTarget) await updateFaqEntry({ id: editTarget._id, ...base });
      else await createFaqEntry(base);
      setStatusMsg({ type: "ok", text: "Saved ✓" });
      closeModal();
      setTimeout(() => setStatusMsg(null), 2500);
    } catch (err) {
      setStatusMsg({ type: "err", text: err instanceof Error ? err.message : "Save failed" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(f: FaqEntry) {
    if (!isAdmin) return;
    if (!window.confirm(`Hide this question from the website?`)) return;
    await deleteFaqEntry({ id: f._id });
    setStatusMsg({ type: "ok", text: "Question hidden" });
    setTimeout(() => setStatusMsg(null), 2500);
  }

  async function handleMove(f: FaqEntry, dir: "up" | "down") {
    if (!faqs || !isAdmin) return;
    const sorted = [...faqs].sort((a, b) => a.displayOrder - b.displayOrder);
    const i = sorted.findIndex((x) => x._id === f._id);
    const j = dir === "up" ? i - 1 : i + 1;
    if (i === -1 || j < 0 || j >= sorted.length) return;
    [sorted[i], sorted[j]] = [sorted[j], sorted[i]];
    await reorderFaqEntries({ orderedIds: sorted.map((x) => x._id) });
  }

  // Admin-only — redirect instructors away from this page.
  if (!ready) return null;

  return (
    <div style={{ padding: "40px", maxWidth: 1200 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
        <div>
          <h1 className="font-serif" style={{ fontSize: 36, fontWeight: 500, margin: 0, color: "var(--text-main)" }}>
            Website FAQ
          </h1>
          <p style={{ marginTop: 8, color: "var(--text-muted)", fontSize: 14 }}>
            Homepage FAQ entries (&quot;You&apos;ve Got Questions&quot; section).
          </p>
        </div>
        {isAdmin && <button onClick={openAdd} style={primaryBtnStyle(false)}>+ Add Question</button>}
      </div>

      <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
        <StatCard label="Active" value={activeCount} />
        <StatCard label="Hidden" value={inactiveCount} />
      </div>

      {statusMsg && <StatusBanner msg={statusMsg} />}

      {faqs === undefined ? (
        <p>Loading…</p>
      ) : faqs.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No FAQ entries yet.</p>
      ) : (
        <div style={{ background: "#fff", borderRadius: 12, border: "1px solid rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#F9F5F0", borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
                <th style={th}>Order</th>
                <th style={th}>Question</th>
                <th style={th}>Answer</th>
                <th style={th}>Active</th>
                <th style={th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...faqs].sort((a, b) => a.displayOrder - b.displayOrder).map((f, i, arr) => (
                <tr key={f._id} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)", opacity: f.active ? 1 : 0.5 }}>
                  <td style={td}>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button disabled={i === 0 || !isAdmin} onClick={() => handleMove(f, "up")} style={reorderBtnStyle(i === 0 || !isAdmin)}>↑</button>
                      <button disabled={i === arr.length - 1 || !isAdmin} onClick={() => handleMove(f, "down")} style={reorderBtnStyle(i === arr.length - 1 || !isAdmin)}>↓</button>
                    </div>
                  </td>
                  <td style={{ ...td, maxWidth: 280 }}>
                    <div style={{ fontWeight: 500 }}>{f.question}</div>
                  </td>
                  <td style={{ ...td, maxWidth: 520 }}>
                    <div style={{ fontSize: 13, color: "var(--text-muted)", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                      {f.answer}
                    </div>
                  </td>
                  <td style={td}>
                    <input type="checkbox" checked={f.active} onChange={() => updateFaqEntry({ id: f._id, active: !f.active })} disabled={!isAdmin} />
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
              {editTarget ? "Edit Question" : "Add Question"}
            </h2>

            <div style={{ display: "grid", gap: 16 }}>
              <Field label="Question" required>
                <textarea value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} placeholder="Do I need boxing or fight training experience to take a class?" />
              </Field>
              <Field label="Answer" required hint="Multi-line. Shown as a paragraph under the question.">
                <textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} style={{ ...inputStyle, minHeight: 160, resize: "vertical" }} placeholder="Absolutely not. Our classes are designed for all levels..." />
              </Field>
              <Field label="Display Order">
                <input type="number" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} style={{ ...inputStyle, maxWidth: 160 }} />
              </Field>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 32 }}>
              <button onClick={closeModal} style={{ ...actionBtnStyle, padding: "10px 20px" }}>Cancel</button>
              <button onClick={handleSave} disabled={saving} style={primaryBtnStyle(saving)}>
                {saving ? "Saving…" : editTarget ? "Save Changes" : "Add Question"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared helpers
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
const td: React.CSSProperties = { padding: "14px 16px", fontSize: 14, color: "var(--text-main)", verticalAlign: "top" };
const modalOverlayStyle: React.CSSProperties = { position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 20 };
const modalInnerStyle: React.CSSProperties = { background: "#fff", borderRadius: 12, padding: 32, maxWidth: 780, width: "100%", maxHeight: "90vh", overflow: "auto" };
